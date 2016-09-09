navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

var iosocket;
var cpk_sockets = {
	data: {
		signal_server: 'http://cpk-api.herokuapp.com',
		//signal_server: 'http://localhost:3000',
		status: 'disconnected',
		my_path: null,
		partner_id: null,
		partner_path: null
	},
	fn: {
		init: function(act_type) {
			iosocket = io.connect(cpk_sockets.data.signal_server + '/' + act_type);
			iosocket.on('connect', function () {				
				//inbound functions
				iosocket.on('user_path', function(my_path) {
					iosocket.emit('user_connect', { 
						username: sessionStorage.username, 
						path: my_path, 
						device_name: localStorage.device_name,
						token: sessionStorage.token, 
						nonce: sessionStorage.nonce 
					});
					cpk_sockets.data.status = 'connected';
					cpk_sockets.data.my_path = my_path;
				});	
				iosocket.on('online_devices', function(devices) {
					$("#my_dvcnm").text(localStorage.device_name);
					// $("#partner_form").show();
					// $("#partner_devices").show();
					$("#choose_partner").text("choose...");
					cpk_sockets.fn.update_devices(devices);
				});
				iosocket.on('update_devices', cpk_sockets.fn.update_devices);
				iosocket.on('connect_partner', cpk_sockets.fn.connect_partner);
				iosocket.on('receive_link', cpk_sockets.fn.receive_link);
				iosocket.on('receive_msg', cpk_sockets.fn.receive_msg);
				iosocket.on('disconnect', function() {
					iosocket.emit('user_disconnect', { username: sessionStorage.username, device_name: localStorage.device_name, path: cpk_sockets.data.my_path });
				});				
				//outbound functions
				send_msg = function(obj) {
					iosocket.emit('send_msg', obj);
				}				
				//send disconnect notice before page changes
				window.onbeforeunload = function() {
					iosocket.emit('user_disconnect', { username: sessionStorage.username, device_name: localStorage.device_name, path: cpk_sockets.data.my_path });
				}
			});
		},
		update_devices: function(devices) {
			$("#partners").html("");
			var tmp, found = false;
			Object.keys(devices).forEach(function(key, i) {
				if (key != localStorage.device_name) {
					tmp = $('<li path="' + devices[key] + '" style="text-align: center; cursor: pointer;">' + key + '</li>');
					$(tmp).click(function() {
						var obj = {
							dir: 'send',
							sender: cpk_sockets.data.my_path,
							sender_id: localStorage.device_name,
							receiver: devices[key],
							receiver_id: key
						}
						cpk_sockets.fn.connect_partner(obj);
					});
					$("#partners").append(tmp);
					if (key == cpk_sockets.data.partner_id) { found = true; }
				}
			});
			if (!found && cpk_sockets.data.partner_id != null) {
				cpk_sockets.data.partner_id = null;
				cpk_sockets.data.partner_path = null;
				$("#choose_partner").text("choose...");
			}
		},
		connect_partner: function(obj) {
			if (obj.dir == 'send') {
				iosocket.emit('connect_partner', obj);
				cpk_sockets.data.partner_id = obj.receiver_id;
				cpk_sockets.data.partner_path = obj.receiver;
				$("#choose_partner").text(obj.receiver_id);
				$('#partner_form').hide();
			} else {
				cpk_sockets.data.partner_id = obj.sender_id;
				cpk_sockets.data.partner_path = obj.sender;
				$("#choose_partner").text(obj.sender_id);
				$('#partner_form').hide();
			}
		},
		send_to_partner: function() {
			var obj = {
				path: cpk_sockets.data.partner_path,
				data: $(".cpk_external_source").attr('src')
			}
			iosocket.emit('send_link', obj);
		},
		receive_link: function(link) {
			$("#show_controller").hide();
			$(".cpk_external_source").attr('src', link);
			$('div[cpk-control="top_shows"]').hide();
			$('div[cpk-control="search_results"]').hide();
			$('div[cpk-control="show_results"]').hide();
			$('div[cpk-control="episode_results"]').hide();
			$('div[cpk-control="external_link"]').show();
		},
		receive_msg: function(obj) {
			
		}
	}
}