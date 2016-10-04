var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var mapping = require('../../controllers/song_map');
var getfile = require('../../controllers/get_file_contents');

router.get('/', function(req, res) {
	getfile.by_group({group: 'partials', file: 'music/track_list.html'}, function(html) {
		mapping.get_data(function(music_db) {
			var keys = Object.keys(music_db);
			var new_html = ejs.render(html, {tracks: music_db, keys: keys});
			res.json({html: new_html, data: music_db});
		}, function(err) {
			console.dir(err);
			res.status(500).send('error');
		});		
	}, function(get_err) {
		res.status(200).send(get_err);
	});
});

module.exports = router;