'use strict';
var express = require('express');
var co = require('collections-online');

// This allows loading of environment variables from a .env file
require('dotenv').config({silent: true});
// Loading the configuration
var config = require('./config');

// Creating an express app
var app = express();

// Asking collections online to set-up itself
co.initialize(app, config);
