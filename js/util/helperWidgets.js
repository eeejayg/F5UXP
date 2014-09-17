
// $.widget('ui.rightClick', {
// 	_create: function() {
// 		this.element.bind('mousedown touchstart', this._down);
// 	},

// 	_down: function(e) {
// 		if (e.which == 3) {
// 			this.options.callback && this.options.callback.call(this.options.context || this, e);
// 			e.preventDefault();
// 		}
// 	}

// 	_destroy: function() {
// 		this.element.unbind('mousedown touchstart', this._down);
// 	}
// });

$.widget('ui.popupMenu', {
	options: {
		openOnCreate: false,
		modal: true,
		zIndex: 1000
	},

	_init: function() {
		if (this.options.openOnCreate) {
			this.open();
		}
	},

	open: function() {
		var that = this;

		// Create a background div that fills the window and closes the menu when clicked
		this.background = $('<div/>').css({
			position: "absolute",
			top: 0,
			left: 0,
			zIndex: this.options.zIndex,
			width: "100%",
			height: "100%"
		});

		if (this.options.modal) {
			var close = _.bind(this.close, this);
			this.background.click(close);
			this.background.bind("contextmenu", close);
		}

		// Create menu, add it to the background div
		this.menu = $('<ul/>').css({
			position: "absolute",
			top: this.options.position.y,
			left: this.options.position.x
		}).appendTo(this.background);

		var items = this.options.items;

		_.each(items, function(item) {
			var a = $('<a/>').text(item.name);
			$('<li/>').append(a).appendTo(this.menu);
			a.click(item.callback);
		}, this);

		this.menu.menu();

		this.element.append(this.background);
	},

	close: function(e) {
		e && e.preventDefault();
		this.background && this.background.remove();
		this.menu && this.menu.remove();
	}
});



$.widget('ui.siteFont', {
	// Defaults
	options: {
		color: null,
		size: null,
		style: null,

		styleClasses: {
			bold: "fntBold",
			semiBold: "fntSemibold",
			light: "fntLight",
			regular: "fntRegular"
		},
	},
	_init: function() {
		if (this.options.size) {
			this.sizeClass && this.element.removeClass(this.sizeClass);
			this.sizeClass = "siz" + this.options.size;
			this.element.addClass(this.sizeClass);
		}
		if (this.options.style || !this.fontClass) {
			this.fontClass && this.element.removeClass(this.fontClass);
			this.fontClass = this.options.styleClasses[this.options.style || "regular"];
			this.element.addClass(this.fontClass);
		}
		if (this.options.color) {
			this.element.css('color', this.options.color);
		}
	}
});

