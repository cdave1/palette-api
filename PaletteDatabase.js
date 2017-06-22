'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const dotenv = require('dotenv'); 

dotenv.load();

var Color = require('./color').Color;

var _filtered = null;
var _paletteData = null;
var _colorNames = [];

const constants = {
    Palette: {
        Format : {
            Default: "default",
            Alt: "alt"
        }
    }
};


// http://stackoverflow.com/questions/9018016/how-to-compare-two-colors-for-similarity-difference
function rgb2lab(R, G, B) {
    //http://www.brucelindbloom.com

    var r, g, b, X, Y, Z, fx, fy, fz, xr, yr, zr;
    var Ls, as, bs;
    var eps = 216.0 / 24389.0;
    var k = 24389.0 / 27.0;

    var Xr = 0.964221;  // reference white D50
    var Yr = 1.0;
    var Zr = 0.825211;

    // RGB to XYZ
    r = R / 255.0; //R 0..1
    g = G / 255.0; //G 0..1
    b = B / 255.0; //B 0..1

    // assuming sRGB (D65)
    if (r <= 0.04045)
        r = r / 12;
    else
        r = Math.pow((r + 0.055) / 1.055, 2.4);

    if (g <= 0.04045)
        g = g / 12;
    else
        g = Math.pow((g + 0.055) / 1.055, 2.4);

    if (b <= 0.04045)
        b = b / 12;
    else
        b = Math.pow((b + 0.055) / 1.055, 2.4);


    X = 0.436052025 * r + 0.385081593 * g + 0.143087414 * b;
    Y = 0.222491598 * r + 0.71688606 * g + 0.060621486 * b;
    Z = 0.013929122 * r + 0.097097002 * g + 0.71418547 * b;

    // XYZ to Lab
    xr = X / Xr;
    yr = Y / Yr;
    zr = Z / Zr;

    if (xr > eps)
        fx = Math.pow(xr, 1 / 3.);
    else
        fx = 1.0 * ((k * xr + 16.) / 116.);

    if (yr > eps)
        fy = Math.pow(yr, 1 / 3.);
    else
        fy = 1.0 * ((k * yr + 16.) / 116.);

    if (zr > eps)
        fz = Math.pow(zr, 1 / 3.);
    else
        fz = 1.0 * ((k * zr + 16.) / 116);

    Ls = (116 * fy) - 16;
    as = 500 * (fx - fy);
    bs = 200 * (fy - fz);

    var lab = [];
    lab[0] = (2.55 * Ls + .5);
    lab[1] = (as + .5);
    lab[2] = (bs + .5);
    return lab;
}


/**
 * Computes the difference between two RGB colors by converting them to the L*a*b scale and
 * comparing them using the CIE76 algorithm { http://en.wikipedia.org/wiki/Color_difference#CIE76}
 */
function getColorDifference(colorA, colorB) {
    var r1, g1, b1, r2, g2, b2;
    var lab1 = rgb2lab(colorA.r, colorA.g, colorA.b);
    var lab2 = rgb2lab(colorB.r, colorB.g, colorB.b);
    return Math.sqrt(Math.pow(lab2[0] - lab1[0], 2) + Math.pow(lab2[1] - lab1[1], 2) + Math.pow(lab2[2] - lab1[2], 2));
}


function _getPaletteDatabase() {
    if (!_paletteData) {
        var paletteDataFile = process.env.PALETTE_DATA_FILE_PATH;
        var paletteDataContents = JSON.parse(fs.readFileSync(paletteDataFile, 'utf8'));
        if (_.isArray(paletteDataContents)) {
            _paletteData = paletteDataContents;
        }
    }

    if (_colorNames.length == 0) {
        var colorFileContents = JSON.parse(fs.readFileSync(process.env.PALETTE_COLOR_NAMES_PATH, 'utf8'));
        for (const key of Object.keys(colorFileContents)) {
            var c = new Color(colorFileContents[key]);
            c.name = key;
            _colorNames.push(c);
        }
    }

    return _paletteData;
}


function _writePaletteDatabase() {
    if (_paletteData) {
        var fileContents = JSON.stringify(_paletteData);
        fs.writeFile(process.env.PALETTE_DATA_FILE_PATH, fileContents);
    }
}


function findNearestColor(hex) {
    var color = new Color(hex);
    var nearest = new Color(0, 0, 0, 0);
    var nearestDiff = 1.0;
    for (const candidate of _colorNames) {
        var diff = getColorDifference(candidate, color);
        if (diff < nearestDiff) {
            nearestDiff = diff;
            nearest = candidate;
        }
    }

    return nearest;
}


var PaletteDatabase = {
    upsert: function(opts) {
        var database = _getPaletteDatabase();

        var _id =  _.get(opts, "id", null);
        var _paletteInfo = _.get(opts, "palette", null);
        var _src = _.get(opts, "src", "N/A");
        var _format = _.get(opts, "format", constants.Palette.Format.Default);
        var _rating = _.get(opts, "rating", null);

        if (!_id) {
            throw new Error("An id must be specified.")
        }

        var insert = true;
        var paletteEntry = PaletteDatabase.get({id: _id});
        if (paletteEntry) {
            insert = false;
        } else {
            paletteEntry = {};
            paletteEntry.id = _id;
            paletteEntry.primaryColor = _paletteInfo[0];
            paletteEntry.name = findNearestColor(_paletteInfo[0]).name;
            paletteEntry.src = _src;
            paletteEntry.formats = {};
        }

        if (_paletteInfo && _.isArray(_paletteInfo)) {
            if (paletteEntry.formats) {
                paletteEntry.formats[_format] = {
                    primary:    _paletteInfo[0],
                    secondary:  _paletteInfo[1],
                    tertiary:   _paletteInfo[2],
                    border:     _paletteInfo[3],
                    background: _paletteInfo[4]
                };
            }
        }

        if (_rating && _.isNumber(_rating)) {
            _rating = _.clamp(_rating, 0.0, 5.0);
            paletteEntry.rating = _rating;
        }

        if (insert) {
            database.push(paletteEntry);
        }

        _writePaletteDatabase();

        return paletteEntry;
    },

    all() {
        if (!_filtered) {
            _filtered = _getPaletteDatabase().filter(info => {
                if (info.rating == null || info.rating > 3) {
                    return info;
                }
            });
        } 
        return _filtered;
    },

    random() {
        var database = PaletteDatabase.all();
        return database[_.random(0, database.length - 1)];
    },

    get(query) {
        var database = _getPaletteDatabase();
        if (query.id) {
            for (const item of database) {
                if (item.id === query.id) {
                    return item;
                }
            }
        }
    }
}

module.exports = PaletteDatabase;