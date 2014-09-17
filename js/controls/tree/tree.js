

treeSampleDef = [
  {
    label: "Benegal",
    nodes: [
      {
        label: "DeviceGlobal",
        nodes: [
          {
            label: "RouteDomain0",
            nodes: [
              {
                label: "VIPs",
                nodes: [
                  {
                    label: "Exchange 322"
                  },
                  {
                    label: "Sharepoint 232"
                  }
                ]
              },
              {
                label: "SelfIPs",
                nodes: [
                  {
                    label: "12.3.13.134"
                  },
                  {
                    label: "32.2.32.47"
                  }
                ]
              }
            ]
          },
          {
            label: "RouteDomain1"
          }
        ]
      },
      {
        label: "Management"
      }
    ]
  },
  {
    label: "Madrid"
  },
  {
    label: "New York"
  },
  {
    label: "Seattle HQ"
  }
];


  (function ($,window,document,undefined) {

  var unitName = "tree";  
  $[unitName] = $[unitName] || {};  
  $[unitName].defaults = {};


  $.fn[unitName] = function (params) {
  
    // create a new class object
    if ( typeof params === 'object' || params==null ) 
    {
      this.each(function () { 
        var extendedOptions = $.extend( true, {}, $[unitName].defaults, params);
        if (!$(this).data(unitName)) {
          $(this).data(unitName, new Tree($(this), extendedOptions)); 
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


  function TreeNode( parentNode, parentObject, treeLevel, model, callback, nodeCollection )
  {
    // self
    var _i = this;


    // params
    _i.parentNode = parentNode;
    _i.parentObject = parentObject;
    _i.treeLevel = treeLevel;
    _i.model = model;
    _i.callback = callback;


    // private properties
    var numInterfaces = 0;
    var childNodes = [];
    

    // dom structures
    var container = $("<div/>")
      .attr({
        "class" : "blockFloatNot " + "treeNodeContainerLevel" + treeLevel
      })
      .css({
        "height" : "auto",
        "width" : "100%",
        "marginBottom" : "3px",
        "border" : "0px"
      })
      .appendTo( parentNode );

    var labelContainer = $("<div/>")
      .attr({
        "class" : "blockFloatNot " + "treeNodeLabelContainer" + treeLevel
      })
      .bind({
        "selectstart" : function() { return false; }
      })
      .css({
        "cursor" : "pointer",
        "width" : "100%",
        "border" : "0px"
      })
      .appendTo( container );
      if (( treeLevel == 0 ) || ( treeLevel == 3 ) || (model.label == "Management")) {
        labelContainer.bind( "click" , toggleButtonClick )
      }
            
      var toggleButton = $("<div/>")
        .attr({
          "class" : "blockFloat treeNodeArrow closed"
        })
        .css({
          "marginTop" : ((treeLevel == 0 ) ? "6px" : "2px"),
          "border" : "0px"
        })
        .bind( "click", toggleButtonClick )
        .appendTo( labelContainer ); 
      
      var loadingIndicator = $("<img/>")
        .attr({
          "class" : "blockFloat",
          "src" : "images/refresh.gif"
        })
        .css({
          "marginRight" : "2px"
        })
        .appendTo( labelContainer )
        .hide();
       
        if ( treeLevel == 0 ) {
          loadingIndicator.css( "marginTop" , "2px" );
        } else {
          loadingIndicator.css( "marginTop" , "-2px" );
        }
         
      var label = $("<div/>")
        .attr({
          "class" : "blockFloat " + "treeNodeLabelLevel" + treeLevel
        })
        .css({
          "width" : "auto",
          "height" : "auto",
          "marginBottom" : "3px",
          "zIndex" : 1,
          "maxWidth" : "150px",
          "overflow" : "hidden",
          "outline" : "0px",
          "border" : "0px"
        })
        .html( model.label )
        .appendTo( labelContainer );
  
      var interfaceCount = $("<div/>")
        .attr({
          "class" : "blockFloat fntSemibold " + ((treeLevel==0) ? "siz13" : "siz9")
        })
        .css({
          "color" : "#B3B3B3",
          "marginLeft" : "4px",
          "lineHeight" : ((treeLevel==0) ? "22px" : "15px")
        })
        .appendTo( labelContainer );

    var childNodeContainer = $("<div/>")
      .attr({
        "class" : "blockFloatNot"
      })
      .css({
        "width" : "100%",
        "height" : "auto"
      })
      .appendTo(container).hide();


    // public methods

    _i.setChildNodes = function( openOrClose ) {
    
      if ( openOrClose == "open" ) {
        openNode();
      } else {
        closeNode();
      }
    
      $.each( childNodes, function(idx,itm) {
        itm.setChildNodes( openOrClose );
      })
        
    }
    
    
    _i.incInterfaceCount = function() {
      numInterfaces++;
      _i.parentObject.incInterfaceCount && _i.parentObject.incInterfaceCount();
      showInterfaceCount();
    }


    _i.clearInterfaceCount = function() {
      numInterfaces = 0;
      label.css( "color" , "#333333" );
      showInterfaceCount();
    }


    _i.highlightInterfaces = function( arrInterfaces ) {
    
      if ( _i.treeLevel == 0 ) {
        if ( numInterfaces == 0 ) {
          label.css( "color", "#B3B3B3" )
        } else {
          label.css( "color", "#333333" )
        }
        return;
      }
      
      if ( arrInterfaces.indexOf(_i.model.url) > -1 ) {
        label.css( "color", "#333333" )
      } else {
        label.css( "color", "#B3B3B3" )
      }
      
    }
    
    
    _i.countInterfaces = function( arrInterfaces ) {

      if ( arrInterfaces.indexOf(_i.model.url) > -1 )
      {
          label.css( "color" , "#333333" );
          label.addClass( "fntBold" );
          _i.parentObject.incInterfaceCount();
      }
      
    }


    // private methods
    
    function showInterfaceCount(){
      if ( numInterfaces > 0 ) {
        interfaceCount.html( "(" + numInterfaces + ")" )
      } else {
        interfaceCount.html("");
      }
    }


    function openNode(){
      if ( toggleButton.hasClass("open")) { return; }
      toggleButton.removeClass("closed").addClass("open");
      childNodeContainer.animate({"height":"toggle"},{duration:150});
    }

  
    function closeNode(){
      if ( toggleButton.hasClass("closed")) { return; }
      toggleButton.removeClass("open").addClass("closed");
      childNodeContainer.animate({"height":"toggle"},{duration:150});
    }
    
        
    function toggleButtonClick(e){

      var newState = (toggleButton.hasClass("closed")) ? "open" : "closed";

      if ( newState == "open" ) {
        openNode();
      } else {
        closeNode();
      }
      
      if (e.ctrlKey) {
        $.each( childNodes, function(idx,itm) {
          itm.setChildNodes( newState );
        })
      }
            
      return false;
    }


    function firewallClick() {
      loadingIndicator.show();
      _i.callback( _i.model.url, firewallLoadComplete );
      return false;
    }
    
    
    function firewallLoadComplete() {
      loadingIndicator.hide();
    }
    
    
    // constructor
    function initialize(){

      nodeCollection.push( _i );

      parentNode.parent().css("overflowX","hidden");
      parentNode.css( "width" , "100%" );

      if ( model.nodes && model.nodes.length ) {
        $.each( model.nodes, function(idx,itm){
          childNodes.push( new TreeNode( childNodeContainer, _i, treeLevel + 1, itm, _i.callback, nodeCollection ) );
        })
      } else {
        toggleButton.css("visibility","hidden");
      }

      if ( model.url ) {
        label.bind( "click" , firewallClick );
      }

      return _i;
    }

    return initialize();
  }


  function Tree( parentNode, options ) {

    // self
    var _i = this;
    

    // private properties
    var nodeCollection = [];


    // dom structures
    var container = $("<div/>")
      .attr({
        "class" : "blockFloatNot unselectable"
      })
      .css({
        "width" : "100%",
        "height" : "auto",
        "fontSize" : "11px"
      })
      .appendTo( parentNode );


    // public methods

    _i.showInterfaceCount = function( arrInterfaces ) {
      //do the clear at a higher level
      //_i.clearInterfaceCount();
      $.each( nodeCollection, function(idx,itm) {
        itm.countInterfaces( arrInterfaces );
      })
      
      $.each( nodeCollection, function(idx,itm) {
        itm.highlightInterfaces( arrInterfaces );
      })
    }


    _i.clearInterfaceCount = function() {
      $.each( nodeCollection, function(idx,itm) {
        itm.clearInterfaceCount();
      })
    }


    // constructor
    function initialize(){

      parentNode.css( "width" , "100%" );

      $.each( options.nodes, function(idx,itm) {
        new TreeNode( container, _i, 0, itm, options.callback, nodeCollection );
      })

      return _i;
    }
    
    return initialize();
  }


}( jQuery,window,document ));
