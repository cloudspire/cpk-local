var getfile = require('./get_file_contents');
var __ = require('underscore');

module.exports.get_partials = function(callback, error) {
	var partials = {}, err = [];
	var finished = __.after(3, function() {
		if (err.length > 0) {
			error(err);
		} else {
			callback(partials);
		}
	});
	getfile.retrieve({group: 'partials', file: 'header.html'}, function(hdr) {
		partials['header'] = hdr;
		finished();
	}, function(get_err) {
		err.push(get_err);
		finished();
	});
	getfile.retrieve({group: 'partials', file: 'common_ref.html'}, function(meta) {
		partials['meta'] = meta;
		finished();
	}, function(get_err) {
		err.push(get_err);
		finished();
	});
	getfile.retrieve({group: 'partials', file: 'aside.html'}, function(meta) {
		partials['aside'] = meta;
		finished();
	}, function(get_err) {
		err.push(get_err);
		finished();
	});
}