var getfile = require('./get_file_contents');
var __ = require('underscore');

module.exports.get_partials = function(callback, error) {
	var cached = default_cache.get('partials');
	if (cached != undefined) {
		callback(cached);
	} else {
		var partials = {}, err = [];
		var finished = __.after(3, function() {
			if (err.length > 0) {
				error(err);
			} else {
				default_cache.set('partials', partials);
				callback(partials);
			}
		});
		getfile.by_group({group: 'partials', file: 'header.html'}, function(hdr) {
			partials['header'] = hdr;
			finished();
		}, function(get_err) {
			err.push(get_err);
			finished();
		});
		getfile.by_group({group: 'partials', file: 'common_ref.html'}, function(meta) {
			partials['meta'] = meta;
			finished();
		}, function(get_err) {
			err.push(get_err);
			finished();
		});
		getfile.by_group({group: 'partials', file: 'aside.html'}, function(meta) {
			partials['aside'] = meta;
			finished();
		}, function(get_err) {
			err.push(get_err);
			finished();
		});
	}
}