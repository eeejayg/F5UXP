
defaultBladesDef = {

  container: {
    marginLeft: 37,
    marginBottom: 37,
    marginTop: 31,
    marginRight: 37
  },

  itemDefaults: {
    marginRight: 19
  },
  
  panelDefaults: {
    minimumWidth: 254,
    mediumWidth: 254,
    maximumWidth: 254,
    headerHeight: 47,
    headerColor: "#000000",
    widthState: "minimumWidth"
  },
  
  items: [
  
    {
      panels : [
        {
          headerColor: "#363469",
          label: "Devices",
          name: "devices"
        },
        {
          headerColor: "#555982",
          label: "Firewall",
          name: "firewalls",
          minimumWidth: 1,
          mediumWidth: 500,
          maximumWidth: 600,
          widthState: "minimumWidth"
        }
      ]
    },
  
    {
      panels : [
        {
          headerColor: "#10688C",
          label: "Shared objects",
          name: "sharedObjects"
        },
        {
          headerColor: "#4086A3",
          label: "",
          name: "lists",
          minimumWidth: 1,
          mediumWidth: 350,
          maximumWidth: 500,
          widthState: "minimumWidth"
        }
      ]
    },
    
    {
      panels : [
        {
          headerColor: "#E84742",
          label: "Trending today",
          name: "trendingToday"
        }
      ]
    },

    {
      panels : [
        {
          headerColor: "#F29B1B",
          label: "Monitor",
          name: "monitor"
        }
      ]
    },
                 
    {
      marginRight: 0,
      panels : [
        {
          headerColor: "#2F3569",
          label: "People",
          name: "people"
        }
      ]
    }

  ]
  
};


(function ($,window,document,undefined) {

  var unitName = "blades";  
  $[unitName] = $[unitName] || {};  
  $[unitName].defaults = {};


  $.fn[unitName] = function (params) {
  
    // create a new class object
    if ( typeof params === 'object' || params==null ) 
    {
      this.each(function () { 
        var extendedOptions = $.extend( true, {}, $[unitName].defaults, params);
        if (!$(this).data(unitName)) {
          $(this).data(unitName, new Blades($(this), extendedOptions)); 
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


  function Panel( parentNode, parentObject, idx, uimodel )
  {
    // self
    var _i = this;

    
    // params
    _i.parentNode = parentNode;
    _i.parentObject = parentObject;
    _i.idx = idx;
    _i.uimodel = uimodel;
    
    
    // dom structures 
    var container = $("<div/>")
                      .attr({
                        "class" : "blockFloat"
                      })
                      .css({
                        "width" : uimodel[uimodel.widthState],
                        "height" : "100%",
                        "backgroundColor" : "#F7F7F5",
                        "overflow" : "hidden"                 
                      })
                      .appendTo(parentNode);
                      
    var header = $("<div/>")
                  .attr({
                    "class" : "blockFloatNot unselectable"
                  })
                  .css({
                    "width" : "100%",
                    "height" : uimodel.headerHeight,
                    "backgroundColor" : uimodel.headerColor
                  })
                  .appendTo(container);
                  
    var label = $("<div/>")
                  .attr({
                    "class" : "blockFloat fntLight siz21"
                  })
                  .css({
                    "width" : "auto",
                    "color" : "#FFFFFF",
                    "lineHeight" : uimodel.headerHeight + "px",
                    "marginLeft" : 12
                  })
                  .html( uimodel.label )
                  .appendTo(header);

    var innerContainer = $("<div/>")
                          .attr({
                            "class" : "blockFloatNot"
                          })
                          .css({
                            "width" : "100%",
                            // height is set dynamically by containerResize
                            "backgroundColor" : "#F7F7F5",
                            "overflow" : "scroll"
                          })
                          .appendTo(container);

    var contentHolder = $("<div/>")
      .attr({
        "class" : "blockFloatNot"
      })
      .css({
        "width" : "auto",
        "height" : "auto",
        "fontSize" : "11px"
      }).appendTo(innerContainer);
      
    
    var minimizeButton = $( getSprite(sprites.bladeMinimize) )
      .attr({
        "class" : "blockFloatRight"
      })
      .css({
        "marginRight" : "4px",
        "marginTop" : "16px"
      })
      .bind({
        "click" : sizeMinimium
      })
      
    var maximizeButton = $( getSprite(sprites.bladeMaximize) )
      .attr({
        "class" : "blockFloatRight"
      })
      .css({
        "marginRight" : "8px",
        "marginTop" : "16px"
      })
      .bind({
        "click" : sizeMaximum
      })
      
    var mediumizeButton = $( getSprite(sprites.bladeMediumize) )
      .attr({
        "class" : "blockFloatRight"
      })
      .css({
        "marginRight" : "8px",
        "marginTop" : "16px"
      })
      .bind({
        "click" : sizeMedium
      })
        
    var toggleButton = $( getSprite(sprites["bladeSize"]) )
      .css({
        "position" : "absolute",
        "right" : "15px",
        "top" : "16px",
        "cursor" : "pointer"
      })
      
      
    // public methods
    _i.addContent = function( jQueryNode ) {
      contentHolder.append( jQueryNode );
    }
    
    
    _i.render = function( noAnimation ) {
      innerContainer.height( container.height() - uimodel.headerHeight );

      label.html( _i.uimodel.label );

      if ( _i.uimodel.widthState == "mediumWidth" ) {
        mediumizeButton.hide();
        maximizeButton.show();
        minimizeButton.show();
      }

      if ( _i.uimodel.widthState == "maximumWidth" ) {
        mediumizeButton.show();
        maximizeButton.hide();
        minimizeButton.hide();
      }

      // optimization would be to save last version of uimodel and not render if no change
      if ( noAnimation ) {
        container.css( "width" , _i.uimodel[_i.uimodel.widthState] );
      } else {
        container.stop(true).animate({"width":_i.uimodel[_i.uimodel.widthState]},"fast");
      }
      
    }
    
    function sizeMinimium() {
      _i.uimodel.widthState = "minimumWidth";
      _i.render();
      return false;
    }

    function sizeMedium() {
      _i.uimodel.widthState = "mediumWidth";
      _i.render();
      return false;
    }

    function sizeMaximum() {
      _i.uimodel.widthState = "maximumWidth";
      _i.render();
      return false;
    }
    
    
    // constructor                          
    function initialize(){
    
      if ( idx > 0 ) {
        if ( _i.uimodel.name != "lists" ) { 
          header.append(maximizeButton) 
        } else {
          minimizeButton.css( "marginRight" , "8px" );
        }
        header.append(mediumizeButton);
        header.append(minimizeButton);
      }
      
      if ( _i.uimodel.name ) {
        contentHolder.attr( "id", _i.uimodel.name );
      }

      return _i
    }
   
    return initialize();

  }
  

  function BladeItem( parentNode, parentObject, idx, uimodel ) {
  
    // self
    var _i = this;
  
  
    // params
    _i.parentNode = parentNode;
    _i.parentObject = parentObject;
    _i.idx = idx;
    _i.uimodel = uimodel;
    
    
    // locals
    var panels = [];
  
  
    // dom structures  
    var BladesParentContainer = parentNode.closest(".BladesParentContainer");
    
    
    var container = $("<div/>")
                      .attr({
                        "class" : "blockFloat"
                       })
                       .css({
                        "width" : "auto",
                        "height" : "100%",
                        "backgroundColor" : "#FFFFFF",
                        "marginLeft" : uimodel.marginLeft,
                        "marginRight" : uimodel.marginRight,
                        "overflow" : "hidden"
                       })
                       .appendTo(parentNode);
    
    
    // public methods
    _i.hide = function( panelName ) {
      $.each( panels, function(idx,itm) {
        if ( panels[idx].uimodel["name"] == panelName ) { 
          if ( panels[idx].uimodel.widthState != "minimumWidth" ) {
            panels[idx].uimodel.widthState = "minimumWidth";
            panels[idx].render();
          }             
        }
      })
    }
    
    
    _i.show = function( panelName ) {
      $.each( panels, function(idx,itm) {
        if ( panels[idx].uimodel["name"] == panelName ) {
          if ( panels[idx].uimodel.widthState == "minimumWidth" ) {
            panels[idx].uimodel.widthState = "mediumWidth";
            panels[idx].render();
          }
        }
      })
    }
    
    
    _i.setPanelTitle = function( panelName, newTitle ) {
      $.each( panels, function(idx,itm) {
        if ( panels[idx].uimodel["name"] == panelName ) {
          panels[idx].uimodel.label = newTitle;
          panels[idx].render();
        }
      })
    }


    _i.addContent = function( panelName, jQueryNode ) {
      $.each( panels, function(idx,itm) {
        if ( panels[idx].uimodel["name"] == panelName ) {
          panels[idx].addContent( jQueryNode );
        }
      })
    }
    
    
    _i.test = function(){
      if ( panels[1].uimodel.widthState == "minimumWidth" ) {
        panels[1].uimodel.widthState = "mediumWidth";
      } else if (panels[1].uimodel.name!="firewalls") {
        panels[1].uimodel.widthState = "minimumWidth";
      }
      
      _i.render();
      
      return false;
    }
    
    
    _i.render = function( noAnimation ) {
      $.each( panels, function(idx,pnl) {
        pnl.render( noAnimation )
      })
    }
    

    _i.containerResize = function() {
      // if sub panel
      if ( panels[1] ) {
        var newSubPanelMaximumWidth = BladesParentContainer.width() - panels[0].uimodel.minimumWidth;
        if ( panels[1].uimodel.maximumWidth != newSubPanelMaximumWidth ) {
          panels[1].uimodel.maximumWidth = newSubPanelMaximumWidth;
          panels[1].render(true);
        }
      }
      
      _i.render( true );  
    }
    
    
    // private methods
    function createItems(){
      $.each( uimodel.panels, function(idx,pnl) {
        panels[idx] = new Panel( container, _i, idx, pnl );
      })    
    }
    
    
    // constructor    
    function initialize() {
      createItems();      
      //container.bind({"click" : _i.test})
      return _i;
    };
    
    return initialize();
  }


  function Blades( parentNode, options ) {

    // self
    var _i = this;
  
  
    // locals
    var items = [];


    // dom structures
    var outerContainer  = $("<div/>")
                      .attr({
                        "class" : "blockFloatNot fntBold siz23"
                      })
                      .css({
                        "width" : "100%",
                        // height is set dynamically by containerResize
                        "marginTop" : options.container.marginTop + "px",
                        "marginLeft" : "0px",
                        "overflow" : "hidden",
                        //"backgroundColor" : "#AAFFAA",
                        "color" : "#0000FF"
                      })
                      .appendTo(parentNode); 
    
    var container = $("<div/>")
                          .attr({
                            "class" : "BladesParentContainer blockFloatNot"
                          })
                          .css({
                            "height" : "100%",
                            // width is set dynamically by containerResize
                            "overflow" : "hidden",
                            "marginLeft" : options.container.marginLeft + "px",
                            //"backgroundColor" : "#FFAAAA",
                            "color" : "#555500"
                          })
                          .appendTo(outerContainer);

    var innerContainer = $("<div/>")
      .attr({
        "class" : "blockFloatNot"
      })
      .css({
        // arbitrarily larger
        "width" : "300%",
        "height" : "100%"
      })
      .appendTo(container);
      
      
    // public methods
    _i.containerResize = function() {  
      outerContainer.height( parentNode.height() - outerContainer.offset().top - options.container.marginBottom );
      container.width( outerContainer.width() - options.container.marginLeft - options.container.marginRight );
      $.each( items, function(idx,itm) {
        itm.containerResize();
      })      
    }
   
   
    _i.hide = function( panelName ) {
      if (!panelName) { return }
      $.each( items, function(idx,itm) {
        items[idx].hide( panelName );
      })
    }
    
    
    _i.show = function( panelName ) {
      if (!panelName) { return }
      $.each( items, function(idx,itm) {
        items[idx].show( panelName );
      })
    }
    
    _i.setPanelTitle = function( panelName, newTitle ) {
      $.each( items, function(idx,itm) {
        items[idx].setPanelTitle( panelName, newTitle );
      })
    }


    _i.addContent = function( panelName, jQueryNode ) {
      $.each( items, function(idx,itm) {
        items[idx].addContent( panelName, jQueryNode );
      })
      setTimeout(_i.containerResize);
    }
    
    
    // private methods    
    function processOptions() {
    // add itemDefaults to each item
      $.each( options.items , function(idx,itm) {
        options.items[idx] = $.extend( {}, options.itemDefaults, itm );
        $.each( itm.panels, function(idx,pnl) {
          itm.panels[idx] = $.extend( {}, options.panelDefaults, pnl );
          return true;
        })
        return true;
      })
    }


    function createItems() {
      $.each( options.items, function(idx,itm) {
        items.push( new BladeItem(innerContainer,_i,idx,itm) )  
      })
    }


    // constructor
    function initialize(){

      processOptions();                 
      createItems();

      // event is namespaced for safe unbind
      // setTimeout does layout operation outside event handler
      $(window).bind( "resize.blades", function() {setTimeout(_i.containerResize)} );

      // init container size
      setTimeout(_i.containerResize);
  
      return _i;
    }
    
    return initialize();
  }


}( jQuery,window,document ));
