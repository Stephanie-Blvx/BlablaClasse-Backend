require('dotenv').config();
var express = require('express');
require('./models/connection');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/indexPauline');
var postsRouter = require('./routes/posts');
var parentsRouter = require('./routes/parents');
var teachersRouter = require('./routes/teachers');
var kidsRouter = require('./routes/kids');
var eventsRouter = require('./routes/events');
var classesRouter = require('./routes/classes');
var menusRouter = require('./routes/menus');
var actusRouter = require('./routes/actus');




var app = express();
const cors = require('cors');
app.use(cors());

const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Log pour vérifier que les variables d'environnement sont chargées
console.log('JWT_SECRET:', process.env.JWT_SECRET);

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/parents', parentsRouter);
app.use('/teachers', teachersRouter);
app.use('/kids', kidsRouter);
app.use('/events', eventsRouter);
app.use('/classes', classesRouter);
app.use('/menus', menusRouter);
app.use('/actus', actusRouter);

module.exports = app;