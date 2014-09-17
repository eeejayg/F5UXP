// TODO: Refactor - this class was originally written for address cells with addresses and address lists. It was then
// refactored to also support ports and port lists. So this should be renamed ItemsAndItemListsCellView, with accessors
// for the data object. AddressCellView and PortCellView would then extend this class with custom data accessors.
AddressCellView = BBGrid.CellView.extend({
	superClass: BBGrid.CellView.prototype,

	itemFieldName: "addresses",
	arrayFieldName: "address-lists",
	itemType: "address",
	arrayType: "address-list",
	dataQueryCall: 'getAddressList',

	renderList: function(editIndex) {
		if (editIndex === undefined) {
			editIndex = -1;
		}

		var showDeleteButton = editIndex >= 0;

		var editItem;

		var $el = this.$inner;
		this.$el.removeClass('editing');
		$el.empty();
		var data = this.renderedData = BBGrid.useAccessor(this.model.data, this.model.column.get('accessor'));

		var that = this;

		for (var i = 0; i < data[this.itemFieldName].length; ++i) {
			var address = data[this.itemFieldName][i];
			_.each(address, function(value, key) {
				if (editIndex == i) {
					editItem = {
						type: this.itemType,
						index: i,
						value: key
					}
					$('<div id="edit-cont" />').appendTo($el);
				} else {
					var address = (key.length <= 18) ? key : (key.substr(0, 16) + "...");
					$('<div/>').siteFont().text(address).appendTo($el).click(_.bind(function(i) {
						this.trigger('start-edit', i);
					}, that, i));
				}
			});
		}

		for (var j = 0; j < data[this.arrayFieldName].length; ++j) {
			var addressListName = data[this.arrayFieldName][j];
			var name = addressListName;
			if (editIndex == i + j) {
				editItem = {
					type: this.arrayType,
					index: j,
					value: name
				}
				$('<div id="edit-cont" />').appendTo($el);
			} else {
				$('<div/>').siteFont({ style: "bold" }).text(name).appendTo($el).click(_.bind(function(i) {
					this.trigger('start-edit', i);
				}, this, i + j));
			}
		}

		if (editIndex == i + j) {
			$('<div id="edit-cont" />').appendTo($el);
			editItem = {
				type: 'new',
				index: i + j
			}
		}

		this.editItem = editItem;

		return editItem;
	},

	onModeReadonly: function(editIndex) {
		this.$input && this.$input.off('keydown');

		this.renderList();
	},

	commitChanges: function() {
		// Save addresses
		var data = this.renderedData;
		var value = this.$input.val();
		if (data && value) {
			this.renderedData = null;
			if (this.editIndex < data[this.itemFieldName].length) {
				// Value is an address
				var obj = {};
				obj[value] = {};
				data[this.itemFieldName][this.editIndex] = obj;
			} else {
				var options = [];
				getDataInterface().getCollection(this.arrayFieldName, function(list) {
					options = list;
				});
				var i = this.editIndex - data[this.itemFieldName].length;
				if (i < data[this.arrayFieldName].length) {
					// Value is an address list
					if (options.indexOf(value) >= 0) {
						data[this.arrayFieldName][i] = value;
						getDataInterface()[this.dataQueryCall](value, null);
					}
				} else if (this.editItem.type != this.arrayType) {
					// Value is a new entry, can be address or address list
					if (options.indexOf(value) >= 0) {
						data[this.arrayFieldName].push(value);
						getDataInterface()[this.dataQueryCall](value, null);
					} else {
						var obj = {};
						obj[value] = {};
						data[this.itemFieldName].push(obj);
					}
				}
			}
			// console.log("Addresses",data[this.itemFieldName]);
			// console.log("Address lists",data[this.arrayFieldName]);
			//BBGrid.useAccessor(this.model.data, this.model.column.get('accessor'), data);
		}
	},

	renderEditable: function() {
		var editItem = this.renderList(this.editIndex);

		var $cont = this.$el.find('#edit-cont');

		var options = [];
		getDataInterface().getCollection(this.arrayFieldName, function(list) {
			options = list;
		});
		var $input = this.$input = $('<input>')
			.appendTo($cont)
			.val(editItem.value || "")
			.addClass('ui-combobox-input')
			.css("width", "100%")
			.autocomplete({
				delay: 0,
				minLength: 0,
				html: true,
				source: function(request, response) {
					// Match value with existing data
					if (editItem.type == this.itemType) {
						response([]);
					} else {
						var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
						var matches = _.map(options, function(option) {
							if (!request.term || matcher.test(option)) {
								return {
									label: option.replace(
										new RegExp(
											"(?![^&;]+;)(?!<[^<>]*)(" +
											$.ui.autocomplete.escapeRegex(request.term) +
											")(?![^<>]*>)(?![^&;]+;)", "gi"
										), "<strong>$1</strong>" ),
									value: option
									//option: option
								};
							}
						});
						response(_.reject(matches, _.isUndefined));
					}
				}
			});

		$input.on('keydown', _.bind(this.inputKeyPressed, this));
		$input.focus();
		//this.$el.removeClass('editing');
	},

	editNext: function() {
		var data = BBGrid.useAccessor(this.model.data, this.model.column.get('accessor'));
		if (this.editIndex >= data[this.itemFieldName].length + data[this.arrayFieldName].length) {
			return false;
		}
		this.commitChanges();
		++this.editIndex;
		// Rerender
		this.renderEditable();
		return true;
	},

	editPrev: function() {
		if (this.editIndex <= 0) {
			return false;
		}
		this.commitChanges();
		--this.editIndex;
		// Rerender
		this.renderEditable();
		return true;
	},

	enterPressed: function(e) {
		this.commitChanges();
		if (e.shiftKey) {
			if (!this.editPrev()) {
				this.trigger('edit-prev-cell');
			}
		} else {
			if (!this.editNext()) {
				this.trigger('edit-next-cell');
			}
		}
	},

	// inputKeyPressed: function(e) {
	// 	if (e.keyCode == 38) {
	// 		// Up
	// 		this.editPrev();
	// 	} else if (e.keyCode == 40) {
	// 		// Down
	// 		this.editNext();
	// 	} else {
	// 		superClass.inputKeyPressed.call(this, e);
	// 	}
	// },

	onModeEditable: function(editParam) {
		this.$el.addClass('editing');

		this.editIndex = editParam || 0;

		this.renderEditable();
	}
});

PortCellView = AddressCellView.extend({
	itemFieldName: "ports",
	arrayFieldName: "port-lists",
	itemType: "port",
	arrayType: "port-list",
	dataQueryCall: 'getPortList'
});

ScheduleCellView = BBGrid.CellViewEnum.extend({
	superClass: BBGrid.CellViewEnum.prototype,

	onModeReadonly: function() {
		var $el = this.$inner;
		this.$el.removeClass('editing');
		$el.empty();
		var data = BBGrid.useAccessor(this.model.data, this.model.column.get('accessor'));
		var id;
		if (data && typeof(data) == 'string') {
			id = data;
			data = null;
		}

		if (!data && id) {
			// Attempt to get data from local cache
			data = getDataInterface().getScheduleLocal(id);
		}

		if (!data) {
			if (id) {
				// Attempt to get data from server
				getDataInterface().getSchedule(id, _.bind(function(data) {
					if (data) {
						this.onModeReadonly();
					}
				}, this));
			}
		} else {
			// Data exists, render it
			$el.text(data.name);

			var days = data["days-of-week"];
			if (days.length) {
				$el.append($('<div/>').html(days.join(',<br />')));
			}
		}
	},

	commitChanges: function() {
		BBGrid.useAccessor(this.model.data, this.model.column.get('accessor'), this.$input.val());
		// Request from server for future use
		getDataInterface().getSchedule(this.$input.val());
	},

	updateSharedObject: function() {
		var that = this;
		var menu = this.$input.data('autocomplete').menu;
	
		if (this.$editSchedule) {
			this.$editSchedule.sharedObjectsEditor('remove');
			this.$editSchedule.parent() && this.$editSchedule.parent().remove();
			this.$editSchedule = null;
		}

		getDataInterface().getSchedule(this.$input.val(), _.bind(function(schedule) {
			if (schedule) {
				var $editScheduleCont = $('<div/>').css({
					width: "350px",
					height: "340px",
					backgroundColor: "#ffffff",
					border: "1px solid #d0d0d0",
					position: 'absolute',
					left: "110%",
					top: 0
				});
				this.$editSchedule = $('<div/>').css({
					width: "100%",
					height: "100%",
				}).appendTo($editScheduleCont);
				this.$editSchedule.sharedObjectsEditor();
				//var data = BBGrid.useAccessor(this.model.data, this.model.column.get('accessor'));
				this.$editSchedule.sharedObjectsEditor( "editSharedObject", {
					model: { type: 'schedule', data: schedule }
				});

				menu.element.append($editScheduleCont);

				//console.log(this.$editSchedule.children().children().show());
			}
		}, this));
	},

	inputKeyPressed: function(e) {
		if (e.keyCode == 38 || e.keyCode == 40) {
			// Up or down pressed
			
			// Check which item is selected
			this.updateSharedObject();
		} else {
			this.superClass.inputKeyPressed.call(this, e);
		}
	},

	onModeEditable: function() {
		var $el = this.$inner;
		$el.empty();

		$cont = $el;
		var data = BBGrid.useAccessor(this.model.data, this.model.column.get('accessor'));
		var id = (data && data.name) || data || "";

		var options = [];
		getDataInterface().getCollection("schedules", function(list) {
			options = list;
		});
		var $input = this.$input = $('<input>')
			.appendTo($cont)
			.val(id)
			.addClass('ui-combobox-input')
			.css("width", "100%")
			.autocomplete({
				delay: 0,
				minLength: 0,
				html: true,
				close: function() {
//					alert("Menu close");
				},
				source: function(request, response) {
					// Match value with existing data
					var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
					var matches = _.map(options, function(option) {
						if (!request.term || matcher.test(option)) {
							return {
								label: option.replace(
									new RegExp(
										"(?![^&;]+;)(?!<[^<>]*)(" +
										$.ui.autocomplete.escapeRegex(request.term) +
										")(?![^<>]*>)(?![^&;]+;)", "gi"
									), "<strong>$1</strong>" ),
								value: option
								//option: option
							};
						}
					});
					response(_.reject(matches, _.isUndefined));
				}
			});

		$input.on('keydown', _.bind(this.inputKeyPressed, this));
		$input.focus();
	}
});

VLANCellView = BBGrid.CellView.extend({
	superClass: BBGrid.CellView.prototype,

	onModeReadonly: function() {
		$(document).off('keydown');

		var $el = this.$inner;
		this.$el.removeClass('editing');
		$el.empty();
		var data = BBGrid.useAccessor(this.model.data, this.model.column.get('accessor'));
		if (data && data.vlans.length) {
			$el.html(data.vlans.join('<br />'));
		}
	},

	commitChanges: function() {
		// TODO:
	},

	onModeEditable: function() {
		// TODO: Custom interface for editing
		this.onModeReadonly();

		$(document).on('keydown', _.bind(this.inputKeyPressed, this));
	}
});

FirewallGrid = BBGrid.Grid.extend({
	showFixedHeader: true,

	addColumn: function(config) {
		this.getColumns().push(new BBGrid.Column(config));
	},

	preloadData: function(callback) {
		var that = this;
		var preloadCount = 0;

		var data = this.get('data') || {};
		var preloadFinished = false;

		function preloadSchedule(data) {
			if (data.schedule && typeof(data.schedule) == 'string') {
				++preloadCount;
				getDataInterface().getSchedule(data.schedule, preloadDone);
			}
		}

		function preloadRule(data) {
			// Preload port lists and address lists
			for (var i = 0; i < data['port-lists'].length; ++i) {
				var portListName = data['port-lists'][i];
				++preloadCount;
				getDataInterface().getPortList(portListName, preloadDone);
			}

			for (var i = 0; i < data['address-lists'].length; ++i) {
				var addressListName = data['address-lists'][i];
				++preloadCount;
				getDataInterface().getAddressList(addressListName, preloadDone);
			}
		}

		function preloadDone() {
			preloadUpdateHandler();
		}

		function preloadsRequested() {
			preloadUpdateHandler(true);
		}

		function preloadUpdateHandler(noData) {
			noData || --preloadCount;
			if (preloadFinished && !preloadCount) {
				callback();
			}
		}

		_.each(data['fw-rules'], function(o) {
			_.each(o, function(x, k) {
				if (x['rule-list']) {
					++preloadCount;
					getDataInterface().getRuleList(x['rule-list'], function(ruleList) {
						for (var i = 0; i < ruleList.rules.length; ++i) {
							var rule = ruleList.rules[i];
							preloadRule(rule.destination);
							preloadRule(rule.source);
							preloadSchedule(rule);
						}
						preloadDone();
					});
				} else {
					preloadRule(x.destination);
					preloadRule(x.source);
					preloadSchedule(x);
				}
			}, this);
		}, this);

		preloadFinished = true;

		preloadsRequested();
	},

	initialize: function(attributes, options) {
		BBGrid.Grid.prototype.initialize.call(this, attributes, options);

		this.preloadData(_.bind(function() {
			this.processData();

			this.addColumn({
				width: 80,
				name: 'Name',
				accessor: 'name'
			});

			this.addColumn({
				width: 115,
				name: 'Address',
				group: "Source",
				accessor: {
					get: 'source',
					set: function(data, value) {
						console.log("TODO:",arguments);
					}
				},
				cellView: AddressCellView
			});

			this.addColumn({
				width: 85,
				name: 'Port',
				group: "Source",
				accessor: {
					get: 'source',
					set: function(data, value) {
						console.log("TODO:",arguments);
					}
				},
				cellView: PortCellView
			});
			this.addColumn({
				width: 95,
				name: 'VLAN',
				group: "Source",
				accessor: {
					get: 'source',
					set: function(data, value) {
						console.log("TODO:",arguments);
					}
				},
				cellView: VLANCellView
			});
			this.addColumn({
				width: 115,
				name: 'Address',
				group: "Destination",
				accessor: {
					get: 'destination',
					set: function(data, value) {
						console.log("TODO:",arguments);
					}
				},
				cellView: AddressCellView
			});
			this.addColumn({
				width: 85,
				name: 'Port',
				group: "Destination",
				accessor: {
					get: 'destination',
					set: function(data, value) {
						console.log("TODO:",arguments);
					}
				},
				cellView: PortCellView
			});

			this.addColumn({
				width: 90,
				name: 'Action',
				accessor: 'action',
				cellView: BBGrid.CellViewEnum,
				cellOptions: {
					enumeration: ruleActionEnumeration
				}
			});

			this.addColumn({
				width: 115,
				name: 'Description',
				accessor: 'description',
				cellOptions: {
					multiline: true
				}
			});

			this.addColumn({
				width: 95,
				name: 'Protocol',
				accessor: 'ip-protocol',
				cellView: BBGrid.CellViewEnum,
				cellOptions: {
					enumeration: protocolEnumeration
				}
			});

			this.addColumn({
				width: 95,
				name: 'Schedule',
				accessor: 'schedule',
				cellView: ScheduleCellView,
				cellOptions: {
					enumeration: function() {
						var options = [];
						getDataInterface().getCollection("schedules", function(list) {
							options = list;
						});
						return options;
					}
				}
			});

			this.addColumn({
				width: 85,
				name: 'Status',
				accessor: 'status',
				cellView: BBGrid.CellViewEnum,
				cellOptions: {
					enumeration: ruleStatusEnumeration
				}
			});

			this.addColumn({
				width: 60,
				name: 'Log',
				accessor: 'log',
				cellView: BBGrid.CellViewEnum,
				cellOptions: {
					enumeration: loggingEnumeration
				}
			});

			this.on("move-row", this.onMoveRow, this);
		}, this));
	},

	onMoveRow: function(from, to) {
		// Remove element
		var parent = from.row.model.get('parent');
		if (parent) {
			getDataInterface().getRuleList(parent.get('data').name, function(ruleList) {
				var index = ruleList.rules.indexOf(from.row.model.get('data'));
				if (index >= 0) {
					ruleList.rules.splice(index, 1);
					parent.get('children').remove(from.row.model);
					from.row.model.set('parent', null);
//					console.log("Detached from rule list ", parent.get('data').name);
				}
			}, 0);
		} else {
			var fwRules = this.get('data')['fw-rules'];
			var nameToRemove = from.row.model.get('data').name;
			var removeIndex = undefined;
			_.each(fwRules, function(fwRule, i) {
				_.each(fwRule, function(rule) {
					if (rule.name == nameToRemove) {
						removeIndex = i;
					}
				});
			});
			if (removeIndex !== undefined) {
				fwRules.splice(removeIndex, 1);
				this.getRows().remove(from.row.model);
				// console.log("Detached lone rule");
			}
//			console.log("fwRules",fwRules,from.row.model.get('data').name);
		}

		var rows = this.getRowsFlat();

		if (to.parent) {
			var pi = rows.indexOf(to.parent);
			var relative = to.index - pi - 1;
			//console.log("Relative to parent i = ",relative,to.parent.get('data').name);
			if (relative < 0) {
				throw "Move logic went wrong";
			}
			getDataInterface().getRuleList(to.parent.get('data').name, function(ruleList) {
				ruleList.rules.splice(relative, 0, from.row.model.get('data'));
				var children = to.parent.get('children');
				from.row.model.set('parent', to.parent);
				children.add(from.row.model, {at: relative});
			}, 0);
		} else {
			var fwRule = {};
			fwRule["fwrn-" + from.row.model.get('data').name] = from.row.model.get('data');
			var fwRules = this.get('data')['fw-rules'];
			if (to.row) {
				var index = 0;
				_.each(rows, function(row, i) {
					if (i < to.index) {
						if (!row.get('parent')) {
							++index;
						}
					}
				});
				fwRules.splice(index, 0, fwRule);
				this.getRows().add(from.row.model, {at:index});
			} else {
				fwRules.push(fwRule);
			}
		}

		//this.processData()
		//console.log("from",from.row,"to",row);
	},

	processData: function() {
		var data = this.get('data') || {};
		var rows = this.getRows();
		rows.reset([], {silent: true});

		// rows.add(new BBGrid.Row({
		// 	type: 'header'
		// }));

		_.each(data['fw-rules'], function(o) {
			_.each(o, function(x, k) {
				//console.log("X = ",arguments);
				if (x['rule-list']) {
					var row = new BBGrid.Row({
						type: 'group',
						data: { name: x['rule-list'], /*expanded: true*/ },
						children: new BBGrid.RowCollection()
					});

					// Load rule list, add children
					rows.push(row);

					getDataInterface().getRuleList(x['rule-list'], function(ruleList) {
						//console.log("Have rule list",ruleList);
						var children = row.get('children');
						for (var i = 0; i < ruleList.rules.length; ++i) {
							var rule = ruleList.rules[i];
							children.push({
								type: 'record',
								data: rule,
								parent: row
							}, {
								silent: false
							});
							//children.trigger('add');
						}
						//that.trigger('change');
					});
				} else {
					rows.push(new BBGrid.Row({
						type: 'record',
						data: x
					}));
				}
			}, this);
		}, this);
	}
});
