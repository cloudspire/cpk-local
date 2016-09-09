var getfile = require('./get_file_contents');
var __ = require('underscore');

module.exports.video_partials = function(callback, error) {
	var cached = default_cache.get('partials');
	if (cached != undefined) {
		callback(cached);
	} else {
		var partials = {}, err = [];
		var finished = __.after(3, function() {
			if (err.length > 0) {
				error(err);
			} else {
				if (cache_flags.partials) {
					console.log("Caching Partials");
					default_cache.set('partials', partials);
				}
				callback(partials);
			}
		});
		getfile.by_group({group: 'partials', file: 'video/header.html'}, function(hdr) {
			partials['header'] = hdr;
			finished();
		}, function(get_err) {
			err.push(get_err);
			finished();
		});
		getfile.by_group({group: 'partials', file: 'video/common_ref.html'}, function(meta) {
			partials['meta'] = meta;
			finished();
		}, function(get_err) {
			err.push(get_err);
			finished();
		});
		getfile.by_group({group: 'partials', file: 'video/aside.html'}, function(meta) {
			partials['aside'] = meta;
			finished();
		}, function(get_err) {
			err.push(get_err);
			finished();
		});
	}
}

module.exports.files_partials = function(callback, error) {
	var cached = default_cache.get('partials');
	if (cached != undefined) {
		callback(cached);
	} else {
		var partials = {}, err = [];
		var finished = __.after(3, function() {
			if (err.length > 0) {
				error(err);
			} else {
				if (cache_flags.partials) {
					console.log("Caching Partials");
					default_cache.set('partials', partials);
				}
				callback(partials);
			}
		});
		getfile.by_group({group: 'partials', file: 'files/header.html'}, function(hdr) {
			partials['header'] = hdr;
			finished();
		}, function(get_err) {
			err.push(get_err);
			finished();
		});
		getfile.by_group({group: 'partials', file: 'files/common_ref.html'}, function(meta) {
			partials['meta'] = meta;
			finished();
		}, function(get_err) {
			err.push(get_err);
			finished();
		});
		getfile.by_group({group: 'partials', file: 'files/aside.html'}, function(meta) {
			partials['aside'] = meta;
			finished();
		}, function(get_err) {
			err.push(get_err);
			finished();
		});
	}
}