

  (function ($,window,document,undefined) {

  var unitName = "sharedObjectsList";  
  $[unitName] = $[unitName] || {};  
  $[unitName].defaults = {};


  $.fn[unitName] = function (params) {
  
    // create a new class object
    if ( typeof params === 'object' || params==null ) 
    {
      this.each(function () { 
        var extendedOptions = $.extend( true, {}, $[unitName].defaults, params);
        if (!$(this).data(unitName)) {
          $(this).data(unitName, new SharedObjectsList($(this), extendedOptions)); 
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
        inst[params] && inst[params].apply( inst, Array.prototype.slice.call(args, 1) );
      });
    }
    
    return this;
  };



  function SharedObjectItem( parentNode, parentObject, model, onClickCallback ) {

    // self
    var _i = this;


    // params
    _i.parentNode = parentNode;
    _i.parentObject = parentObject;
    _i.model = model;
    _i.onClickCallback = onClickCallback;


    // dom structures
    var container = $("<div/>")
      .attr({
        "class" : "blockFloatNot unselectable fntSemibold siz17"
      })
      .css({
        "width" : "100%",
        "height" : "54px",
        "border-bottom" : "1px solid #ecedea",
        "cursor" : "pointer",
        "backgroundColor" : "#F7F7F5",
        "border" : "0px"
      })
      .bind({ 
        "click" : function() { _i.onClickCallback(_i); return false; },
        "mouseover" : containerMouseover,
        "mouseout" : containerMouseout,
        "selectstart" : function() { return false; }
      })
      .appendTo( parentNode )

    var labelContainer = $("<div/>")
      .attr({
        "class" : "blockFloatNot"
      })
      .css({
        "width" : "auto",
        "height" : "auto",
        "marginTop" : "13px",
        "border" : "0px"
      })
      .appendTo( container );

    var label = $("<div/>")
      .attr({
        "class" : "blockFloat"
      })
      .css({
        "width" : "auto",
        "marginLeft" : "12px",
        "marginRight" : "4px",
        "border" : "0px"
      })
      .html( model.name )
      .appendTo( labelContainer );

    var interfaceCount = $("<div/>")
      .attr({
        "class" : "blockFloat fntSemibold siz13"
      })
      .css({
        "width" : "auto",
        "color" : "#B3B3B3",
        "marginTop" : "2px",
        "border" : "0px"
      })
      .appendTo( labelContainer );

    var typeName = $("<div/>")
      .attr({
        "class" : "blockFloatNot fntRegular siz9"
      })
      .css({
        "marginLeft" : "12px",
        "marginTop" : "3px",
        "color" : "#808080",
        "color" : "#B8B8B8",
        "border" : "0px"
      })
      .html( model.label )
      .appendTo( container );

    
    // public methods
    
    _i.detach = function() {
      container.detach();
    }
    
    
    _i.attach = function() {
      container.appendTo(parentNode);
    }
    
    
    _i.brush = function() {
      label.css({"color":"#333333"});
    }


    _i.unbrush = function() {
      label.css({"color":"#B8B8B8"});
    }

    _i.setObjectInterfaces = function( arr ) {
      interfaceCount.html( "(" + arr.length + ")" );
    }


    _i.unselect = function() {
      container.removeClass( "selected" );
      container.css( "backgroundColor" , "#F7F7F5" );
      label.css( "color" , "#333333" );
      typeName.css( "color" , "#B8B8B8" );
    }
    
    
    _i.select = function() {
      container.addClass( "selected" );
      container.css( "backgroundColor" , "#4086a3" );
      label.css( "color" , "#FFFFFF" );
      typeName.css( "color" , "#FFFFFF" );
    }
    
    // private methods
    
    function containerMouseover() {
      if (container.hasClass("selected")) { return; }
      container.css( "backgroundColor" , "#FFFFFF" );
    }
    
    function containerMouseout() {
      if (container.hasClass("selected")) { return; }
      container.css( "backgroundColor" , "#F7F7F5" );
    }
    
    function addDragHandler() {

      jQuery(function($){
         container
            .drag("init",function(){
              _i.onClickCallback(_i);
            })
            .drag("start",function(){
               return $( this ).clone()
                  .css({
                    "opacity" : .75,
                    "width" : "250px",
                    "border" : "0px"
                  })
                  .appendTo( document.body );
            })
            .drag(function( ev, dd ){
               $( dd.proxy ).css({
                  top: dd.offsetY,
                  left: dd.offsetX
               });
            })
            .drag("end",function( ev, dd ){
               $( dd.proxy ).remove();
            });
      });
    
    }
    
    //constructor
    function initialize(){
    
      if ( model.type == "ruleList" ) {
        addDragHandler();
      }
      
      return _i;
    }

    return initialize();
  }


  function SharedObjectsList( parentNode, options ) {

    // self
    var _i = this;
    
    
    // private properties
    items = [];
    dataInterface = null;
    
    
    // dom structures
    var container = $("<div/>")
      .attr({
        "class" : "blockFloatNot unselectable"
      })
      .css({
        "width" : "100%",
        "height" : "auto"
      })
      .appendTo( parentNode );


    // public methods
    
    _i.unbrush = function() {
      $.each( items, function(idx,itm) {
        itm.unbrush();
      })
    }


    _i.brush = function( firewallSharedObjects ) {

      _i.unselectAll();

      // temp array to re-order items
      var newItems = [];
      
      $.each( items, function(idx,itm) {

        var modelName = sharedObjectName( itm.model.data );
        var soName = itm.model.data.name;

        itm.detach();
        
        if ( firewallSharedObjects[modelName][soName] ) {
          itm.brush();
          newItems.unshift(itm);
        } else {
          itm.unbrush();
          newItems.push(itm);
        }

      })
      
      items = newItems;
      
      $.each( items, function(idx,itm) {
        itm.attach();
      })
      
    }


    _i.detachContainer = function() {
      container.detach();
    }
    
    
    _i.attachContainer = function() {
      container.appendTo( parentNode );
    }
    
    
    _i.unselectAll = function() {
      $.each( items, function(idx,itm) {
        itm.unselect();
      })
    }
    
    
    _i.addSharedObjectItems = function( arr ) {
      $.each( arr, function(idx,itm) {
        items.push( new SharedObjectItem( container, _i, itm, options.onClickCallback ) );
      })
    }

  
    _i.addScheduleItems = function( list ) {
      $.each(list, function (idx, itm) {
        dataInterface.getSchedule(itm, function (obj) {
          _i.addSharedObjectItems([{ "label": "Schedule", "type": "schedule", "name": obj.name, "data" : obj}]);
        });
      });
    }
    
   
    _i.addRuleListItems = function (list) {
      $.each( list, function(idx,itm) {
        dataInterface.getRuleList(itm,function(obj){
          _i.addSharedObjectItems([{ "label" : "Rule list", "type" : "ruleList", "name" : obj.name, "data" : obj}]);
        });
      });
    }
   
      
    _i.addAddressListItems = function(list) {
      $.each(list, function (idx, itm) {
        dataInterface.getAddressList(itm, function (obj) {
          _i.addSharedObjectItems([{ "label": "IP list", "type": "addressList", "name": obj.name, "data" : obj}]);
        });
      });
    }


    _i.addPortListItems = function(list) {
      $.each(list, function (idx, itm) {
        dataInterface.getPortList(itm, function (obj) {
          _i.addSharedObjectItems([{ "label": "Port list", "type": "portList", "name": obj.name, "data" : obj}]);
        });
      });
    }
   
    
    // constructor
    function initialize(){
      dataInterface = getDataInterface();
      parentNode.css( "width" , "100%" );
      return _i;
    }
    
    return initialize();
  }


}( jQuery,window,document ));
