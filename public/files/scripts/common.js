$(document).ready(function() {
	common.api_url = document.location.origin;
	if (!common.api_url.includes('cpk')) {
		common.api_url = common.api_url + "/files";
	}
	fserve.init();
	select_manager.init();
	$(".aside_link").click(function(event) {
		common.change_page(event);
	});
});

var common = {
	api_url: null,
	current_page: 'videos',
	toggle_aside: function() {
		$("#cpk_aside").toggle('slide');
	},
	change_page: function(event, override) {
		var pg = $(event.currentTarget).attr('link-page');
		common.current_page = pg;
		$("#lbl_page").text(pg);
		fserve.current_dir = pg;
		fserve.current_path = "/" + pg;
		fserve.load_dir();
		$(".full-page").hide();
		$('div[cpk-page="' + pg + '"]').show();
		if (override == null || !override) {
			common.toggle_aside();
		}
	}
}

var select_manager = {
	cntl_enabled: false,
	init: function() {
		$("body").keydown(function(event) {
			if (event.which == 17) {
				select_manager.cntl_enabled = true;
			}
		});
		$("body").keyup(function(event) {
			if (event.which == 17) {
				select_manager.cntl_enabled = false;
			}
		});
	},
	select_file: function(target) {
		//$('.icon-block[block-type="folder"]').removeClass('selected_block');
		var block = $(target).closest('.icon-block');
		if (this.cntl_enabled) {
			this.multiple_select(block);
			return true;
		} else {
			this.single_select(block);
			return false;
		}
	},
	select_folder: function(target) {
		//$('.icon-block[block-type="file"]').removeClass('selected_block');
		var block = $(target).closest('.icon-block');
		if (this.cntl_enabled) {
			this.multiple_select(block);
			return true;
		} else {
			this.single_select(block);
			return false;
		}
	},
	single_select: function(target) {
		var selected = target.hasClass('selected_block');
		$('.icon-block').removeClass('selected_block');
		if (!selected) {
			target.addClass('selected_block');
		}
	},
	multiple_select: function(target) {
		if (target.hasClass('selected_block')) {
			target.removeClass('selected_block');
		} else {
			target.addClass('selected_block');
		}
	}
}