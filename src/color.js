'use strict';

// modified from http://stackoverflow.com/a/5624139
function hex2rgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255.0,
        g: parseInt(result[2], 16) / 255.0,
        b: parseInt(result[3], 16) / 255.0,
        a: 1.0
    } : {
        r: 0, g: 0, b:0, a: 0
    };
};

class Color {
    constructor() {
        if (arguments.length == 0) {
            this.r = 1.0;
            this.g = 1.0;
            this.b = 1.0;
            this.a = 1.0;
        } else if (arguments.length == 1) {
            this._constructHex(arguments[0]);
        } else if (arguments.length == 3) {
            this._constructRGB(arguments[0], arguments[1], arguments[2]);
        } else if (arguments.length == 4) {
            this._constructRGB(arguments[0], arguments[1], arguments[2], arguments[3]);
        }
        this._name = "Unnamed color";
    }

    set name(_name) {
        this._name = _name;
    }

    get name() {
        return this._name;
    }

    // Pseudo private constructors.
    _constructHex(hex) {
        var result = hex2rgb(hex);
        this.r = result.r;
        this.g = result.g;
        this.b = result.b;
        this.a = result.a;
    }

    _constructRGB(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = 1.0;        
    }

    _constructRGBA(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}

exports.Color = Color;