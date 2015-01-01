var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// Database
var mongo = require('mongoskin');
var db = mongo.db('mongodb://localhost:27017/movie_hound', {native_parser:true});
var multer = require('multer');

var routes = require('./routes/index');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set upload folder
app.use(multer({ 
    dest : './media',
    rename: function (fieldname, filename) {
        return filename;
    },
 }));
// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});
app.get('/', routes.index);
app.get('/alive', routes.alive);
app.get('/image/:path', routes.image);
app.get('/metadata/:movie?', routes.metadata);
app.post('/upload_metadata', routes.upload_metadata);
app.post('/upload_snapshot', routes.upload_snapshot);
app.post('/search', routes.search);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
