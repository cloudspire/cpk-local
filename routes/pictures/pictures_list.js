var express = require('express');
var router = express.Router();
var ls = require('list-directory-contents');
var ejs = require('ejs');
var getfile = require('../../controllers/get_file_contents');

router.get('/', function(req, res) {
	getfile.by_group({group: 'partials', file: 'pictures/pictures_list.html'}, function(html) {
		ls('./public/pictures/pics/', function(err, tree) {
			if (err) {
				res.status(200).send(err);
			} else {
				var files = [];
				tree.forEach(function(file, index) {
					if (file.indexOf('.jpg') != -1 || file.indexOf('.jpeg') != -1 || file.indexOf('.png]') != -1) {
						files.push(file.replace(/\\/g, '/').replace('public/pictures/', ''));
					}
				});
				res.json({
					html: ejs.render(html, {pictures: files})
				});
			}
		});
	}, function(get_err) {
		res.status(200).send(get_err);
	});
});

module.exports = router;