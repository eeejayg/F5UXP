

// these models are used only for creating mock data
// mock data is created and put to the cloud-based Couch DB
// with the createDB() function of mockServer

deviceModel = {};
enterpriseModel = {};


deviceModel.device = {
  "name" : "",
  "DeviceGlobal" : { "firewall" : null },
  "ManagementIP" : [],
  "RouteDomain" : []
}

deviceModel.managementIP = {
  "ip" : "",
  "firewall" : null
}

deviceModel.routeDomain = {
  "id" : "",
  "firewall" : null,
  "VIP" : [],
  "SelfIP" : []
}

deviceModel.interface = {
  "ip" : "",
  "name" : "",
  "firewall" : null
}


enterpriseModel.collections = {

  "address-lists" : [],
  "port-lists" : [],
  "schedules" : [],
  "rule-lists" : [],
  "devices" : [],
  "firewalls": [],

  // arrays of interfaces showing which interfaces use "sched243" for example
  "objectInterfaces" : [],
  // nodes for loading into tree control
  "interfaceNodes" : [],

  addressListObjects : {},
  portListObjects : {},
  scheduleObjects : {},
  ruleListObjects : {},
  deviceObjects: {},
  firewallObjects: {}
}


var mockAddressListCollection = [];
var mockPortListCollection = [];
var mockScheduleCollection = [];
var mockRuleListCollection = [];

var numMockSchedules = 10;
var numMockRuleLists = 10;
var numMockAddressLists = 10;
var numMockPortLists = 10;

var maxMockRulesOrListsPerFirewall = 100;
var maxMockVIPsPerRouteDomain = 100;
var numMockDevices = 50;


// save all mock names used like "rule1543" and "addressList349" so unique names can be gotten
var mockNameCollection = [];
function uniqueMockName( nameRoot, range )
{
  var retVal = nameRoot + (Math.round(Math.random() * range) + 1);
  
  while ( mockNameCollection[retVal] )
  {
    retVal = nameRoot + (Math.round(Math.random() * range) + 1);
  }
  
  mockNameCollection[mockNameCollection.length] = retVal;
  mockNameCollection[retVal] = retVal;
  
  return retVal;
}


function mockRule()
{
  var retVal = JSON.parse(JSON.stringify(sharedObjectsModel.rule));

  // name
  retVal["name"] = uniqueMockName( "rule", 100000 );
  
  // description
  (Math.random() > .5) && ( retVal["description"] = mockRuleDescriptions[Math.floor(Math.random() * mockRuleDescriptions.length)] );

  // status
  retVal["status"] = ruleStatusEnumeration[Math.floor(Math.random() * ruleStatusEnumeration.length)];

  // protocol
  retVal["ip-protocol"] = "Any";
  (Math.random() > .75) && ( retVal["ip-protocol"] = protocolEnumeration[Math.floor(Math.random() * protocolEnumeration.length)] );

  // action
  retVal["action"] = ruleActionEnumeration[Math.floor(Math.random() * ruleActionEnumeration.length)];

  // source.addresses
  var addrArray = retVal["source"]["addresses"];
  if ( Math.random() > .5 ) {
    var numAddrs = Math.random() * 3 + 1;
    for ( var i = 0; i < numAddrs; i++ )
    {
      addrArray[addrArray.length] = mockAddress();
    }
  }

  // source.ports
  var portsArray = retVal["source"]["ports"];
  if ( Math.random() > .5 ) {
    var numPorts = Math.random() * 3 + 1;
    for ( var i = 0; i < numPorts; i++ )
    {
      portsArray[portsArray.length] = mockPort();
    }
  }

  // make certain there are some address lists to choose from
  while (mockAddressListCollection.length < numMockAddressLists) {
    mockAddressListCollection.push( mockAddressList() );
  }

  // source.address-lists
  var addressListArray = retVal["source"]["address-lists"];
  if ( Math.random() > .5 ) {
    var numAddressLists = Math.floor(Math.random() * 5) + 1;
    var arr = uniqueArray( numAddressLists, mockAddressListCollection );
    $.each( arr, function(idx,itm) {
      addressListArray.push( itm.name );
    })
  }

  // make certain there are some port lists to choose from
  while (mockPortListCollection.length < numMockPortLists) {
    mockPortListCollection.push( mockPortList() );
  }

  // source.port-lists
  var portListArray = retVal["source"]["port-lists"];
  if ( Math.random() > .5 ) {
    var numPortLists = Math.floor(Math.random() * 5) + 1;
    var arr = uniqueArray(numPortLists, mockPortListCollection);
    $.each( arr, function(idx,itm) {
      portListArray.push( itm.name );
    })
  }

  // source.vlans
  if ( Math.random() > .8 ) {
    var vlanArray = retVal["source"]["vlans"];
    var numVlans = Math.round(Math.random()) + 1;
    var startIndexIntoVlans = Math.floor(Math.random() * 3);
    for ( var i = 0; i < numVlans; i++ )
    {
      vlanArray[i] = mockVLANs[i+startIndexIntoVlans]; 
    }
  }

  // destination.addresses
  var addrArray = retVal["destination"]["addresses"];
  if (Math.random() > .5) {
    var numAddrs = Math.random() * 3 + 1;
    for (var i = 0; i < numAddrs; i++) {
      addrArray[addrArray.length] = mockAddress();
    }
  }

  // destination.ports
  var portsArray = retVal["destination"]["ports"];
  if (Math.random() > .5) {
    var numPorts = Math.random() * 3 + 1;
    for (var i = 0; i < numPorts; i++) {
      portsArray[portsArray.length] = mockPort();
    }
  }

  // destination.address-lists
  var addressListArray = retVal["destination"]["address-lists"];
  if (Math.random() > .5) {
    var numAddressLists = Math.random() * 2 + 1;
    var arr = uniqueArray( numAddressLists, mockAddressListCollection );
    $.each( arr, function(idx,itm) {
      addressListArray.push( itm.name );
    })
  }

  // destination.port-lists
  var portListArray = retVal["destination"]["port-lists"];
  if (Math.random() > .5) {
    var numPortLists = Math.random() * 2 + 1;
    var arr = uniqueArray( numPortLists, mockPortListCollection );
    $.each( arr, function(idx,itm) {
      portListArray.push( itm.name );
    });
  }

  // make certain there are some schedules to choose from
  while ( mockScheduleCollection.length < numMockSchedules ) {
    mockScheduleCollection.push( mockSchedule() );
  }

  // schedule
  if ( retVal["status"] == "scheduled" ) {
    var msindex = Math.floor(Math.random() * mockScheduleCollection.length)
    retVal["schedule"] = mockScheduleCollection[msindex].name;
  }

  // log
  retVal["log"] = loggingEnumeration[Math.floor(Math.random() * loggingEnumeration.length)];

  return retVal;
}


function mockAddress()
{
  var retVal = JSON.parse(JSON.stringify(sharedObjectsModel.address));

  // address
  var addr = (Math.random() > .7) ? randomIPV6() : randomIPV4();
  retVal[addr] = retVal[""];
  delete retVal[""];

  // single address description
  if (Math.random() > .5) {
    retVal[addr] = { "description" : "" }
    retVal[addr].description = mockAddressDescriptions[Math.floor(Math.random()*mockAddressDescriptions.length)];
  }

  return retVal;
}


function mockPort()
{
  var retVal = JSON.parse(JSON.stringify(sharedObjectsModel.port));

  // port
  var port = ((Math.round(Math.random() * 354) + 1) * 100);
  if ( Math.random() > .25 )
  {
    var range = (Math.round(Math.random() * 4) + 1) * 1000;
    if ( port + range <= 65535 )
    {
      port += "-" + (port + range).toString();
    }
  }
  retVal[port] = retVal[""];
  delete retVal[""];

  // single port description
  if (Math.random() > .25) {
    retVal[port] = { "description" : "" }
    retVal[port].description = mockPortDescriptions[Math.floor(Math.random()*mockPortDescriptions.length)];
  }

  return retVal;
}


function mockAddressList()
{
  var retVal = JSON.parse(JSON.stringify(sharedObjectsModel.addressList));

  // name
  retVal["name"] = uniqueMockName( "addrList", 1000 );
  
  // description
  retVal["description"] = mockAddressListDescriptions[Math.floor(Math.random() * mockAddressListDescriptions.length)];

  // addresses
  var numAddrs = Math.floor(Math.random() * 9) + 2;
  var addrArray = retVal["addresses"];
  for ( var i = 0; i < numAddrs; i++ )
  {
    addrArray[addrArray.length] = mockAddress();
  }

  return retVal;
}


function mockPortList()
{
  var retVal = JSON.parse(JSON.stringify(sharedObjectsModel.portList));

  // name
  retVal["name"] = uniqueMockName( "portList", 1000 );

  // description
  retVal["description"] = mockPortListDescriptions[Math.floor(Math.random() * mockPortListDescriptions.length)];

  // ports
  var numPorts = Math.floor(Math.random() * 6) + 2;
  var portArray = retVal["ports"];
  for ( var i = 0; i < numPorts; i++ )
  {
    portArray[portArray.length] = mockPort();
  }

  return retVal;
}


function mockSchedule()
{
  var retVal = JSON.parse(JSON.stringify(sharedObjectsModel.schedule));

  // name
  retVal["name"] = uniqueMockName( "sched", 1000 );
  
  // description
  (Math.random() > .5 ) && (retVal["description"] = mockScheduleDescriptions[Math.floor(Math.random() * mockScheduleDescriptions.length)]);

  // date-valid-start
  (Math.random() > .5 ) && (retVal["date-valid-start"] = apiDateString(randomDate(-1)));

  // date-valid-end
  (Math.random() > .5 ) && (retVal["date-valid-end"] = apiDateString(randomDate(1)));

  // date-hour-start
  (Math.random() > .5 ) && (retVal["daily-hour-start"] = (Math.floor(Math.random() * 11) + 1).toString().leftPad(2,"0") + ":00");

  // date-hour-end
  if ( retVal["daily-hour-start"] ) {
    (Math.random() > .25) && (retVal["daily-hour-end"] = (Math.floor(Math.random() * 12) + 12).toString().leftPad(2, "0") + ":00");
  }

  // days-of-week
  var daysField = retVal["days-of-week"];

  for ( var i = 0; i < 7; i++ )
  {
    (Math.random() < .2 ) && ( daysField[daysField.length] = daysOfWeek[i] )
  }

  return retVal;
}


function mockRuleList()
{
  var retVal = JSON.parse(JSON.stringify(sharedObjectsModel.ruleList));
  
  // name
  retVal["name"] = uniqueMockName( "ruleList", 1000 );
  
  // description
  retVal["description"] = mockRuleListDescriptions[Math.floor(Math.random() * mockRuleListDescriptions.length)];
  
  // rules
  var ruleArray = retVal["rules"];
  var numRules = Math.floor(Math.random() * 15) + 1;
  for ( var i = 0; i < numRules; i++ )
  {
    ruleArray[ruleArray.length] = mockRule();
  }
    
  return retVal;
}


// when used this object is assigned a name that is different
// from the actual rule list contained therein
function mockFirewallRuleListContainer()
{
  // make certain there are some rule lists to choose from
  while ( mockRuleListCollection.length < numMockRuleLists ) {
    mockRuleListCollection.push( mockRuleList() );
  }
  
  // make certain there are some schedules to choose from
  while ( mockScheduleCollection.length < numMockSchedules ) {
    mockScheduleCollection.push( mockSchedule() );
  }
  
  var retVal = JSON.parse(JSON.stringify(sharedObjectsModel.firewallRuleListContainer));
  
  // description
  retVal["description"] = mockFirewallRuleListContainerDescriptions[Math.floor(Math.random() * mockFirewallRuleListContainerDescriptions.length)];
  
  // rule-list
  retVal["rule-list"] = mockRuleListCollection[Math.floor(Math.random() * mockRuleListCollection.length)].name;
  
  // state
  retVal["state"] = firewallStatusEnumeration[Math.floor(Math.random() * firewallStatusEnumeration.length)];
  
  // schedule
  if ( Math.random() > .5 )
  {
    retVal["schedule"] = mockScheduleCollection[Math.floor(Math.random()*mockScheduleCollection.length)].name;
  }
  
  return retVal;
}

function arrayOfMockRulesAndRuleLists()
{
  var numItems = Math.floor(Math.random() * maxMockRulesOrListsPerFirewall) + 1;

  var arr = [];
  
  for ( var i = 0; i < numItems; i++ )
  {
    var obj = {};
    
    if ( Math.random() < .2 ) {
    // add a rule a few of the time
      var ruleName = uniqueMockName( "fwrn", 100000 );
      obj[ruleName] = mockRule();
    } else {
    // add a rule list most of the time
      var ruleListName = uniqueMockName( "fwrlcn", 100000 );
      // a rule list has a rule list container object whose name is different
      // from the actual rule list
      obj[ruleListName] = mockFirewallRuleListContainer();
    }
    
    arr[arr.length] = obj;   
  }
 
  return arr;
}


function mockDeviceGlobalFirewall()
{
  var retVal = JSON.parse(JSON.stringify(sharedObjectsModel.deviceGlobalFirewall));
  
  //rules
  if ( Math.random() < .9 ) {
    retVal["rules"] = arrayOfMockRulesAndRuleLists();
  } else {
    retVal["rules"] = [];
  }
  
  return retVal;
}


function mockRouteDomainFirewall( rdID )
{
  rdID = String(rdID || 0);
  
  var retVal = JSON.parse(JSON.stringify(sharedObjectsModel.routeDomainFirewall));
 
  // id
  retVal["id"] = rdID; 
  
  // description
  retVal["description"] = mockFirewallDescriptions[Math.floor(Math.random() * mockFirewallDescriptions.length)];
  
  // rules
  if ( Math.random() < .5 ) {
    retVal["fw-rules"] = arrayOfMockRulesAndRuleLists();
  } else {
    retVal["fw-rules"] = [];
  }

  return retVal;
}

// mock Management, SelfIP, or VIP firewall
function mockFirewall( deviceIP )
{
  deviceIP = deviceIP || "1.1.1.1";
  
  var retVal = JSON.parse(JSON.stringify(sharedObjectsModel.firewall));
  
  // name
  retVal["name"] = deviceIP;
  
  // description
  retVal["description"] = mockFirewallDescriptions[Math.floor(Math.random() * mockFirewallDescriptions.length)];

  // rules
  retVal["fw-rules"] = arrayOfMockRulesAndRuleLists();   
  
  return retVal; 
}

function mockInterface()
{
  var retVal = JSON.parse(JSON.stringify(deviceModel.interface));
  retVal["ip"] = ( Math.random() < .9 ) ? randomIPV4( true ) : randomIPV6();
  retVal["name"] = "nameForInterface" + retVal["ip"];
  retVal["firewall"] = mockFirewall( retVal["ip"] );
  
  return retVal;
}

// returns array of mockInterface
function mockVIPArray( numToMock )
{
  retVal = [];
  
  for ( var i = 0; i < numToMock; i++ )
  {
    console.log("    creating mockInterface " + i + " of " + numToMock );
    retVal[i] = mockInterface();
  }
  
  return retVal;
}


function mockDevice()
{
  var retVal = JSON.parse(JSON.stringify(deviceModel.device));
  
  // name
  var locationName = mockLocationNames[Math.floor(Math.random() * mockLocationNames.length)];
  retVal["name"] = uniqueMockName( locationName, 100 );
  
  // DeviceGlobal
  retVal["DeviceGlobal"].firewall = mockDeviceGlobalFirewall();
  
  // ManagementIP
  var mip = JSON.parse(JSON.stringify(deviceModel.managementIP));
  mip.ip = randomIPV4(true);
  mip.firewall = mockFirewall(mip.ip);
  retVal["ManagementIP"][0] = mip;
     
  // RouteDomain
  var numRouteDomains = Math.round(Math.random()) + 1; // 1 or 2
  
  for ( var i = 0; i < numRouteDomains; i++ )
  {
    console.log("  creating RouteDomain" + i + " of " + numRouteDomains );
    var rdModel = JSON.parse(JSON.stringify(deviceModel.routeDomain));
    rdModel["id"] = i;
    retVal["RouteDomain"][i] = rdModel;

    // route domain firewall    
    rdModel.firewall = mockRouteDomainFirewall(i);

    // VIPs (make a random number of VIPs)
    var numVIP = Math.floor( Math.random() * maxMockVIPsPerRouteDomain ) + 1;
    console.log("  creating " + numVIP + " virtuals for RouteDomain" + i);
    rdModel["VIP"] = mockVIPArray( numVIP );
    
    // SIPs (make one)
    rdModel["SelfIP"][0] = mockInterface();  
  }


  return retVal;
}


function mockServer()
{
  var _i = this;
    

  _i.model = null;
  _i.ondonecallback = null;


  _i.getInterfaceNode = function(interfaceType, device, routeDomainIndex) 
  {
    switch (interfaceType) {

      case "DeviceGlobal":
        var obj = { label: "DeviceGlobal", nodes: [], url: "devices/" + device.name + "/firewall/global" }
        _i.model.firewallObjects[obj.url] = device["DeviceGlobal"].firewall;
        _i.model.firewalls.push( obj.url );
        $.each(device["RouteDomain"], function (idx, itm) {
          obj.nodes.push(_i.getInterfaceNode("RouteDomain", device, idx));
        })
        return obj;
        break;

      case "RouteDomain":
        var obj = { label: "RouteDomain" + routeDomainIndex, nodes: [], url: "devices/" + device.name + "/firewall/route-domains/" + routeDomainIndex };
        _i.model.firewallObjects[obj.url] = device["RouteDomain"][routeDomainIndex].firewall;
        _i.model.firewalls.push( obj.url );
        obj.nodes.push(_i.getInterfaceNode("VIP", device, routeDomainIndex));
        obj.nodes.push(_i.getInterfaceNode("SelfIP", device, routeDomainIndex));
        return obj;
        break;

      case "VIP":
        var obj = { label: "VIP", nodes: [] }
        $.each(device["RouteDomain"][routeDomainIndex]["VIP"], function (idx, itm) {
          var subObj = { label: itm.ip, url: "devices/" + device.name + "/firewall/virtuals/" + itm.ip }
          _i.model.firewallObjects[subObj.url] = device["RouteDomain"][routeDomainIndex]["VIP"][idx].firewall;
          _i.model.firewalls.push( subObj.url );
          obj.nodes.push(subObj);
        })
        return obj;
        break;

      case "SelfIP":
        var obj = { label: "SelfIP", nodes: [] }
        $.each(device["RouteDomain"][routeDomainIndex]["SelfIP"], function (idx, itm) {
          var subObj = { label: itm.ip, url: "devices/" + device.name + "/firewall/selfips/" + itm.ip }
          _i.model.firewallObjects[subObj.url] = device["RouteDomain"][routeDomainIndex]["SelfIP"][idx].firewall;
          _i.model.firewalls.push( subObj.url );
          obj.nodes.push(subObj);
        })
        return obj;
        break;

      case "Management":
        var obj = { label: "Management", nodes: [] };
        $.each(device["ManagementIP"], function (idx, itm) {
          var subObj = { label: itm.ip, url: "devices/" + device.name + "/mgmt-ips/" + itm.ip };
          _i.model.firewallObjects[subObj.url] = device["ManagementIP"][idx].firewall;
          _i.model.firewalls.push( subObj.url );
          obj.nodes.push(subObj);
        })
        return obj;
        break;
    }

  }


  _i.callbackStatus = function (inc)
  {
    _i.numCallbacks += inc;
    
    if ( _i.numCallbacks == 0 ){
      _i.ondonecallback && _i.ondonecallback();
    }
  }
  
 
  _i.getObject = function( name, callback )
  {
    _i.callbackStatus(1);
    
    console.log("server get object name: " + name );

    $.ajax({
      type: "GET",
      url: dbUrl + "objects/" + name,
      success: function( dat, jQueryStatusCode, requestObject ) { if (callback){callback(dat)}; _i.callbackStatus(-1); },
      error: function() { console.log("FAILED to get object name: " + name); },
      processData: false
    });
  }
  
   
  _i.putObject = function( obj, name, callbackIncrement )
  {
    // obj would come back from Couch as { "_id", "_rev", "field1", "field2"....}
    // encapsulate "field1", "field2"... with "data"
    obj = { data : JSON.parse(JSON.stringify(obj)) }
   
    _i.callbackStatus(callbackIncrement);
        
    $.ajax({
      type: "POST",
      url: dbUrl + "objects/" + name,
      data: JSON.stringify( obj ),
      success: function() { console.log("put object name: " + name + ", url: " + dbUrl + "objects/" + name ); _i.callbackStatus(-1); },
      error: function() { console.log("FAILED to put object name: " + name + ", url: " + dbUrl + "objects/" + name ); },
      processData: false
      });
    
  }
  
  
  _i.clearDB = function( oncallback )
  {
    $.ajax({
      type: "GET",
      url: dbUrl + "delete-all",
      success: function() { oncallback && setTimeout(oncallback) },
      error: function() { console.log("call to clear DB failed") }
    });
    
  }
  

  _i.listURLNodes = function( obj )
  {
    if ( obj.url ) {
      console.log( obj.url );
    }

    if ( obj.nodes && obj.nodes.length ) {
      $.each( obj.nodes, function(idx,itm) {
        _i.listURLNodes( itm );
      })
    }
  }

  
  _i.createDB = function( externalCallback )
  {
    _i.externalCallback = externalCallback || function() { alert("done create db"); };

    _i.model = JSON.parse(JSON.stringify(enterpriseModel.collections));
    
    for ( var i = 0; i < numMockDevices; i++ )
    {
      console.log("creating mock device " + i);
      var dvc = mockDevice();
      _i.model.deviceObjects[dvc.name] = dvc;
      _i.model.devices.push( dvc.name );
    }

    $.each( _i.model.deviceObjects, function(key,dvc) {
      var obj = { "label" : key, nodes : [] };
      obj.nodes.push( _i.getInterfaceNode( "DeviceGlobal", dvc ));
      obj.nodes.push( _i.getInterfaceNode( "Management", dvc ));
      _i.model.interfaceNodes.push(obj);
    })


    $.each( mockAddressListCollection, function(idx,itm) {
      _i.model["address-lists"].push( itm.name );
      _i.model.addressListObjects[itm.name] = itm;
    })

    $.each( mockPortListCollection, function(idx,itm) {
      _i.model["port-lists"].push( itm.name );
      _i.model.portListObjects[itm.name] = itm;
    })

    $.each( mockScheduleCollection, function(idx,itm) {
      _i.model["schedules"].push( itm.name );
      _i.model.scheduleObjects[itm.name] = itm;
    })

    $.each( mockRuleListCollection, function(idx,itm) {
      _i.model["rule-lists"].push( itm.name );
      _i.model.ruleListObjects[itm.name] = itm;
    })


    // make a collection showing which interfaces use this rule list
    $.each(_i.model.ruleListObjects, function (idx, itm) {

      var patt = new RegExp("\\b" + idx + "\\b", "g");

      var tmp = { url : idx, interfaces : [] }

      $.each(_i.model.firewallObjects, function (idx, itm) {
        var firewallString = JSON.stringify(itm);
        var retVal = firewallString.match(patt);
        if (retVal) { 
          tmp.interfaces.push(idx)
        }
      })

      _i.model.objectInterfaces.push( tmp );

    })


    // make a collection showing which interfaces use this address list
    $.each(_i.model.addressListObjects, function (idx, itm) {

      var patt = new RegExp("\\b" + idx + "\\b", "g");

      var tmp = { url: idx, interfaces: [] }

      $.each(_i.model.firewallObjects, function (idx, itm) {
        var firewallString = JSON.stringify(itm);
        var retVal = firewallString.match(patt);
        if (retVal) {
          tmp.interfaces.push(idx)
        }
      })

      _i.model.objectInterfaces.push(tmp);

    })


    // make a collection showing which interfaces use this schedule
    $.each(_i.model.scheduleObjects, function (idx, itm) {

      var patt = new RegExp("\\b" + idx + "\\b", "g");

      var tmp = { url: idx, interfaces: [] }

      $.each(_i.model.firewallObjects, function (idx, itm) {
        var firewallString = JSON.stringify(itm);
        var retVal = firewallString.match(patt);
        if (retVal) {
          tmp.interfaces.push(idx)
        }
      })

      _i.model.objectInterfaces.push(tmp);

    })


    // make a collection showing which interfaces use this port list
    $.each(_i.model.portListObjects, function (idx, itm) {

      var patt = new RegExp("\\b" + idx + "\\b", "g");

      var tmp = { url: idx, interfaces: [] }

      $.each(_i.model.firewallObjects, function (idx, itm) {
        var firewallString = JSON.stringify(itm);
        var retVal = firewallString.match(patt);
        if (retVal) {
          tmp.interfaces.push(idx)
        }
      })

      _i.model.objectInterfaces.push(tmp);

    })


    _i.clearDB( _i.putDB )
  }
  
  
  _i.addListToModel = function( returnedString )
  {
    // returned object in this mock is a Couch object like { "success" : true, "obj" : { _id, _rev, objectvalue }
    // lists get added by index to an array
    var returnedObject = JSON.parse(returnedString);
    var key = returnedObject.obj._id;
    var arr = returnedObject.obj.data;
    _i.model[key] = arr;
  }
  

  _i.addObjectToModel = function( modelKey, returnedString )
  {
    // objects get added by key to an object
    var returnedObject = JSON.parse(returnedString);
    var key = returnedObject.obj._id;
    _i.model[modelKey][key] = returnedObject.obj.data;
  }

  
  _i.getDB = function( externalCallback )
  {
    _i.externalCallback = externalCallback;
    _i.numCallbacks = 0;
    _i.model = JSON.parse(JSON.stringify(enterpriseModel.collections));
    _i.ondonecallback = _i.getObjectsFromLists;
    
    _i.getObject( "address-lists", _i.addListToModel );
    _i.getObject( "port-lists", _i.addListToModel );
    _i.getObject( "schedules", _i.addListToModel );
    _i.getObject( "rule-lists", _i.addListToModel );
    _i.getObject( "devices", _i.addListToModel );
  }
  
  
  _i.getObjectsFromLists = function()
  {
    _i.numCallbacks = 0;
    _i.ondonecallback = _i.getObjectsDone;
    
    for ( var i = 0; i < _i.model["address-lists"].length; i++ )
    {
      _i.getObject( _i.model["address-lists"][i], function( returnedString ) { _i.addObjectToModel( "addressListObjects", returnedString ) } );
    }

    for ( var i = 0; i < _i.model["port-lists"].length; i++ )
    {
      _i.getObject( _i.model["port-lists"][i], function( returnedString ) { _i.addObjectToModel( "portListObjects", returnedString ) } );
    }
    
    for ( var i = 0; i < _i.model["schedules"].length; i++ )
    {
      _i.getObject( _i.model["schedules"][i], function( returnedString ) { _i.addObjectToModel( "scheduleObjects", returnedString ) } );
    }
    
    for ( var i = 0; i < _i.model["rule-lists"].length; i++ )
    {
      _i.getObject( _i.model["rule-lists"][i], function( returnedString ) { _i.addObjectToModel( "ruleListObjects", returnedString ) } );
    }
    
    for ( var i = 0; i < _i.model["devices"].length; i++ )
    {
      _i.getObject( _i.model["devices"][i], function( returnedString ) { _i.addObjectToModel( "deviceObjects", returnedString ) } );
    }
  }
  

  _i.getObjectsDone = function()
  {
    console.log("server get objects DONE");
    _i.externalCallback && _i.externalCallback();
  }
  
  
  _i.putDBComplete = function()
  {
    console.log("put DB complete");
    _i.externalCallback && _i.externalCallback();
  }
  

  _i.putDB = function( externalCallback )
  {
    _i.numCallbacks = 5;

    _i.ondonecallback = _i.putDBComplete;
    _i.externalCallback = externalCallback || _i.externalCallback;
    
    _i.putObject( _i.model["address-lists"], "address-lists", 0 );
    _i.putObject( _i.model["port-lists"], "port-lists", 0 );
    _i.putObject( _i.model["schedules"], "schedules", 0 );
    _i.putObject( _i.model["rule-lists"], "rule-lists", 0 );
    _i.putObject( _i.model["interfaceNodes"], "interfaces", 0 );
    //_i.putObject( _i.model["devices"], "devices", 0 );
    
    $.each( _i.model.firewallObjects, function(idx,itm) {
      _i.putObject( itm, idx.replace(/\//g,"~"), 1 );
    })

    $.each( _i.model["address-lists"], function(idx,keyItem) {
      var nam = "address-lists" + "~" + keyItem;
      _i.putObject( _i.model.addressListObjects[keyItem], "address-lists" + "~" + keyItem, 1 );
    })

    $.each(_i.model["port-lists"], function (idx, keyItem) {
      var nam = "port-lists" + "~" + keyItem;
      _i.putObject(_i.model.portListObjects[keyItem], "port-lists" + "~" + keyItem, 1);
    })

    $.each(_i.model["schedules"], function (idx, keyItem) {
      var nam = "schedules" + "~" + keyItem;
      _i.putObject(_i.model.scheduleObjects[keyItem], "schedules" + "~" + keyItem, 1);
    })

    $.each(_i.model["rule-lists"], function (idx, keyItem) {
      var nam = "rule-lists" + "~" + keyItem;
      _i.putObject(_i.model.ruleListObjects[keyItem], "rule-lists" + "~" + keyItem, 1);
    })
   
    $.each(_i.model["objectInterfaces"], function( idx, obj) {
      var nam = "interfaces" + "~" + obj.url;
      _i.putObject( obj.interfaces, nam, 1 );
    })
 
  }

}

