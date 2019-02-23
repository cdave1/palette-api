'use strict';

const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const cors = require('cors')
const expressValidator = require('express-validator');
const request = require('request');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

const PaletteAPI = require('./src/lib');

var app = express();
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(awsServerlessExpressMiddleware.eventContext());

app.post('/allPalettes', PaletteAPI.ensureAuthenticated, PaletteAPI.allPalettes);
app.post('/getPalette', PaletteAPI.ensureAuthenticated, PaletteAPI.getPalette);
app.post('/random', PaletteAPI.ensureAuthenticated, PaletteAPI.randomPalette);
app.post('/hidePalette', PaletteAPI.ensureAuthenticated, PaletteAPI.hidePalette);
app.post('/insertPalette', PaletteAPI.ensureAuthenticated, PaletteAPI.insertPalette);

module.exports = app;