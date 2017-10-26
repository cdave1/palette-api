'use strict';

const _ = require('lodash');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const request = require('request');

const PaletteDatabase = require('./PaletteDatabase');


function allPalettes(req, res) {
    var data = PaletteDatabase.all();
    res.send(data);
}


function getPalette(req, res) {
    if (req.body.paletteId) {
        var palette = PaletteDatabase.get({id: req.body.paletteId});
        res.send(palette);
    } else {
        res.send({ error: 'Missing...' });
    }
}


function randomPalette(req, res) {
    res.send(PaletteDatabase.random());
}


function hidePalette(req, res) {
    PaletteDatabase.upsert({ 
        id: message.paletteId,
        rating: 1.0
    });
}


function insertPalette(req, res) {
    if (!req.body.palette) {
        return res.send({ error: 'Missing...' });
    }
    
    if (!_.isArray(req.body.palette)) {
        return res.send({ error: '\"palette\" input should be an array of hex colors.' });
    }

    var responseData = {};
    var paletteData = req.body.palette;
    
    responseData.palette = PaletteDatabase.upsert({
        id: req.body.palette[0],
        palette: req.body.palette,
        format: constants.Palette.Format.Default,
        rating: 5.0
    });

    if (req.body.altPalette && _.isArray(req.body.palette)) {
        responseData.altPalette = PaletteDatabase.upsert({
            id: req.body.palette[0],
            palette: req.body.altPalette,
            format: constants.Palette.Format.Alt
        });
    }

    res.send(responseData);
}


function ensureAuthenticated(req, res, next) {
    req.assert('token', 'Need token').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(errors);
    }

    if (req.body.token && req.body.token === process.env.HARD_CODED_AUTH_TOKEN) {
        next();
    } else {
        res.status(401).send({ msg: 'Unauthorized' });
    }
};


var app = express();
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.post('/allPalettes', ensureAuthenticated, allPalettes);
app.post('/getPalette', ensureAuthenticated, getPalette);
app.post('/random', ensureAuthenticated, randomPalette);
app.post('/hidePalette', ensureAuthenticated, hidePalette);
app.post('/insertPalette', ensureAuthenticated, insertPalette);

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;