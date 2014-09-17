
(function ($,window,document,undefined) {

  var unitName = "mainheader";  
  $[unitName] = $[unitName] || {};  
  $[unitName].defaults = {};


  $.fn[unitName] = function (params) {
  
    // create a new class object
    if ( typeof params === 'object' || params==null ) 
    {
      this.each(function () { 
        var extendedOptions = $.extend( true, {}, $[unitName].defaults, params);
        if (!$(this).data(unitName)) {
          $(this).data(unitName, new MainHeader($(this), extendedOptions)); 
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


  function MainHeader( rootjQuery, options ) {
    var self = this;
  
    var container  = $("<div/>")
      .attr({"class" : "blockFloatNot"})
      .css({
        "width" : "100%",
        "height" : "auto",
        "marginTop" : "35px",
        "minWidth" : "1200px"
      })
      .appendTo(rootjQuery);
    
    var logo = $(getSprite(sprites.newLogo))
      .attr({
        "class" : "blockFloat"
      })
      .css("marginLeft","35px")
      .appendTo(container);

    var filterBar = $(getSprite(sprites.filterBarProxy))
      .attr({
        "class" : "blockFloat"
      })
      .css({
        "marginLeft" : "136px"
      })
      .appendTo(container);

    var saveButton = $(getSprite(sprites.saveButton))
      .attr({
        "class" : "blockFloatRight"
      })
      .css({
        "marginRight" : "37px",
        "cursor" : "pointer"
      })
      .bind( "click" , function() { saveButtonClick(); return false; } )
      .appendTo(container);

    
    // public methods
    
    self.minimize = function() {
      filterBar.hide();
      saveButton.hide();
    }
    
    
    function initialize() {
      return self;
    }
    
    return initialize();
  }


} (jQuery));
