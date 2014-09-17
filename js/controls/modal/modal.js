

(function ($,window,document,undefined) {

  var unitName = "modal";  
  $[unitName] = $[unitName] || {};  
  $[unitName].defaults = {};


  $.fn[unitName] = function (params) {
  
    // create a new class object
    if ( typeof params === 'object' || params==null ) 
    {
      this.each(function () { 
        var extendedOptions = $.extend( true, {}, $[unitName].defaults, params);
        if (!$(this).data(unitName)) {
          $(this).data(unitName, new Modal($(this), extendedOptions)); 
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


  function Modal( parentNode, options ) {

    // self
    var _i = this;
  

    // dom structures
    var container  = $("<div/>")
                      .css({
                        "position" : "absolute",
                        "width" : "100%",
                        "height" : "100%",
                        "backgroundColor" : "#FFFFFF",
                        "zIndex" : 10000,
                        "opacity" : .5
                      })
                      .hide()
                      .appendTo(parentNode); 

    var center = $("<div/>")
      .css({
        "position" : "absolute",
        "left" : "50%",
        "top" : "50%"
      }).appendTo(container);


    var logo = $( getSprite(sprites.f5only) )
      .css({
        "position" : "absolute",
        "left" : "-22px",
        "top" : "-22px"
      }).appendTo(center);


    var spinner = $("<img/>")
      .attr({
        "src" : "images/ajaxl-loader.gif"
      })
      .css({
        "position" : "absolute",
        "left" : "-33px",
        "top" : "-33px"
      }).appendTo(center);

    
    // public methods
    _i.show = function() {  
      container.show();
    }
   

    _i.hide = function() {
      container.hide();
    }


    // constructor
    function initialize(){
      
      return _i;
    }
    
    return initialize();
  }


}( jQuery,window,document ));
