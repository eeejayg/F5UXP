
function transport( dataStore )
{
  var _i = this;

  // params
  _i.dataStore = dataStore;


  _i.putObject = function( obj, resourceURI, callback )
  {
    // obj would come back from Couch as { "_id", "_rev", "field1", "field2"....}
    // encapsulate "field1", "field2"... with "data"
    obj = { data : JSON.parse(JSON.stringify(obj)) }   
    
    var fullUrl = dbUrl + "objects/" + resourceURI.replace(/\//g,"~");
  
    $.ajax({
      type: "POST",
      url: fullUrl,
      data: JSON.stringify( obj ),
      success: function() { console.log("NETWORK PUT " + resourceURI); callback && callback(); },
      error: function() { console.log("FAILED to put object name: " + resourceURI ) },
      processData: false
      });
    
  }
  
  
  _i.getObject = function( resourceURI, callback ) {
    
    console.log("NETWORK GET " + resourceURI);
    
    var fullUrl = dbUrl + "objects/" + resourceURI.replace(/\//g,"~");

    $.ajax({
      type: "GET",
      url: fullUrl,
      success: function( returnedString, jQueryStatusCode, requestObject ) { _i.saveAndReturn( resourceURI, returnedString, callback ); },
      error: function() { console.log("AJAX FAILED to get object name: " + resourceURI) },
      processData: false
    });
  }
  
 
  _i.saveAndReturn = function( resourceURI, returnedString, callback ) {
  
    var obj = JSON.parse(returnedString);
    
    if ( obj.error ) {
      console.log("AJAX SUCCESS BUT DB RETURNED ERROR: " + obj.error );
      console.log("  obj.error: " + obj.error );
      console.log("  resourceURI: " + resourceURI );
      return;
    }
   
    if ( !callback ) {
      console.log("AJAX SUCCESS BUT NO CALLBACK SPECIFIED");
      return;
    }
   
    _i.dataStore[resourceURI] = obj.obj.data;
     
    callback( obj.obj.data );
  }


  _i.init = function() {
  }();
  
}


function localData()
{
  var _i = this;
  

  _i.transport = null;
  _i.dataStore = null;
  _i.numCallbacks = null;
    

  _i.decrementCallbackCount = function()
  {
    _i.numCallbacks--;
    
    if ( _i.numCallbacks == 0 ) {
      _i.callbacksDone && _i.callbacksDone();
    }
  }
  
  
  _i.saveEnterprise = function() {
  
    _i.numCallbacks = 0;
    
    $.each( _i.dataStore, function(idx,itm) {
      _i.numCallbacks++;
    })
    
    _i.callbacksDone = function() { 
      $("#mainContainer").modal("hide");
    };
    
    $.each( _i.dataStore, function(idx,itm) {
      var resourceURI = idx;
      _i.transport.putObject( itm, resourceURI, _i.decrementCallbackCount );
    })

  }
  
    
  _i.getObject = function( resourceURI, callback ) {
  
    if ( _i.dataStore[resourceURI] ) {
      console.log("LOCAL GET " + resourceURI );
      callback && callback( _i.dataStore[resourceURI] );
      return;
    }
    
    _i.transport.getObject( resourceURI, callback );
  }


  // get a list of firewalls that use this static object
  _i.getObjectInterfaces = function( name, callback, resourceURIOnly ) {
    var resourceURI = "interfaces/" + name;
    if ( resourceURIOnly ) { return resourceURI; }
    _i.getObject( resourceURI, callback );
  }


  _i.getAddressList = function( name, callback, resourceURIOnly ) {
    var resourceURI = "address-lists/" + name;
    if ( resourceURIOnly ) { return resourceURi; }
    _i.getObject( resourceURI, callback );
  }


  _i.getAddressListLocal = function(name) {
    var resourceURI = _i.getAddressList(name, null, true);
    return _i.dataStore[resourceURI];
  }
  
  
  _i.getSchedule = function( name, callback, resourceURIOnly ) {
    var resourceURI = "schedules/" + name;
    if ( resourceURIOnly ) { return resourceURI; }
    _i.getObject( resourceURI, callback );
  }
  
  
  _i.getScheduleLocal = function(name) {
    var resourceURI = _i.getSchedule(name, null, true);
    return _i.dataStore[resourceURI];
  }
  
  
  _i.getPortList = function( name, callback, resourceURIOnly ) {
    var resourceURI = "port-lists/" + name;
    if ( resourceURIOnly ) { return resourceURI; }
    _i.getObject( resourceURI, callback );
  }
    
    
  _i.getPortListLocal = function(name) {
    var resourceURI = _i.getPortList(name, null, true);
    return _i.dataStore[resourceURI];
  }


  _i.getRuleList = function( name, callback, resourceURIOnly ) {
    var resourceURI = "rule-lists/" + name;
    if ( resourceURIOnly ) { return resourceURI; }
    _i.getObject( resourceURI, callback );
  }
  
  
  _i.getRuleListLocal = function(name) {
    var resourceURI = _i.getRuleList(name, null, true);
    return _i.dataStore[resourceURI];
  }
  
  
  _i.getCollection = function( name, callback, resourceURIOnly ) {
    var resourceURI = name;
    if ( resourceURIOnly ) { return resourceURI; }
    _i.getObject( resourceURI, callback );
  }      


  _i.init = function()
  {
    _i.dataStore = {};
    _i.transport = new transport( _i.dataStore );
  }();   
  
}

