var express = require('express');
var router = express.Router();
var ls = require('list-directory-contents');
var ejs = require('ejs');
var __ = require('underscore');
var getfile = require('../../controllers/get_file_contents');

router.get('/', function(req, res) {
	var files = [], errs = [], html;
	var finished = __.after(5, function() {
		if (errs.length > 0) {
			console.dir(errs);
			res.status(500).send('Error retrieving files.');
		} else {
			res.json({
				files: files,
				html: html
			});
		}
	});
	var add = function(err, tree) {
		if (err) {
			errs.push(err);
			finished();
		} else {
			tree.forEach(function(file, index) {
				if (file.indexOf('.') != -1) {
					files.push(file.replace(/\\/g, '/').replace('private/files/dir/', ''));
				}
			});
			finished();
		}
	}
	ls('./private/files/dir/documents/', function(err, tree) {
		add(err, tree);
	});
	ls('./private/files/dir/videos/', function(err, tree) {
		add(err, tree);
	});
	ls('./private/files/dir/pictures/', function(err, tree) {
		add(err, tree);
	});
	ls('./private/files/dir/music/', function(err, tree) {
		add(err, tree);
	});
	getfile.by_group({group: 'partials', file: 'files/documents.html'}, function(data) {
		html = data;
		finished();
	}, function(err) {
		errs.push(err);
		finished();
	});
});

module.exports = router;