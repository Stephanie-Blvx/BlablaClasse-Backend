require('dotenv').config();
var express = require('express');
require('./models/connection');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var postsRouter = require('./routes/posts');
var parentsRouter = require('./routes/parents');
var teachersRouter = require('./routes/teachers');
var kidsRouter = require('./routes/kids');
var eventsRouter = require('./routes/events');
var classesRouter = require('./routes/classes');

var app = express();
const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/parents', parentsRouter);
app.use('/teachers', teachersRouter);
app.use('/kids', kidsRouter);
app.use('/events', eventsRouter);
app.use('/classes', classesRouter);
module.exports = app;
