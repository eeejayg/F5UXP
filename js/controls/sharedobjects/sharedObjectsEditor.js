

(function ($,window,document,undefined) {

  var unitName = "sharedObjectsEditor";  
  $[unitName] = $[unitName] || {};  
  $[unitName].defaults = {};


  $.fn[unitName] = function (params) {
  
    // create a new class object
    if ( typeof params === 'object' || params==null ) 
    {
      this.each(function () { 
        var extendedOptions = $.extend( true, {}, $[unitName].defaults, params);
        if (!$(this).data(unitName)) {
          $(this).data(unitName, new SharedObjectsEditor($(this), extendedOptions)); 
        } else {
          throw( ": cannot create " + unitName + ". Element " + (this.id || "") + " already has a " + unitName + " object attached." );
        }
      });
    } 
    
    // or call a method an an existing class object
    else {
      var args = arguments;
      this.each(function() {
        var inst = $(this).data(unitName);
        inst && inst[params] && inst[params].apply( inst, Array.prototype.slice.call(args, 1) );
      });
    }
    
    return this;
  };

  
  function RulesEditor( parentNode, parentObject ) {
  
    // self
    var _i = this;
    
    
    // dom structures
    
    var container = $("<div/>")
      .attr({
        "class" : "blockFloatNot"
      })
      .css({
        "marginLeft" : "25px",
        "marginTop" : "21px",
        "width" : "90%",
        "height" : "auto"
      })
      .appendTo( parentNode )
      .hide();
    
    var title = $("<div/>")
      .attr({
        "class" : "blockFloatNot fntBold siz15"
      })
      .css({
        "color" : "#333333"
      })
      .html("Rules")
      .appendTo( container )     
    
    var divider = $("<div/>")
      .attr({
        "class" : "blockFloatNot"
      })
      .css({
        "backgroundColor" : "#D0D0D0",
        "width" : "100%",
        "height" : "4px",
        "marginTop" : "5px",
        "marginBottom" : "8px"
      })
      .appendTo( container );


    // public methods
    
    _i.hide = function() {
      container.hide();
    }
    
    
    _i.editSharedObject = function( sharedObject ) {
      container.show();
    }
    
    
    
    // constructor
    
    function initialize(){
      return _i;
    }
    
    return initialize();
  
  }
  
  function ScheduleEditor( parentNode, parentObject ) {
  
    // self
    var _i = this;
        
    // private properties
    var daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    var sharedObject = null;


    // dom structures
    
    var container = $("<div/>")
      .attr({
        "class" : "blockFloatNot"
      })
      .css({
        "marginLeft" : "25px",
        "marginTop" : "21px",
        "width" : "90%",
        "height" : "auto"
      })
      .appendTo( parentNode )
      .hide();
    
    var title = $("<div/>")
      .attr({
        "class" : "blockFloatNot fntBold siz15"
      })
      .css({
        "color" : "#333333"
      })
      .html("Schedule")
      .appendTo( container )     
    
    var divider = $("<div/>")
      .attr({
        "class" : "blockFloatNot"
      })
      .css({
        "backgroundColor" : "#D0D0D0",
        "width" : "100%",
        "height" : "4px",
        "marginTop" : "5px",
        "marginBottom" : "18px"
      })
      .appendTo( container );

    var dateTimeContainer = $("<div/>")
      .attr({
        "class" : "blockFloat"
      })
      .css({
        "width" : "180px",
        "height" : "auto",
        "minHeight" : "50px",
        "marginRight" : "10px"
      })
      .appendTo( container );
    
      var dateRangeLabel = $("<div/>")
        .attr({
          "class" : "blockFloatNot fntRegular siz11"
        })
        .css({
          "width" : "auto",
          "height" : "auto",
          "color" : "#4D4D4D",
          "marginBottom" : "5px"
        })
        .html( "Date range:" )
        .appendTo( dateTimeContainer );
      
      var dateRow = $("<div/>")
        .attr({
          "class" : "blockFloatNot"
        })
        .css({
          "width" : "auto",
          "height" : "auto",
          "marginBottom" : "14px"
        })
        .appendTo( dateTimeContainer );
        
        var beginDate = $("<input/>")
          .attr({
            "class" : "blockFloat selectable fntSemibold siz11",
            "placeholder" : "Start date"
          })
          .bind({
            "change" : changeModel
          })
          .css({
            "width" : "68px",
            "height" : "23px",
            "border" : "1px solid #D0D0D0",
            "color" : "#999999",
            "lineHeight" : "23px",
            "paddingLeft" : "5px",
            "marginRight" : "11px"
          })
          .appendTo( dateRow );

        var endDate = beginDate.clone()
          .attr({
            "placeholder" : "End date"
          })
          .bind({
            "change" : changeModel
          })
          .css({
            "marginRight" : "0px"
          })
          .appendTo( dateRow );
      
      var timeRangeLabel = dateRangeLabel.clone()
        .html( "Time span:" )
        .appendTo( dateTimeContainer );
        
      var timeRow = $(dateRow[0].cloneNode(false))
        .appendTo( dateTimeContainer );
        
        var beginTime = beginDate.clone()
          .attr({
            "placeholder" : "Start time"
          })
          .bind({
            "change" : changeModel
          })
          .appendTo( timeRow );
          
        var endTime = endDate.clone()
          .attr({
            "placeholder" : "End time"
          })
          .bind({
            "change" : changeModel
          })
          .appendTo( timeRow );
                
    var daysOfWeekContainer = $("<div/>")
      .attr({
        "class" : "blockFloat"
      })
      .css({
        "width" : "100px",
        "height" : "auto",
        "minHeight" : "24px"
      })
      .appendTo( container );
      
      var dayRow = $("<div/>")
        .attr({
          "class" : "blockFloatNot"
        })
        .css({
          "width" : "100%",
          "height" : "auto",
          "marginBottom" : "4px",
          "cursor" : "pointer",
          "border" : "0px",
          "outline" : "none"
        })

        var cb = $("<input/>")
          .attr({
            "type" : "checkbox",
            "class" : "blockFloat selectable dowCheckbox",
            "checked" : false
          })
          .css({
            "outline" : "none"
          })

        var cbLabel = $("<label/>")
          .attr({
            "class" : "blockFloat dowCheckbox-label fntBold siz11"
          })
          .css({
            "outline" : "none"
          })
        
        var cbCollection = {};

        $.each( daysOfWeek, function(idx,itm) {
          var curRow = dayRow.clone();
          var curCheckbox = cb.clone().attr({"id":itm});
          var curLabel = cbLabel.clone().attr({"for":itm}).html(itm);
          curCheckbox.appendTo(curRow).bind( "change" , changeModel );
          curLabel.appendTo(curRow);
          curRow.appendTo(daysOfWeekContainer);
          cbCollection[itm] = curCheckbox;
        })

    // public methods
    
    _i.hide = function() {
      container.hide();
    }
    
    
    _i.editSharedObject = function( sharedObjectParam ) {

      sharedObject = sharedObjectParam;
    
      container.show();

      $.each( cbCollection, function(idx,itm) {
        itm.prop("checked",false);
      })

      $.each( sharedObject.model.data["days-of-week"], function(idx,itm) {
        cbCollection[itm].prop("checked",true);  
      })

      var ds = sharedObject.model.data["daily-hour-start"];
      var de = sharedObject.model.data["daily-hour-end"];

      if ( ds ) { beginTime.val(ds); } else { beginTime.val(""); }
      if ( de ) { endTime.val(de); } else { endTime.val(""); }
      
      var dvs = apiDateStringToISODateString(sharedObject.model.data["date-valid-start"]);
      var dve = apiDateStringToISODateString(sharedObject.model.data["date-valid-end"]);

      if ( dvs ) {
        dvsDate = new Date(dvs);
        beginDateString = (dvsDate.getMonth()+1).toString().leftPad(2,"0") + "/" + dvsDate.getDate().toString().leftPad(2,"0") + "/" + dvsDate.getFullYear();
        beginDate.val(beginDateString);
      } else { beginDate.val(""); }

      if ( dve ) {
        dveDate = new Date(dve);
        endDateString = (dveDate.getMonth() + 1).toString().leftPad(2,"0") + "/" + dveDate.getDate().toString().leftPad(2,"0") + "/" + dveDate.getFullYear();
        endDate.val(endDateString);
      } else { endDate.val(""); }

    }
    
    
    // private methods
    function changeModel() {
      
      var arr = [];

      $.each( cbCollection, function(idx,itm) {
        if ( itm.prop("checked") ) {
          arr.push(idx);
        }
      })

      sharedObject.model.data["days-of-week"] = arr;

      sharedObject.model.data["daily-hour-start"] = beginTime.val();
      sharedObject.model.data["daily-hour-end"] = endTime.val();

      sharedObject.model.data["date-valid-start"] = "";
      sharedObject.model.data["date-valid-end"] = "";

      if ( beginDate.val() ) {
        var bdDate = new Date( beginDate.val() );
        sharedObject.model.data["date-valid-start"] = apiDateString(bdDate);
      }

      if ( endDate.val() ) {
        var edDate = new Date( endDate.val() );
        sharedObject.model.data["date-valid-end"] = apiDateString(edDate);
      }
     
    }

    
    // constructor
    
    function initialize(){
      beginDate.datepicker();
      endDate.datepicker();
      return _i;
    }
    
    return initialize();
  
  }
  
  
  function SimpleRow( parentNode, parentObject, index, model ) {
    
    // self
    var _i = this;
    
        
    // local properties
    var key = null;
    var descriptionObject = null;
    
    
    // dom structures
    
    var container = $("<div/>")
      .attr({
        "class" : "simpleRow blockFloatNot"
      })
      .css({
      })
      .hover(
        function () {
          $(this).css("backgroundColor","#FFFFFF");
          addButton.show();
          deleteButton.show();
        },
        function () {
          $(this).css("backgroundColor","#F7F7F5")
          addButton.hide();
          deleteButton.hide();
        }
      )
      .bind({
        "click" : inputFocus
      })
      .appendTo( parentNode );
    
    var input = $("<input/>")
      .attr({
        "class" : "blockFloat selectable fntBold siz11",
        "spellcheck" : false
      })
      .css({
        "border" : "0px",
        "marginTop" : "10px",
        "width" : "224px",
        "backgroundColor" : "transparent"
      })
      .bind({
        "keyup" : changeModel
      })
      .appendTo( container );
    
    var addButton = $( getSprite( sprites.inputPlus ) )
      .attr({
        "class" : "blockFloatRight"
      })
      .css({
        "marginTop" : "13px",
        "marginRight" : "4px",
        "cursor" : "pointer"
      })
      .bind({
        "click" : addModel
      })
      .hide()
      .appendTo( container );
      
    var deleteButton = $( getSprite( sprites.inputX ) )
      .attr({
        "class" : "blockFloatRight"
      })
      .css({
        "marginTop" : "14px",
        "marginRight" : "10px",
        "cursor" : "pointer"
      })
      .bind({
        "click" : deleteModel
      })
      .hide()
      .appendTo( container );
      
        
    // private methods
    
    function addModel()
    {
      parentObject.addModelAtIndex( index );
      return false;
    }
    
    
    function deleteModel()
    {
      parentObject.deleteModelAtIndex( index );
      return false;
    }
    
    
    function changeModel(e)
    {
      delete model[key];
      key = input.val();
      model[key] = descriptionObject;
      
      if (( e.keyCode == 27 ) || ( e.keyCode == 13 )) {
        input.blur();
      }
      
      return false;
    }
    
    
    function inputFocus()
    {
      input.focus();
    }
    
    // constructor
    
    function initialize() {
    
      // the first key in the model is the port or address
      // the value of that key is the description
      // "" : {}
      key = $.map( model, function( value, index ) {
        return index;
      })[0];

      descriptionObject = $.map( model, function( value, index ) {
        return value;
      })[0];
              
      input.val(key);
      
      return _i;
    }
    
    return initialize();
    
  }
  
  
  function SimpleEditor( parentNode, parentObject ) {
  
    // self
    var _i = this;
    
    
    // private properties
    var rowData = null;
    var sharedObject = null;
    
    
    // dom structures
    
    var container = $("<div/>")
      .attr({
        "class" : "blockFloatNot"
      })
      .css({
        "marginLeft" : "21px",
        "marginTop" : "21px",
        "width" : "92%",
        "height" : "auto"
      })
      .appendTo( parentNode )
      .hide();
    
    var title = $("<div/>")
      .attr({
        "class" : "blockFloatNot fntBold siz15"
      })
      .css({
        "color" : "#333333"
      })
      .appendTo( container )     
    
    var divider = $("<div/>")
      .attr({
        "class" : "blockFloatNot"
      })
      .css({
        "backgroundColor" : "#D0D0D0",
        "width" : "100%",
        "height" : "4px",
        "marginTop" : "5px",
        "marginBottom" : "8px"
      })
      .appendTo( container );

    var rowContainer = $("<div/>")
      .attr({
        "class" : "blockFloatNot"
      })
      .css({
        "width" : "100%",
        "height" : "auto"
      })
      .appendTo( container );
      
      
    // public methods
    
    _i.addModelAtIndex = function( index ) {
     
      var newRowObject = null;
      
      if ( sharedObject.model.type == "addressList" ) {
        newRowObject = JSON.parse(JSON.stringify(sharedObjectsModel.address));
      }
      
      if ( sharedObject.model.type == "portList" ) {
        newRowObject = JSON.parse(JSON.stringify(sharedObjectsModel.port));
      }
      
      newRowObject["new value"] = newRowObject[""];
      delete newRowObject[""];
      
      rowData.splice(index+1,0,newRowObject);
      redrawModel();
    }
    
    
    _i.deleteModelAtIndex = function( index ) {
      rowData.splice(index,1);
      redrawModel();        
    }
    
    
    _i.hide = function() {
      container.hide();
    }
    
    
    _i.editSharedObject = function( sharedObjectParam ) {
      
      sharedObject = sharedObjectParam;
      
      if ( sharedObject.model.type == "addressList" ) {
        show("Address");
        rowData = sharedObject.model.data.addresses;
      }
      
      if ( sharedObject.model.type == "portList" ) {
        show("Port");
        rowData = sharedObject.model.data.ports;
      }

      redrawModel();

    }
    
    
    // private methods
   
    function redrawModel() {
      rowContainer.children().remove();
      
      $.each( rowData, function(idx,itm) {
        new SimpleRow( rowContainer, _i, idx, itm );
      })
    }
    
     
    function show( titleString ) {
      title.html( titleString );
      container.show();  
    }
    
    
    // constructor
    
    function initialize(){
      return _i;
    }
    
    return initialize();
  }
  
  
  function SharedObjectsEditor( parentNode, options ) {

    // self
    var _i = this;
  
  
    // private properties
    var simpleEditor = null;
    var scheduleEditor = null;
    var rulesEditor = null;
    
    
    // dom structures
    var container = $("<div/>")
      .attr({
        "class" : "blockFloatNot"
      })
      .css({
        "width" : "100%",
        "height" : "auto"
      })
      .appendTo( parentNode );
      

    // public methods
    _i.editSharedObject = function( sharedObject ) {  
    
      if (( sharedObject.model.type == "addressList" ) || ( sharedObject.model.type == "portList" )) {
        scheduleEditor.hide();
        rulesEditor.hide();
        simpleEditor.editSharedObject( sharedObject );
      }  
      
      if ( sharedObject.model.type == "schedule" ) {
        simpleEditor.hide();
        rulesEditor.hide();
        scheduleEditor.editSharedObject( sharedObject );
      }
      
      if ( sharedObject.model.type == "ruleList" ) {
        simpleEditor.hide();
        scheduleEditor.hide();
        rulesEditor.editSharedObject( sharedObject );
      }
      
      
    }
    
    _i.remove = function() {
      // Remove all children *and* unbind all events
      container.empty();
    }

    // private methods
           
    // constructor
    
    function initialize(){
      parentNode.css("width","100%");
      
      scheduleEditor = new ScheduleEditor( container, _i );
      simpleEditor = new SimpleEditor( container, _i );
      rulesEditor = new RulesEditor( container, _i );
      
      return _i;
    }
    
    return initialize();
  }


}( jQuery,window,document ));
