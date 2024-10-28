require('dotenv').config();
var express = require('express');
require('./models/connection');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var parentsRouter = require('./routes/parents');
var teachersRouter = require('./routes/teachers');
var kidsRouter = require('./routes/kids');

var app = express();
const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/parents', parentsRouter);
app.use('/teachers', teachersRouter);
app.use('/kids', kidsRouter);

module.exports = app;
