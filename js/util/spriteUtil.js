

// Creates and returns a DIV with the specified sprite
// centered vertically and horizontally
// Example: var myCenteredSprite = centeredSprite( mySpriteDefinitions.someSpriteDef )

function centeredSprite( spriteDef )
{
  var outer = document.createElement("DIV");
  var inner = document.createElement("DIV");
  var center = document.createElement("DIV");

  outer.style.position = "absolute";
  outer.style.display = "block";
  outer.style.width = "100%";
  outer.style.height = "100%";
  outer.style.left = "0px";
  outer.style.top = "0px";

  center.style.position = "absolute";
  center.style.display = "block";
  center.style.width = "1px";
  center.style.height = "1px";
  center.style.left = "50%";
  center.style.top = "50%";

  inner.style.position = "absolute";
  inner.style.display = "block";
  inner.style.left = -Math.round(spriteDef.width/2) + "px";
  inner.style.top = -Math.round(spriteDef.height/2) + "px";
  inner.style.width = spriteDef.width + "px";
  inner.style.height = spriteDef.height + "px";
  inner.style.backgroundImage = "url(" + spriteDef.backgroundImage + ")";
  inner.style.backgroundPosition = spriteDef.xOffset + "px " + spriteDef.yOffset + "px";

  
  if ( spriteDef.backgroundRepeat )
  {
    inner.style.backgroundRepeat = spriteDef.backgroundRepeat;
  }
  else
  {
    inner.style.backgroundRepeat = "no-repeat";
  }

  outer.appendChild(center);
  center.appendChild(inner);
  outer.inner = inner;

  return outer;
}


// Creates and returns a DIV with the specified sprite
// If optionalContainer is passed, the sprite is applied to the passed DIV
// instead of creating a new one.
// Example:  var myDiv = getSprite( componentSprites.unselectedCheckbox

function getSprite( spriteDef, optionalContainer )
{
  if ( optionalContainer )
  {
    var dv = optionalContainer;
  }
  else
  {
    var dv = document.createElement("DIV");
  }

  dv.style.width = spriteDef.width + "px";
  dv.style.height = spriteDef.height + "px"
  dv.style.backgroundImage = "url(" + spriteDef.backgroundImage + ")";
  dv.style.backgroundPosition = spriteDef.xOffset + "px " + spriteDef.yOffset + "px";

  if ( spriteDef.backgroundRepeat )
  {
    dv.style.backgroundRepeat = spriteDef.backgroundRepeat;
  }
  else
  {
    dv.style.backgroundRepeat = "no-repeat";
  }

  return dv;
}


// apply sprite offset to an existing sprite
function applySpriteOffset( container, spriteDef )
{
  container.style.backgroundPosition = spriteDef.xOffset + "px " + spriteDef.yOffset + "px";
}


// Takes a sprite definition a returns a background
// that can be resized.  Used in unit "stretchyBar"
// and would be ideal for button backgrounds as well.
// 
function backgroundBar( spriteDef )
{
  var _i = this;
  
  // params
  _i.spriteDef = spriteDef;
  
  
  // locals
  _i.container = null;
  _i.loEndcap = null;
  _i.hiEndcap = null;
  _i.middle = null;
  _i.filler = null;
  _i.fillerSize = null;
  _i.middleInner = null;
  _i.middleInnerSize = null;
      
 
  // const
  _i.maxMultiplier = 10;
  _i.endcapSize = 10;
  
  
  _i.hide = function()
  {
    _i.container.style.display = "none";
  }


  _i.show = function()
  {
    _i.container.style.display = "block";
  }


  _i.constructor = function()
  {
    if ( _i.spriteDef.endcapSize )
    {
      _i.endcapSize = _i.spriteDef.endcapSize;
    }

    var bgUrl = "url(" + _i.spriteDef.backgroundImage + ")";

    _i.container = document.createElement("DIV");
    _i.container.style.position = "absolute";
    _i.container.style.left = "0px";
    _i.container.style.top = "0px";
    
    if ( _i.spriteDef.width > _i.spriteDef.height )
    {
      _i.container.style.width = "100%";
      _i.container.style.height = _i.spriteDef.height + "px";
    }
    else
    {
      _i.container.style.width = _i.spriteDef.width + "px";
      _i.container.style.height = "100%";
    }
     
    _i.loEndcap = document.createElement("DIV");
    _i.loEndcap.style.position = "absolute";
    _i.loEndcap.style.left = "0px";
    _i.loEndcap.style.overflow = "hidden";
    
    if ( _i.spriteDef.width > _i.spriteDef.height )
    {
      _i.loEndcap.style.width = _i.endcapSize + "px";
      _i.loEndcap.style.height = _i.spriteDef.height + "px";
    }
    else
    {
      _i.loEndcap.style.width = _i.spriteDef.width + "px";
      _i.loEndcap.style.height = _i.endcapSize + "px";
    }
    
    _i.loEndcap.style.backgroundImage = bgUrl;
    _i.loEndcap.style.backgroundRepeat = "no-repeat";
    _i.loEndcap.style.backgroundPosition = _i.spriteDef.xOffset + "px " + _i.spriteDef.yOffset + "px";
    
    _i.hiEndcap = document.createElement("DIV");
    _i.hiEndcap.style.position = "absolute";
    _i.hiEndcap.style.overflow = "hidden";
    
    if ( _i.spriteDef.width > _i.spriteDef.height )
    {
      _i.hiEndcap.style.right = "0px";
      _i.hiEndcap.style.width = _i.endcapSize + "px";
      _i.hiEndcap.style.height = _i.spriteDef.height + "px";
      _i.hiEndcap.style.backgroundPosition = _i.spriteDef.xOffset - _i.spriteDef.width + _i.endcapSize + "px " + _i.spriteDef.yOffset + "px";
    }
    else
    {
      _i.hiEndcap.style.left = "0px";
      _i.hiEndcap.style.bottom = "0px";
      _i.hiEndcap.style.width = _i.spriteDef.width + "px";
      _i.hiEndcap.style.height = _i.endcapSize + "px";
      _i.hiEndcap.style.backgroundPosition = _i.spriteDef.xOffset + "px " + (_i.spriteDef.yOffset - _i.spriteDef.height + _i.endcapSize) + "px";
    }
    
    _i.hiEndcap.style.backgroundImage = bgUrl;
    _i.hiEndcap.style.backgroundRepeat = "no-repeat";

    _i.middle = document.createElement("DIV");
    _i.middle.style.position = "absolute";
    
    if ( _i.spriteDef.width > _i.spriteDef.height )
    {
      _i.middle.style.left = _i.endcapSize + "px";
      _i.middle.style.right = _i.endcapSize + "px";
      _i.middle.style.height = _i.spriteDef.height + "px";
    }
    else
    {
      _i.middle.style.top = _i.endcapSize + "px";
      _i.middle.style.bottom = _i.endcapSize + "px";
      _i.middle.style.width = _i.spriteDef.width + "px";
    }

    _i.middle.style.overflow = "hidden";
    
    if ( _i.spriteDef.width > _i.spriteDef.height )
    {
      _i.middleInnerSize = (_i.spriteDef.width - _i.endcapSize - _i.endcapSize) * _i.maxMultiplier;
    }
    else
    {
      _i.middleInnerSize = (_i.spriteDef.height - _i.endcapSize - _i.endcapSize) * _i.maxMultiplier;
    }
    
    _i.middleInner = document.createElement("DIV");
    _i.middleInner.style.position = "absolute";
    _i.middleInner.style.left = "0px";
    _i.middleInner.style.top = "0px";
    _i.middleInner.style.overflow = "hidden";
    
    if ( _i.spriteDef.width > _i.spriteDef.height )
    {
      _i.middleInner.style.width = _i.middleInnerSize + "px";
      _i.middleInner.style.height = "100%";
    }
    else
    {
      _i.middleInner.style.height = _i.middleInnerSize + "px";
      _i.middleInner.style.width = "100%";
    }
    
    if ( _i.spriteDef.width > _i.spriteDef.height )
    {
      _i.fillerSize = (_i.spriteDef.width - _i.endcapSize - _i.endcapSize)
    }
    else
    {
      _i.fillerSize = (_i.spriteDef.height - _i.endcapSize - _i.endcapSize)
    }
    
    _i.filler = document.createElement("DIV");
    
    if ( _i.spriteDef.width > _i.spriteDef.height )
    {
      _i.filler.className = "blockFloat";
      _i.filler.style.width = _i.fillerSize + "px";
      _i.filler.style.height = _i.spriteDef.height + "px";
      _i.filler.style.backgroundPosition = _i.spriteDef.xOffset - _i.endcapSize + "px " + _i.spriteDef.yOffset + "px";
    }
    else
    {
      _i.filler.className = "blockFloatNot";
      _i.filler.style.width = _i.spriteDef.width + "px";
      _i.filler.style.height = _i.fillerSize + "px";
      _i.filler.style.backgroundPosition = _i.spriteDef.xOffset + "px " + (_i.spriteDef.yOffset - _i.endcapSize) + "px";
    }

    _i.filler.style.overflow = "hidden";
    _i.filler.style.backgroundImage = bgUrl;
    _i.filler.style.backgroundRepeat = "no-repeat";
    
    for ( var z = 0; z < Math.ceil(_i.middleInnerSize / _i.fillerSize); z++ )
    {
      _i.middleInner.appendChild( _i.filler.cloneNode(false) );
    }
    
    _i.container.appendChild(_i.loEndcap);
    _i.container.appendChild(_i.middle);
    _i.middle.appendChild(_i.middleInner);
    _i.container.appendChild(_i.hiEndcap);       
  }
  
  _i.constructor();
}


