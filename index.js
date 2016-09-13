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

//Pre-Process middleware
app.all('/files/*', function(req, res, next) {
    console.log('validating user');
	next();
});

//Load Middleware Functions
var home = require('./routes/index');
var file_server = require('./routes/files/files');
var files_list = require('./routes/files/files_list');
var video_server = require('./routes/video/video');
var video_list = require('./routes/video/video_list');
var cpk_upload = require('./routes/files/upload');
var new_folder = require('./routes/files/new_folder');
var delete_files = require('./routes/files/delete_files');
var download_files = require('./routes/files/download_files');
var pictures = require('./routes/pictures/pictures');
var pictures_list = require('./routes/pictures/pictures_list');
var music = require('./routes/music/music');
var music_list = require('./routes/music/music_list');

//Route Paths to Middleware
app.use('/', home);
app.use('/files', file_server);
app.use('/files/files_list', files_list);
app.use('/video', video_server);
app.use('/video/video_list', video_list);
app.use('/files/upload', cpk_upload);
app.use('/files/new_folder', new_folder);
app.use('/files/delete_files', delete_files);
app.use('/files/download_files', download_files);
app.use('/pictures', pictures);
app.use('/pictures/pictures_list', pictures_list);
app.use('/music', music);
app.use('/music/music_list', music_list);

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
global.fs_root_dir = path.join(__dirname, '/private/files/dir');

//THIS TELLS NODE TO EXPORT THIS MODULE. SINCE IT IS THE ROOT MODULE, IT WILL FUNCTION AS ENTRY POINT TO SERVER
module.exports = app;
