
function serverTimeLocalToUTC(time) {
  var d = new Date();
  return time + d.getTimezoneOffset() * 60;
}

function serverTimeUTCToLocal(time) {
  var d = new Date();
  return time - d.getTimezoneOffset() * 60;
}

// add prototype to set time to midnite
Date.prototype.toStartOfDay = Date.prototype.toStartOfDay || function() {
  this.setHours(0);
  this.setMinutes(0);
  this.setSeconds(0);
  this.setMilliseconds(0);
  return this;
}


// add a browser class to the BODY tag to allow for
// fussy subclassing
function addBrowserClass()
{
  if ( navigator.userAgent.toLowerCase().indexOf("ipad") > -1 ) {
    $(document.body).addClass("ipad"); 
  }

  if ( navigator.userAgent.toLowerCase().indexOf("msie") > -1 ) {
    $(document.body).addClass("msie");
  }
}


// if iPad browser mode give instructions for adding app icon to
// the iPad home screen so app can be relaunched in app mode
function iPadBrowserMode()
{
  var _i = this;

  if ( navigator.userAgent.toLowerCase().indexOf("ipad") == -1 ) { return false; }
  if ( window.navigator.standalone ) { return false; }

  return true;
}


// return version number for IE
function getIEVersionNumber() {
    var ua = navigator.userAgent;
    var MSIEOffset = ua.indexOf("MSIE ");
    
    if (MSIEOffset == -1) {
        return 0;
    } else {
        return parseFloat(ua.substring(MSIEOffset + 5, ua.indexOf(";", MSIEOffset)));
    }
}


// find the highest Z index value
// in the entire DOM
function getHighestZIndex()
{
  retVal = 0;
	
	var tagArray = ["DIV","IFRAME","IMG","A","UL","LI","OBJECT"];
	
	for ( y = 0; y < tagArray.length; y++ )
	{
			var curTag = tagArray[y];
			var a = document.getElementsByTagName(curTag);
			for ( var z = 0; z < a.length; z++ )
			{
				var i = xGetComputedStyle(a[z],"z-index",true);
				if (i)
				{
					if (i > retVal) { retVal = i; }
				}
			}			
	}
		
  return retVal;
}


// list of startup messages for
// failed startup
var startupMsgs = {
  "ipadBrowserMode" : "Tap the <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAYCAYAAADtaU2/AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAVhJREFUeNpidJixi4ESsD/dFc52nLlbAch/QIw+JgbqgvNAywsGwmIBIO4HWr4fiAXoaTEMOADxfaDlAfS2GOb79UDL52PzPSOFiUsBiuFpDYc6UIJLBCa8A8g+/k8AN2DxCUjsPhTvR8L4HAiK9wZkH//Ho+ECEBsi8RNAiQdqObkAZGYiC5IAKBgOoinagMSeD7WYUmAAintkiw9iCVZqWwrzYCALEQoDsFj6AIqxZSN8oBGYwMCeI8bifjTXNkJpbEXmfzypOhCo9gJMgIWIggCWXQqBeAIZQbsBmpU+IAsSYzEIJALxAhItBFlUCLQQqz5CFttDg3YBGVkmEF9NxUKEAQ0kWjoBaGEhpbVTIYmWOsIsBZXPQJxAl0oCVhZDayVQcRpP79opn1CxSstqES9ATlzyRJQ8mJE6czeuuphoixOoWB7Tvc1FUlA70tD8D7gkAAIMAGwRamKGDR9hAAAAAElFTkSuQmCC' /> button above and choose <span>Add to Home Screen</span>, then launch Axiom from the home screen.",
  "compatibleVersions" : "The F5 Firewall Editor is designed to work with <span>IE9</span> and current versions of <span>Chrome</span>, <span>Safari</span>, <span>Firefox</span>, <span>Opera</span>."
}


// display startup
// message
function startupMsg( msg )
{
  var _i = this;

  _i.center = document.createElement("DIV");
  _i.center.className = "horizontalCenter";

  _i.msg = document.createElement("DIV");
  _i.msg.id = "startupMsg";

  var mainCon = document.getElementById("mainContainer");
  mainCon.style.backgroundColor = "#EAEAEB";
  mainCon.appendChild(_i.center);
  _i.center.appendChild(_i.msg);

  _i.msg.innerHTML = msg;  
}


// shim for placeholder text used in IE which
// does not support <input placeholder="defaulttext"></>
function placeholderShim( el )
{
  if ('placeholder' in document.createElement('input')) { return; }

  var _i = this;


  // locals
  var l = {};
  l.color = null;
  l.placeholderText = null;


  // constants
  var c = {};
  c.placeholderColor = "#A9A9A9";


  l.onBlur = function() {
    if (( el.value == "" ) || ( el.value == l.placeholderText )) {
      el.style.color = c.placeholderColor;
      el.value = l.placeholderText;
    }  
  }


  l.onFocus = function() {
    if ( el.value == l.placeholderText ) {
      el.value = "";
      el.style.color = l.color;
    }
  }
  

  l.init = function() {
    l.color = el.style.color;
    l.placeholderText = el.placeholder;
    xAddEventListener( el, "blur", l.onBlur, false );
    xAddEventListener( el, "focus", l.onFocus, false ); 
    l.onBlur();       
  }();

}


// return a color that is the percent 
// between color1 and color2
function interpolateHexColor( color1, color2, percent )
{
  red1 = parseInt( color1.substr(1,2), 16 );
  green1 = parseInt( color1.substr(3,2), 16 );
  blue1 = parseInt( color1.substr(5,2), 16 );
  
  red2 = parseInt( color2.substr(1,2), 16 );
  green2 = parseInt( color2.substr(3,2), 16 );
  blue2 = parseInt( color2.substr(5,2), 16 );
  
  red3 = Math.round(( red2 - red1 ) * percent + red1);
  green3 = Math.round(( green2 - green1 ) * percent + green1);
  blue3 = Math.round(( blue2 - blue1 ) * percent + blue1);
  
  return "#" + red3.toString(16) + green3.toString(16) + blue3.toString(16);    
}


// cross-browser mousewheel handler
function mouseWheelHandler(obj, userHandler)
{
	var _i = this;

	function wheelEvent(event)
	{
		var delta = 0;
		
		event = window.event || event;
		
	  if (event.wheelDelta) 
	  {
	  	delta = event.wheelDelta/120;
	  	if (window.opera) delta = -delta;
		} 
		
		if (event.detail) { delta = -event.detail/3; }
		
	 	if (delta) { userHandler(delta,event); }
	 	
    Awe.cancelEvent(event);
			
	}

	if (typeof(obj)=="string") obj = document.getElementById(obj);
	
	if (window.addEventListener) { obj.addEventListener('DOMMouseScroll', wheelEvent, false); }
	obj.onmousewheel = wheelEvent;
	
}

