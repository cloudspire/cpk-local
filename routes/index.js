var express = require('express');
var router = express.Router();
var partials = require('../controllers/ejs_partials');

/* GET home page. */
router.get('/', function(req, res) {
	partials.get_partials(function(data) {
		res.render('index', {partials: data});
	}, function(err) {
		console.log('Error retrieving partials');
		console.dir(err);
		res.send(err);
	});
});

module.exports = router;
