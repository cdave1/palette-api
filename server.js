'use strict';

const _ = require('lodash');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const request = require('request');

const PaletteAPI = require('./src/lib');

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.post('/allPalettes', PaletteAPI.ensureAuthenticated, PaletteAPI.allPalettes);
app.post('/getPalette', PaletteAPI.ensureAuthenticated, PaletteAPI.getPalette);
app.post('/random', PaletteAPI.ensureAuthenticated, PaletteAPI.randomPalette);
app.post('/hidePalette', PaletteAPI.ensureAuthenticated, PaletteAPI.hidePalette);
app.post('/insertPalette', PaletteAPI.ensureAuthenticated, PaletteAPI.insertPalette);

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;