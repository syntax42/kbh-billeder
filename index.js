'use strict';

// This allows loading of environment variables from a .env file
require('dotenv').config({silent: true});
var config = require('./config');

var express = require('express');
var app = express();

var co = require('collections-online')(config);

app.use('/', co);
