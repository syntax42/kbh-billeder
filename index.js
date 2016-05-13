'use strict';

// This allows loading of environment variables from a .env file
require('dotenv').config({silent: true});

var express = require('express');
var app = express();

var co = require('collections-online');

app.use('/', co);
