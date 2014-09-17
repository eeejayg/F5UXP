

// simple utility functions specific to this application


// shorten a firewall URI for display in panel header
function shortFirewallName( name )
{
  var retVal = name.replace("devices/","").replace("firewall/","");  
  if ( retVal.length > 35 ) {
    retVal = retVal.substr(0,35) + "&hellip;";
  }  
  return retVal;
}
  
  
// return a smaller subarray of unique items
function uniqueArray( numToGet, itemArray )
{
  var arr = JSON.parse(JSON.stringify(itemArray));
  var retVal = [];

  for ( var i = 0; i < numToGet; i++ ) {
    var idx = Math.floor(Math.random() * arr.length);
    retVal.push( arr[idx] );
    arr.splice(idx,1);
  }

  return retVal;
}


// take a Javascript date object and convert it to
// the date string type used by the BIG-IP data model
function apiDateString(dto) {
  // ISO: yyyy-mm-ddThh:mm:ss.msZ
  // API: yyyy-mm-dd:hh:mm:ss
  return dto.toISOString().replace("T", ":").split(".")[0];
}


// convert an API date string to an ISO string
// for subsequent conversion to a date object
// needed for IE compatibility since IE will not
// parse an API date string
function apiDateStringToISODateString( str ) {
  if ( str == "" ) { return "" }
  return str.substr(0,str.indexOf(":")) + "T" + str.substr(str.indexOf(":")+1) + ".000Z";
}


