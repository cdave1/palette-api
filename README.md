# PALETTE API

A simple micro-service for setting up five-color palettes.  The database is stored in a json file and stored in memory while the service runs.  Any changes to the database will be written out to disk.  Designed to be used behind a web application with more robust authentication.

## SETUP

Copy `default.env` to `.env` and set the following variables:

The port on which the micro-service runs:
```
PORT=3002
```

The location of the writeable palette data file:
```
PALETTE_DATA_FILE_PATH='./defaultPaletteDatabase.json'
```

The location of the color names table:
```
PALETTE_COLOR_NAMES_PATH='./defaultColorNames.json'
```

The location of the hard-coded authentication token:
```
HARD_CODED_AUTH_TOKEN='3274470F-64A8-4E20-A32E-C359114350C4
```