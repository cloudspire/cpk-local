var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var youtube = require('../../controllers/youtube');
var getfiles = require('../../controllers/get_file_contents');
var fs = require('fs');
var url = require('url');
var request = require('request');

router.get('/id', function(req, res) {
	youtube.getVideoByID(req.query.id, function(data) {
		res.json(data);
	}, function(get_err) {
		res.status(500).send(get_err);
	});
});

router.get('/keywords', function(req, res) {
	youtube.getVideosByKeywords(req.query.phrase, function(data) {
		getfiles.by_group({group: 'partials', file: 'music/youtube_search.html'}, function(html) {
			var view = ejs.render(html, data);
			res.send(view);
		}, function(file_err) {
			res.status(500).send(file_err);
		});
	}, function(get_err) {
		res.status(500).send(get_err);
	});
});

router.post('/download', function(req, res) {
	var req_url = req.body.to_url;	
	var curr_dir = __dirname;
	var save_dir = curr_dir.replace('/routes/music', '') + '/private/files/dir/music/';
	if (req.body.fname == null) {

	} else {
		var file_name = req.body.fname.replace(/['"]+/g, '');
		var new_file = save_dir + file_name + '.mp3';

		request.get(req_url).on('error', function(err) {
			console.dir(err);
			res.status(500).send('Error downloading file');
		}).pipe(fs.createWriteStream(new_file)).on('finish', function() {
			console.log('Song downloaded: ' + new_file);
			res.send('download complete');
		});
	}
});

module.exports = router;