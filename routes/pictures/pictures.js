var express = require('express');
var router = express.Router();
var partials = require('../../controllers/ejs_partials');

/* GET home page. */
router.get('/', function(req, res) {
	partials.pictures_partials(function(data) {
		res.render('pictures', {partials: data});
	}, function(err) {
		console.log('Error retrieving partials');
		console.dir(err);
		res.send(err);
	});
});

module.exports = router;
