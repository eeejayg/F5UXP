//////////////////////////////////////////////////////////////////////
// Backbone grid control
//////////////////////////////////////////////////////////////////////

// Declare a namespace for the control
BBGrid = {};

// A shared message aggregator
// TODO: This currently is shared between multiple grids which is bad
BBGrid.pubSub = _.extend({}, Backbone.Events);

//////////////////////////////////////////////////////////////////////
// Column model and collection
//////////////////////////////////////////////////////////////////////

BBGrid.Column = Backbone.Model.extend({
	defaults: {
		// The column name, displayed in the grid header
		name: "Unknown",
		// The width of the column
		width: 100,
		// A group name for grouping columns together. If adjacent columns have the same group name,
		// the name will be rendered underneath a solid bar joining the grouped columns
		group: undefined,
		// An element name for accessing the data from a row object, or an object with get and set
		// functions for reading/writing data fields
		accessor: null,
		// The class to use for creating cell views in this column. The class should extend
		// BBGrid.CellView.
		cellView: null,
		// An options/config object that is passed to the cell views for storing configuration/params
		cellOptions: null
	}
});

BBGrid.ColumnCollection = Backbone.Collection.extend({
	model: BBGrid.Column
});

//////////////////////////////////////////////////////////////////////
// Row model and collection
//////////////////////////////////////////////////////////////////////

// The grid currently supports one level of parenting only. The row
// consists of parent/child info and a row type that determines whether
// it's a group or grid header, or a data row. For data rows, the row
// also wraps a data object.
// 
// When the row wraps a data object, the grid uses its column definitions
// to access individual columns of data from the data object.

BBGrid.Row = Backbone.Model.extend({
	// The row model supports the fields:
	// 
	// 	type: string (enum 'group', 'header', 'record')
	// 	data: object (the data object that this row represents)
	// 	parent: this row's parent row
	// 	children: this row's children
});

BBGrid.RowCollection = Backbone.Collection.extend({
	model: BBGrid.Row
});

//////////////////////////////////////////////////////////////////////
// Grid model. A grid is an array of columns and an array of rows
//////////////////////////////////////////////////////////////////////

BBGrid.Grid = Backbone.Model.extend({

	showFixedHeader: true,

	initialize: function() {
		this.set('columns', new BBGrid.ColumnCollection());
		this.set('rows', new BBGrid.RowCollection());
	},

	getRows: function() {
		return this.get('rows');
	},

	getRowsFlat: function() {
		var flatRows = [];
		var rows = this.getRows();
		rows.each(function(row) {
			flatRows.push(row);
			var children = row.get('children');
			children && children.each(function(row) {
				flatRows.push(row);
			}, this);
		}, this);

		return flatRows;
	},

	getColumns: function() {
		return this.get('columns');
	}
});

// TEMP:
// For event debugging
function renderWrap(name, context) {
	return function() {
		//console.log("Render:",name);
		context.render.call(context);
	}
}

//////////////////////////////////////////////////////////////////////
// View
//////////////////////////////////////////////////////////////////////

// Base class for rows. Adds drag functionality if the row's draggable
// field evaluates to true
BBGrid.RowView = Backbone.View.extend({
	tagName: 'div',

	initialize: function() {
		var that = this;
		if (this.draggable) {
			this.$el.drag("start", function(evt, dd) {
				dd.startRelative = $(dd.target).position();
				var $proxy = $(dd.target).clone().css({
					position: "absolute",
					opacity: 0.7,
					top: dd.startRelative.top,
					left: dd.startRelative.left
				}).appendTo(that.$el.parent());
				$(dd.target).css({ opacity: 0.5 });
				dd.proxyHeight = $proxy.height();

				return $proxy;
			}).drag(function(evt, dd) {
				$( dd.proxy ).css({
					top: dd.startRelative.top + dd.deltaY,
					left: dd.startRelative.left + dd.deltaX
		        });
				var proxyCenterY = dd.startRelative.top + dd.deltaY + 0.5 * dd.proxyHeight;
				that.options.grid.highlightRowTarget(dd, proxyCenterY);
			}).drag("end", function(evt, dd) {
				$(dd.target).css({ opacity: 1 });
				$(dd.proxy).remove();

				if (dd.fromRow) {
					that.options.grid.model.trigger("move-row", {
						row: dd.fromRow,
						index: dd.fromIndex
					}, {
						row: dd.toBeforeRow,
						parent: dd.toBeforeRow && dd.toBeforeRow.model.get('parent'),
						index: dd.moveIndex
					});
					// dd.fromRow = thisRow;
					// dd.fromIndex = thisIndex;
					// dd.toBeforeRow = closest.row;
					// dd.moveIndex = closest.index < thisIndex ? closest.index : (closest.index - 1);
				}
				that.options.grid.cleanupRowTarget(dd);
			});
		}
		this.model.on('change', this.render, this);

		this.render();
	},

	rightClick: function(e) {
		e.preventDefault();

		$("#mainContainer").popupMenu({
			openOnCreate: true,
			position: { x: e.pageX, y: e.pageY },
			items: [{
				name: "Add row",
				callback: function() {
					console.log("-- Add row");
				}
			}, {
				name: "Delete row",
				callback: function() {
					console.log("-- Delete row");
				}
			}]
		});
	},

	postRender: function() {
		this.$el.unbind("contextmenu");
		this.$el.bind("contextmenu", _.bind(this.rightClick, this));
	},

	render: function() {
		this.postRender();
	}
});

// Render the column headers. This is used for a scrollable grid header only and doesn't support grouping
BBGrid.RowViewHeader = BBGrid.RowView.extend({
	className: 'grid-header blockFloatNot',

	render: function() {
		this.$el.children().detach();
		var totalWidth = 0;
		this.options.columns.each(function(c) {
			this.$outer = $('<div/>').addClass('blockFloat cell-outer').css({
				width: c.get('width'),
			});
			totalWidth += c.get('width');
			this.$outer.append($('<div/>').text(c.get('name')).addClass('blockFloat cell-inner'))
			this.$el.append(this.$outer);
		}, this);
		this.$el.css({
			width: totalWidth
		})
		this.postRender();
	}
});

// Render a fixed grid header. Supports grouping of columns.
// TODO: This should be styled with CSS. For now the height and grouping styles are hard-coded
BBGrid.FixedHeaderView = Backbone.View.extend({
	tagName: 'div',
	className: 'grid-header',

	initialize: function() {
		this.render();
	},

	getHeight: function() {
		return 63;
	},

	render: function() {
		this.$el.css({
			position: "relative",
			top: "0px",
			left: "0px"
		});
		this.$el.children().detach();
		var totalWidth = 0;

		var groups = {};
		this.model.each(function(c, i) {
			var group = c.get('group');
			if (group) {
				if (groups[group]) {
					groups[group].end = i;
				} else {
					groups[group] = {
						start: i,
						end: i,
					}
				}
			}
			this.$outer = $('<div/>').addClass('blockFloat cell-outer').css({
				width: c.get('width'),
			});
			totalWidth += c.get('width');
			this.$outer.append($('<div/>').text(c.get('name')).addClass('blockFloat cell-inner'))
			this.$el.append(this.$outer);
		}, this);

		// Add groups
		var x = 0;
		this.model.each(function(c, i) {
			var group = c.get('group');

			if (group) {
				var groupDef = groups[group];
				if (i == groupDef.start) {
					// Draw a group line
					var groupWidth = 0;
					for (var j = i; j <= groupDef.end; j++) {
						groupWidth += this.model.at(j).get('width');
					}
					this.$el.append(
						$('<div/>')
						.css({
							position: "absolute",
							left: x + 4,
							top: 42,
							height: 4,
							width: groupWidth - 4,
							backgroundColor: "#2F3569"
						}));
					this.$el.append(
						$('<div/>')
						.css({
							position: "absolute",
							left: x + 4,
							top: 51
						}).text(group).addClass('column-group-label'));
				}
			} else {
				// Draw grey line
				this.$el.append(
					$('<div/>')
					.css({
						position: "absolute",
						left: x + 4,
						top: 42,
						height: 4,
						width: c.get('width') - 4,
						backgroundColor: "#D0D0D0"
					}));
			}
			x += c.get('width');
		}, this);

		this.$el.css({
			width: totalWidth
		})
	}
});


// Renders a collapsible group header (the parent of row chilren)
BBGrid.RowViewGroup = BBGrid.RowView.extend({
	className: 'group-header blockFloatNot',
	expanded: true,

	render: function() {
		var totalWidth = 0;
		this.options.columns.each(function(c) {
			totalWidth += c.get('width');
		}, this);

		var model = this.model.get('data');
		this.$el.children().detach();
		this.$toggle = $('<div/>').css({
			left: '-36px',
			top: '19px',
			textAlign: 'center',
			cursor: 'pointer',
			position: 'absolute'
		}).addClass('expand-collapse open');
		var name = $('<div/>').html(model.name).css({
			left: '-0px',
			top: '0px',
			position: 'relative'
		}).addClass('blockFloat');
		//this.$el.html(model.name);
		this.$el.append(this.$toggle, name);
		this.$el.css({
			width: totalWidth
		});
		this.postRender();
		var that = this;
		this.$toggle.click(function() {
			that.expanded = !that.expanded;
			BBGrid.pubSub.trigger('toggle-group-expanded', that.expanded, that.model);
			that.updateExpandCollapse();
		});

		this.updateExpandCollapse();
	},

	updateExpandCollapse: function() {
		if (this.expanded) {
			this.$toggle.addClass('open').removeClass('closed');
			this.$el.addClass('group-expanded').removeClass('group-collapsed');
		} else {
			this.$toggle.addClass('closed').removeClass('open');
			this.$el.addClass('group-collapsed').removeClass('group-expanded');
		}
	}
});

// Utility class that uses an accessor to:
//   - if value is undefined, access data fields
//   - if value is defined, set the data field
//   
// An accessor can be:
//   - a string, which is a key for accessing a field of the data object directly. This supports
//     reading and writing of that field
//   - an object, with get and set fields. Those fields can either be a string for a data object
//     key, or a function which takes a data object and returns a value (get) or takes a data object
//     and a value and stores the value in the data object (set)
BBGrid.useAccessor = function(data, accessor, value) {
	if (typeof accessor == 'function') {
		if (value === undefined) {
			return accessor(data);
		} else {
			accessor(data, value);
		}
	} else if (typeof accessor == 'string') {
		if (value === undefined) {
			return (data.get && data.get(accessor)) || data[accessor];
		} else {
			if (data.get && data.get(accessor)) {
				data.set(accessor, value);
			} else {
				data[accessor] = value;
			}
		}
	} else if (accessor) {
		// Handle object with get/set methods
		if (value === undefined) {
			return BBGrid.useAccessor(data, accessor.get);
		} else {
			return BBGrid.useAccessor(data, accessor.set, value);
		}
	}
}

// BBGrid.CellView renders a cell. The model for this view is a simple JSON object with a
// data field for the data source and a column field, which is a BBGrid.Column model which
// governs how the cell data is extracted from the row data source.
// 
// This cell view supports editing by default, via a textarea control. The textarea can support
// single or multiline editing depending on the configuration of the column model.
// 
// Events triggered:
// 
// - start-edit: when cell has been clicked, requesting edit
// - cancel-edit: when edit is complete
// - edit-prev-cell: tab pressed, apply changes and make the previous cell editable
// - edit-next-cell: tab pressed, apply changes and make the next cell editable
BBGrid.CellView = Backbone.View.extend({
	className: 'blockFloat cell-outer',

	initialize: function() {
		this.editable = true;
		this.editing = false;
		this.render();
	},

	getWidth: function() {
		return this.model.column.get('width');
	},

	commitChanges: function() {
		BBGrid.useAccessor(this.model.data, this.model.column.get('accessor'), this.$textarea.val());
//		console.log("Save ",this.$textarea.val());
	},

	enterPressed: function(e) {
		var options = this.model.column.get('cellOptions') || {};
		if (!options.multiline) {
			this.commitChanges();
			if (e.shiftKey) {
				this.trigger('edit-prev-cell');
			} else {
				this.trigger('edit-next-cell');
			}
		}
	},

	inputKeyPressed: function(e) {
		if (e.keyCode == 9) {
			if (e.shiftKey) {
				this.commitChanges();
				this.trigger('edit-prev-cell');
			} else {
				this.commitChanges();
				this.trigger('edit-next-cell');
			}
			e.preventDefault();
		} else if (e.keyCode == 27) {
			this.trigger('cancel-edit');
		} else if (e.keyCode == 13) {
			this.enterPressed(e);
		}
		//console.log(e.type, e.keyCode, e);
	},

	onModeEditable: function(editParam) {
		// Render
		var $el = this.$inner;
		$el.empty();

		// $el[0].style.marginLeft = "5px";
		// $el[0].style.marginRight = "5px";

		var data = BBGrid.useAccessor(this.model.data, this.model.column.get('accessor'));
		this.$el.addClass('editing');
		//var column = this.model.column;
		var options = this.model.column.get('cellOptions') || {};

		var css = {
			width: "100%",
			height: options.multiline ? "60px" : "16px"
		};

		this.$textarea = $('<textarea/>').val(data);

		if (options.multiline) {
			css.resize = 'vertical';
		} else {
			css.resize = 'none';
			css.whiteSpace = 'nowrap';
			css.overflow = 'auto';
			this.$textarea.attr('wrap', 'off');
		}

		this.$textarea.css(css);

		$el.append(this.$textarea);

		// Event binding
		this.$textarea.focus();
		this.$textarea.on('keydown', _.bind(this.inputKeyPressed, this));
	},

	onModeReadonly: function() {
		this.$inner[0].style.marginLeft = null;
		this.$inner[0].style.marginRight = null;

		this.$textarea && this.$textarea.off('keydown');

		var $el = this.$inner;
		this.$el.removeClass('editing');
		$el.empty();
		var data = BBGrid.useAccessor(this.model.data, this.model.column.get('accessor'));
		//var column = this.model.column;

		$el.text(data);
	},

	setEditing: function(editing, editParam, forceRedraw) {
		if (editing != this.editing || forceRedraw) {
			this.editing = editing;
			if (this.editing) {
				this.onModeEditable(editParam);
			} else {
				this.onModeReadonly();
			}
		}
	},

	render: function() {
		var that = this;

		this.$outer = this.$el;
		this.$inner = $('<div/>').addClass('blockFloat cell-inner');
		this.$outer.append(this.$inner);
		this.$outer.css({
			width: this.model.column.get('width'),
		});
		if (this.editable) {
			// console.log("1");
			this.$outer.click(function() {
				// console.log("2");
				if (!that.editing) {
					// console.log("3");
					that.trigger('start-edit');
				}
//				alert("Edit column " + column.get('name'));
			});
		}

		this.setEditing(this.editing, undefined, true);

		// // TODO: Replace renderer method with an embedded view?
		// var renderer = c.get('renderer');
		// if (renderer) {
		// 	renderer($inner, data, this.model);
		// } else {
		// 	$inner.text(data);
		// }
	}
});

// Extends BBGrid.CellView with a custom renderer for the editing state, which uses a dropdown
// list to present enumerated choices to the user.
BBGrid.CellViewEnum = BBGrid.CellView.extend({
	onModeReadonly: function() {		
		this.$select && this.$select.off('keydown');

		BBGrid.CellView.prototype.onModeReadonly.call(this);
	},

	commitChanges: function() {
		BBGrid.useAccessor(this.model.data, this.model.column.get('accessor'), this.$select.val());
	},

	onModeEditable: function(editParam) {
		var $el = this.$inner;
		$el.empty();

		$el[0].style.marginLeft = "-4px";
		$el[0].style.marginRight = "-4px";

		var data = BBGrid.useAccessor(this.model.data, this.model.column.get('accessor'));
		this.$el.addClass('editing');

		this.$select = $('<select/>').width("100%");
		var enumerations = this.model.column.get('cellOptions').enumeration;
		if (typeof enumerations == 'function') {
			enumerations = enumerations();
		}
		_.each(enumerations, function(e) {
			var key = e.key || e;
			var value = e.value || key;
			this.$select.append(
				$('<option/>')
				.attr('value', key)
				.text(value)
				.attr('selected', data == key)
			);
		}, this);

		// this.$textarea = $('<textarea/>').val(data).css({
		// 	width: "100%",
		// 	height: "100%"
		// });

		$el.append(this.$select);

		// Event binding
		this.$select.focus();
		this.$select.on('keydown', _.bind(this.inputKeyPressed, this));
	},
});

// This RowView renders a data object to a data row in the grid.
BBGrid.RowViewRecord = BBGrid.RowView.extend({
	className: 'grid-row blockFloatNot',
	draggable: true,
	editable: true,

	onToggleExpanded: function(expanded, group) {
		if (this.model.get('parent') == group) {
			if (expanded) {
				this.$el.show();
			} else {
				this.$el.hide();
			}
		}
	},

	initialize: function() {
		this.columnViewsById = {};

		BBGrid.RowView.prototype.initialize.call(this);
	},

	setEditing: function(editing) {
		if (editing) {
			this.$el.addClass('editing');
		} else {
			this.$el.removeClass('editing');
		}
	},

	getCell: function(i) {
		var column = this.options.columns.at(i);
		return this.columnViewsById[column.cid];
	},

	render: function() {

		if (this.model.get('parent')) {
			this.$el.addClass('group');
		} else {
			this.$el.removeClass('group');
		}
		BBGrid.pubSub.on('toggle-group-expanded', this.onToggleExpanded, this);

		this.$el.empty();

		var border = $('<div/>').css({
			width: "100%",
			height: "1px",
			backgroundColor: "#EEEEEE"
		});

		this.$el.append(border);

		var border2 = $('<div/>').css({
			width: "100%",
			height: "1px",
			top: "100%",
			position: "absolute",
			backgroundColor: "#EEEEEE"
		});

		this.$el.append(border2);

		var totalWidth = 0;
		this.options.columns.each(function(c, i) {
			var cell = this.columnViewsById[c.cid];
			if (!cell) {
				cell = new (c.get('cellView') || BBGrid.CellView)({
					column: c,
					model: {
						column: c,
						data: this.model.get('data')
					}
				});
				this.columnViewsById[c.cid] = cell;
				cell.on('start-edit', function(editParam) {
					this.trigger('start-edit', this, editParam, i);
				}, this);
				cell.on('cancel-edit', function() {
					this.trigger('cancel-edit');
				}, this);
				cell.on('edit-next-cell', function() {
					this.trigger('edit-next-cell');
				}, this);
				cell.on('edit-prev-cell', function() {
					this.trigger('edit-prev-cell');
				}, this);
			}
			totalWidth += cell.getWidth();
			this.$el.append(cell.$el);
		}, this);
		this.$el.css({
			width: totalWidth
		})
		this.postRender();
	}
});

// BBGrid.GridView represents a grid and takes a BBGrid.Grid as its model. It manages
// the rows and columns and renders the drop targets for draggable rows. It also handles
// requests from individual cells to enter edit mode for that cell, in response to user
// input. It then re-renders the editable rows in their editable state.
BBGrid.GridView = Backbone.View.extend({
	tagName: 'div',

	initialize: function() {
		this.rowViewsById = {};

		_.bindAll(this, 'render', 'updateRows', 'redrawAllViews');

		if (this.model.showFixedHeader) {
			this.fixedHeader = new BBGrid.FixedHeaderView({
				model: this.model.getColumns()
			});
		}

		this.model.on('change', renderWrap('r1', this));

//		$('document').keydown(this.keydown);

		this.model.getRows().on('add remove', renderWrap('r2', this));

		// When the column collection changes, all views need to be redrawn
		this.model.getColumns().on('add remove reset change', this.redrawAllViews);

		this.render();
	},

	close: function() {
		this.$el.empty();
		this.remove();
		this.unbind();
		this.model.unbind();
	},

	// keydown: function(e) {
	// 	console.log(e.type, e.keyCode);
	// },

	highlightRowTarget: function(dd, y) {
		this.cleanupRowTarget(dd);

		var closest = null;
		var thisIndex = null;
		var thisRow = null;

		function findClosest(r, i) {
			var offset = r.$el.position();
			var height = r.$el.height();
			var ry = offset.top + height * 0.5;
			var dy = Math.abs(ry - y);
			if (r.el == dd.target) {
				thisIndex = i;
				thisRow = r;
			}
			if (r.model.get('type') != 'header' && (!closest || dy < closest.dy)) {
				closest = {
					dy: dy,
					row: r,
					index: i,
					top: offset.top,
					left: offset.left,
					height: height
				}
			}
		}

		var i = 0;
		this.model.getRows().each(function(r) {
			findClosest(this.rowViewsById[r.cid], i++);
			var children = r.get('children');
			children && children.each(function(r) {
				findClosest(this.rowViewsById[r.cid], i++);
			}, this);
		}, this);

		dd.fromRow = null;
		if (closest && closest.index != thisIndex && closest.index != (thisIndex+1)) {
			var type = closest.row.model.get('type');
			var top = closest.top - 2;

			dd.fromRow = thisRow;
			dd.fromIndex = thisIndex;
			dd.toBeforeRow = closest.row;
			dd.moveIndex = closest.index < thisIndex ? closest.index : (closest.index - 1);

			if (type == 'group') {
				top -= 8;
			} else if (i == (closest.index + 1) && y > (closest.top + closest.height * 0.5)) {
				top += closest.height + 6;
				dd.toBeforeRow = null;
				++dd.moveIndex;
			}

			dd.$columnTarget = $('<div/>', {
				height: 4,
				width: closest.row.$el.outerWidth(),
				css: {
					position: 'absolute',
					top: top,
					left: closest.left,
					backgroundColor: "#2F3569",
					opacity: 0.5
				}
			}).appendTo(this.$gridContainer);
		}
	},

	cleanupRowTarget: function(dd) {
		if (dd.$columnTarget) {
			dd.$columnTarget.remove();
			dd.$columnTarget = null;
		}
	},

	redrawAllViews: function() {
		_.each(this.rowViewsById, function(view) {
			view.render();
		});
		this.render();
	},

	rowDestroyed: function(row) {
		var view = this.rowViewsById[row.cid];
		view && view.$el.remove();
		delete this.rowViewsById[row.cid];
	},

	rowChanged: function(row) {
		var view = this.rowViewsById[row.cid];
		view && view.render();
	},

	createViewForRow: function(row) {
		var c;

		switch (row.get('type')) {
		case 'header':
			c = BBGrid.RowViewHeader;
			break;
		case 'group':
			c = BBGrid.RowViewGroup;
			break;
		case 'record':
			c = BBGrid.RowViewRecord;
			break;
		default:
			throw "Unrecognized row type";
		}

		return new c({
			model: row,
			grid: this,
			columns: this.model.get('columns')
		});
	},

	requestEdit: function(row, editParam, i) {
		if (this.editing) {
			// Save changes first
			this.editing.row.getCell(this.editing.cell).commitChanges();
			this.cancelEdit();
			this.startEdit(row, editParam, i);
		} else {
			this.startEdit(row, editParam, i);
		}
	},

	cancelEdit: function() {
		// Cancel current edit
		if (this.editing) {
			this.editing.row.getCell(this.editing.cell).setEditing(false);
			this.editing.row.setEditing(false);
			this.editing = null;
		}
	},

	startEdit: function(row, editParam, i) {
		this.editing = {
			row: row,
			cell: i
		};
		row.getCell(i).setEditing(true, editParam);
		row.setEditing(true);
	},

	editPrev: function() {
		if (this.editing && this.editing.cell > 0) {
			this.editing.row.getCell(this.editing.cell).setEditing(false);
			this.editing.row.getCell(--this.editing.cell).setEditing(true);
		}
	},

	editNext: function() {
		if (this.editing && this.editing.cell < (this.model.getColumns().length - 1)) {
			this.editing.row.getCell(this.editing.cell).setEditing(false);
			this.editing.row.getCell(++this.editing.cell).setEditing(true);
		}
	},

	updateRows: function() {
		var oldRowViewsById = this.rowViewsById;
		this.rowViewsById = {};

		function addRow(row, i, rows) {
			if (oldRowViewsById[row.cid]) {
				this.rowViewsById[row.cid] = oldRowViewsById[row.cid];
			} else {
				var view = this.createViewForRow(row);
				this.rowViewsById[row.cid] = view;
				view.on('start-edit', this.requestEdit, this);
				view.on('edit-prev-cell', this.editPrev, this);
				view.on('edit-next-cell', this.editNext, this);
				view.on('cancel-edit', this.cancelEdit, this);
				row.on('change', this.rowChanged, this);
				row.on('destroy', this.rowDestroyed, this);
				var children = row.get('children');
				if (children) {
					children.on('add remove', renderWrap('r3', this));
				}
			}
		}

		_.each(this.model.getRowsFlat(), addRow, this);
	},

	render: function() {
		// TODO: Update rows should make necessary modifications to the DOM
		// rather than clearing and repopulating the $el on each call to render
		this.updateRows();

		if (this.$gridContainer) {
			this.$gridContainer.children().detach();
		} else {
			this.$el.css({
				width: "100%",
				height: "100%",
				overflow: "hidden"
			}).addClass('blockFloatNot');
			var scrollTop = 0;
			if (this.model.showFixedHeader && this.fixedHeader) {
				this.fixedHeader.$el.appendTo(this.$el);
				scrollTop = this.fixedHeader.getHeight();
			}
			this.$scrollContainer = $("<div>").css({
				width: "100%",
				position: "absolute",
				top: scrollTop + "px",
				left: "0px",
				bottom: "0px",
				overflow: "scroll"
			}).appendTo(this.$el);
			this.$gridContainer = $("<div>").css({
				width: "auto",
				height: "auto"
			}).addClass('blockFloatNot').appendTo(this.$scrollContainer);

			var that = this;
			this.$scrollContainer.scroll(function() {
				if (that.fixedHeader) {
					that.fixedHeader.$el.css({
						left: -$(this).scrollLeft()
					});
				}
			});
		}

		_.each(this.model.getRowsFlat(), function(row, i, rows) {

			var $el = this.rowViewsById[row.cid].$el;

			if (i == 0 || rows[i-1].get('parent') != row.get('parent') || rows[i-1].get('type') != row.get('type')) {
				$el.addClass('first');
			} else {
				$el.removeClass('first');
			}
			if (i == rows.length - 1 || rows[i+1].get('parent') != row.get('parent') || rows[i+1].get('type') != row.get('type')) {
				$el.addClass('last');
			} else {
				$el.removeClass('last');
			}
//console.log("ROW",i,$el[0].className,(row.get('parent') && row.get('parent').cid) || "noparent");
			this.$gridContainer.append($el);
		}, this);
	}
});
