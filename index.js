process.title = "vidstreamer";
var express = require('express');
var path = require('path');
var logger = require('morgan');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var moment = require('moment')();

//EXRPESS IS THE FRAMEWORK FOR CREATING SERVERS
var app = express();
app.set('env', 'development');

// view engine setup
app.set('views', path.join(__dirname, 'view_engine'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//THIS IS REGULAR CONFIGURATION STUFF
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(favicon(__dirname + '/public/favicon.ico'));

//THIS SETS UP A STATIC RESOURCE FOLDER TO ACCESS PUBLIC FILES VIA HTTP
app.use(express.static(path.join(__dirname, 'public')));

//ANY MODULE MATCHING THE ROUTE PREFIX '/' WILL RUN THIS FUNCTION FIRST, AND IF NO ERRORS, WILL CALL THE NEXT FUNCTION
// app.all('/*', function(req, res, next) {
	// next();
// });

//Load Middleware Functions
var home = require('./routes/index');
var file_server = require('./routes/files');
var files_list = require('./routes/files_list');
var video_server = require('./routes/video');
var video_list = require('./routes/video_list');

//Load file-server routes
app.use('/files/upload/videos', require('./routes/upload/video'));
app.use('/files/upload/pictures', require('./routes/upload/pictures'));
app.use('/files/upload/documents', require('./routes/upload/documents'));
app.use('/files/upload/music', require('./routes/upload/music'));

//Route Paths to Middleware
app.use('/', home);
app.use('/files', file_server);
app.use('/files/files_list', files_list);
app.use('/video', video_server);
app.use('/video/video_list', video_list);

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
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

var debug = require('debug')('Scraper_API');

//START SERVER
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
console.log('Application available at port: ' + app.get('port'));

//INITIALIZE GLOBAL CACHE
var NodeCache = require( "node-cache" );
global.default_cache = new NodeCache();
global.cache_flags = {
    partials: false
}
global.fs_root_dir = path.join(__dirname, '/private/files/dir/');

//THIS TELLS NODE TO EXPORT THIS MODULE. SINCE IT IS THE ROOT MODULE, IT WILL FUNCTION AS ENTRY POINT TO SERVER
module.exports = app;
