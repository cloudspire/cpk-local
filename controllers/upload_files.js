var path = require('path');
var formidable = require('formidable');
var fs = require('fs')

module.exports.process = function(data, callback, error) {
	var form = new formidable.IncomingForm();
	form.multiples = true;
	form.uploadDir = fs_root_dir + data.type;
	var errs = [];

	form.on('file', function(field, file) {
		fs.rename(file.path, path.join(form.uploadDir, file.name));
	});

	form.on('error', function(err) {
		console.log('An error has occured: \n' + err);
		errs.push(err);
	});

	form.on('end', function() {
		if (errs.length > 0) {
			error(errs);
		} else {
			callback();
		}
	});

	form.parse(data.req);
}