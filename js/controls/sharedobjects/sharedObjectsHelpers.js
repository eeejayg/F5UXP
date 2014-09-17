

  // identify the model type of a sharedObjectsModel object as defined in data.js
  // a sharedObjectsModel.schedule would return "schedule" for example
  //   .schedule, 
  //   .address, 
  //   .addressList, 
  //   .port,
  //   .portList, 
  //   .rule, 
  //   .ruleList, 
  //   .firewallRuleListContainer, 
  //   .deviceGlobalFirewall,
  //   .routeDomainFirewall, 
  //   .firewall (Management, SelfIP, VIP firewalls have the same model)
  function sharedObjectName( obj ) {

    var objKeyStr = Object.keys(obj).toString();

    for ( var key in sharedObjectsModel ) {
      var somKeyStr = Object.keys(sharedObjectsModel[key]).toString();
      if ( somKeyStr == objKeyStr ) {
        return key;
      }
    }

    return null;
  }


  // returns an object (defined in the private function "showResults")
  // that provides a list of all ruleLists, schedules, address lists, and port lists
  // used by the firewallObj param
  function sharedObjectListFromFirewall( firewallObj ) {

    // self
    var _i = this;


    // private properties
    var firewallrules = firewallObj["fw-rules"] || firewallObj["rules"];
    var ruleLists = {};
    var schedules = {};
    var addressLists = {};
    var portLists = {};
    var singleRules = [];
    var callbackCount = null;


    // private methods
    
    function processRule( r ) {

      if ( r.schedule ) {
        schedules[r.schedule] = r.schedule;
      }

      $.each( r.source["port-lists"], function(idx,itm) {
        portLists[itm] = itm;
      })

      $.each( r.source["address-lists"], function(idx,itm) {
        addressLists[itm] = itm;
      })

      $.each(r.destination["port-lists"], function (idx, itm) {
        portLists[itm] = itm;
      })

      $.each(r.destination["address-lists"], function (idx, itm) {
        addressLists[itm] = itm;
      })

    }


    function processRules() {
      $.each( singleRules, function(idx,itm) {
        processRule( itm );
      })
    }


    function addRuleListRules(obj) {

      callbackCount --;

      singleRules = singleRules.concat(obj.rules);

      if ( callbackCount == 0 ) {
        processRules();
        showResults();
      }

    }

    
    function showResults() {
      var retVal = {};
      // singular so that retVal can be addressed by sharedObjectName
      // as the key
      retVal.ruleList = ruleLists;
      retVal.portList = portLists;
      retVal.addressList = addressLists;
      retVal.schedule = schedules;

      appSharedObjectsList.sharedObjectsList("brush",retVal);
    }


    // constructor
    function initialize(){

      // firewall rules is an array of name : object
      // each object is either a rule or a firewallRuleListContainer
      $.each( firewallrules , function(idx,itm) {

        // get the actual object from the name : object
        var ruleObj = itm[Object.keys(itm)[0]];

        if ( sharedObjectName(ruleObj) == "firewallRuleListContainer" ) {

          ruleLists[ ruleObj["rule-list"] ] = ruleObj["rule-list"];

          if ( ruleObj["schedule"] ) {
            schedules[ ruleObj["schedule"] ] = ruleObj["schedule"];
          }
        }

        if ( sharedObjectName(ruleObj) == "rule" ) {
          singleRules.push(ruleObj);
        }

      })

  
      callbackCount = Object.keys(ruleLists).length;
      var dataInterface = getDataInterface();
      
      $.each( ruleLists, function(idx,itm) {
        dataInterface.getRuleList( idx, addRuleListRules )
      })

    }

    initialize();
  }

