
sharedObjectsModel = {};

sharedObjectsModel.schedule = {
  "name" : "",
  "description" : "",
  "date-valid-start" : "", 
  "date-valid-end" : "", 
  "daily-hour-start" : "",
  "daily-hour-end" : "",
  "days-of-week" : []
};

sharedObjectsModel.address = {
  "" : {}
}

sharedObjectsModel.addressList = {
  "name" : "",
  "description" : "",
  "addresses" : []
};

sharedObjectsModel.port = {
  "" : {}
}

sharedObjectsModel.portList = {
  "name" : "",
  "description" : "",
  "ports" : []
}

// business logic:
// if status=scheduled, schedule=someScheduleName
// if schedule=someScheduleName, status=scheduled
sharedObjectsModel.rule = {
  "name" : "",
  "description" : "",
  "status" : "",
  "ip-protocol" : "",
  "action" : "",
  "source" : {
    "addresses" : [],
    "ports" : [],
    "address-lists" : [],
    "port-lists" : [],
    "vlans" : []
  },
  "destination" : {
    "addresses" : [],
    "ports" : [],
    "address-lists" : [],
    "port-lists" : []
  },
  "schedule" : "",
  "log" : ""
}

sharedObjectsModel.ruleList = {
  "name" : "",
  "description" : "",
  "rules" : []
};

// used only inside a firewall object
// when the firewall has a rule list
sharedObjectsModel.firewallRuleListContainer = {
  "description" : "",
  "rule-list" : "",
  "state" : "",
  "schedule" : ""
}

sharedObjectsModel.deviceGlobalFirewall = {
  "rules" : []
}

sharedObjectsModel.routeDomainFirewall = {
  "id" : "",
  "description" : "",
  "fw-rules" : []
}

// Management, SelfIP, or VIP firewall
sharedObjectsModel.firewall = {
  "name" : "",
  "description" : "",
  "fw-rules" : []
}

