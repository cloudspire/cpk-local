var express = require('express');
var router = express.Router();
var ls = require('list-directory-contents');
var ejs = require('ejs');
var getfile = require('../../controllers/get_file_contents');

router.get('/', function(req, res) {
	getfile.by_group({group: 'partials', file: 'music/track_list.html'}, function(html) {
		var music_db;
		try {
			music_db = jsdb.music.getData('/data');
		} catch (ex) {
			jsdb.music.push('/data', {});
			music_db = jsdb.music.getData('/data');
		}
		var keys = Object.keys(music_db);
		var html = ejs.render(html, {tracks: music_db, keys: keys});
		res.json({html: html, data: music_db});
		
	}, function(get_err) {
		res.status(200).send(get_err);
	});
});

module.exports = router;