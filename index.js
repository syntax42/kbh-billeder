'use strict';
var express = require('express');

// This allows loading of environment variables from a .env file
require('dotenv').config({silent: true});
// Loading the configuration
var config = require('./config');

// Creating an express app
var app = express();

// Asking collections online to set-up itself
var co = require('collections-online')(app, config);
