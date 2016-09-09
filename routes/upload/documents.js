var express = require('express');
var router = express.Router();
var loader = require('../../controllers/upload_files')

router.post('/', function(req, res) {
	console.log('uploading video(s)');
	loader.process({ 'type': 'documents', 'req': req}, function() {
		res.send('success');
	}, function(err) {
		console.dir(err);
		res.status(500).send('error');
	});
});

module.exports = router;