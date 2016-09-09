var api_url = 'http://cpk-api.herokuapp.com/';
//var api_url = 'http://localhost:3000/';
var load_data = {
	process: function(qString) {
		var parms = load_data.parseQueryString(qString);
		if (load_data[parms.action] != null) {
			load_data[parms.action](parms);
		}
	},
	parseQueryString: function(qString) {
		var params = {}, queries, temp, i, l;
		// Split into key/value pairs
		queries = qString.split("&");
		// Convert the array of strings into an object
		for ( i = 0, l = queries.length; i < l; i++ ) {
			temp = queries[i].split('=');
			params[temp[0]] = temp[1];
		}
		return params;
	},
	login: function(parms) {
		if (parms.user != null && parms.pass != null) {
			$.ajax({
				url: api_url + "login",
				type: "POST",
				data: {
					email: parms.user,
					password: parms.pass,
					auto: true
				},
				contentType: 'application/x-www-form-urlencoded',
				dataType: 'json',
				success: function (rslt) {
					sessionStorage.auto_login_data = JSON.stringify(rslt);
					document.location.href = server_config.origin;
				},
				error: function (err) {
					console.log(err);
					alert('Error automatically logging in');
					document.location.href = server_config.origin;
				}
			});
		}
	},
	search: function(parms) {
		if (parms.phrase != null) {
			$.ajax({
				type: 'GET',
				url: api_url + 'search/mixed?srch_key=' + parms.phrase + '&plugin=primewire',
				success: function(rslt) {
					var obj = {
						srch: rslt,
						phrase: parms.phrase
					}
					sessionStorage.auto_search = JSON.stringify(obj);
					document.location.href = server_config.origin;
				},
				error: function(err) {
					console.log(err);
					alert('Error searching, please try again.');
					document.location.href = server_config.origin;
				}
			});
		}
	}
}