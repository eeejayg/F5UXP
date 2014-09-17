
daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

mockScheduleDescriptions = [
  "Janna wants this schedule to remain",
  "Production schedule",
  "Parts and labor would like this schedule extended",
  "Many parts of this schedule are open",
  "Extend this schedule during the holiday season",
  "More days may be needed",
  "This is temporary and should be reviewed",
  "Permanent, do not change",
  "This schedule works but may not handle high workflow",
  "Any change to this schedule should be handled properly",
  "The reason for this schedule is not understood",
  "Bob specified this schedule"
];

mockAddressDescriptions = [
  "Application service",
  "Bill's VPN endpoint",
  "Temporary stationed here",
  "Needs to be apportioned",
  "Verify this has not changed",
  "Will not be here for long",
  "This is the permanent addy for this",
  "Increase bitmask on this",
  "Formerly had wider allocation",
  "Add more locations to this",
  "Address for temp promotion site",
  "Inclusive"
];

mockAddressListDescriptions = [
  "This address list belongs to Finance",
  "Terry is responsible for maintaining this list",
  "Break this list into two if it gets any longer",
  "Description for this list is lacking detail",
  "Anymore addresses should go in a separate list",
  "Some of these addresses exist in standalone rules",
  "List provided by vendor for Traxes",
  "Subdivided list for partial load",
  "Assignable to VIPs",
  "Assignable to VIPs as well as DeviceGlobal",
  "Second list assigned to marketing"
];

mockPortDescriptions = [
  "Extensible Messaging and Presence",
  "Access Points",
  "Citel",
  "XBT",
  "NetIQ",
  "Sybase database listener",
  "D2000",
  "Web cache",
  "STUN protocol",
  "Tunneling",
  "ArcLink",
  "COMIT",
  "OpenDHT",
  "X11",
  "Database mirroring endpoints",
  "RTP",
  "TelePath"
];

mockPortListDescriptions = [
  "Tunneling Protocols",
  "Endpoint Transport",
  "Messaging",
  "Local Messaging",
  "Internal Transport",
  "External Transport",
  "MS Port Management",
  "Antivirus Insertion Point",
  "Session Management",
  "Workflow Protocols",
  "Session Initiation"
];

mockRuleDescriptions = [
  "Defines the standard AROC defense",
  "Passes authority to different port address",
  "Possibly conflicts with DeviceGlobal settings",
  "Anywhere",
  "Will not pass through RXAA traffic",
  "Routes traffic past management IP",
  "Prohibits non-management packets",
  "Route to packet modification port",
  "Enhance visibility of throughput",
  "Normalize traffic in pass-through",
  "Outputs unmodified"
];

mockRuleListDescriptions = [
  "Standard black list for this installation",
  "White list plus allowed content",
  "Allowed content list",
  "This list is a version of what Ted was using",
  "More rules will be added to this list",
  "This rule list will need to be expanded",
  "List of rules related to DDOS",
  "Redundant rules need to be cleaned out of this list",
  "Gray list rules to be logged and examined",
  "Break this list into two groups if it gets any longer",
  "Northern hemisphere rules",
  "Rules that span South America and Europe",
  "Uncommon protocol rules",
  "Fallback rule list for heavy load conditions"
];

mockFirewallRuleListContainerDescriptions = [
  "Description for the container object that holds a rule list in a firewall",
  "Firewall has a description in the container object around a rule list",
  "In a firewall rules, this description is in the container of a rule list",
  "A firewall contains rules and lists, this description is in the container that holds the rule list"
];

mockFirewallDescriptions = [
  "This is a firewall description",
  "This is another firewall description",
  "DeviceGlobal firewalls don't have a description so this is not a deviceglobal",
  "Firewall description for a VIP, SIP, Route-Domain, or ManagementIP",
  "Another VIP/SIP/RD/MngIP firewall description",
  "If it is not global, you can have a firewall description"
];

mockVLANs = [
  "coke",
  "pepsi",
  "mountaindew",
  "squirt"
];

mockLocationNames = [
  "Amsterdam",
  "Athens",
  "Atlanta",
  "Bangalore",
  "Berlin",
  "Chicago",
  "Frankfurt",
  "HongKong",
  "Kabul",
  "Lagos",
  "Manila",
  "Mumbai",
  "Paris",
  "SanFrancisco",
  "Seoul",
  "Tokyo",
  "Warsaw",
  "Zurich"
];


function randomDate(plusOrMinus) {
  // takes 1 or -1 for date 50 to 150 days backwards or forwards, default forward
  plusOrMinus = plusOrMinus || 1;
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * (Math.round(Math.random() * 100) + 50) * plusOrMinus)
}


function randomIPV4( noNetwork ) {
  var retVal = "";

  for ( var i = 0; i < 4; i++ )
  {
    retVal += Math.round(Math.random() * 254) + 1;
    retVal += (i<3) ? "." : "";
  }

  if (!noNetwork) {
  (Math.random() > .5) && (retVal += "/" + (Math.round(Math.random() * 30) + 1));
  }
  
  return retVal;
}

function randomIPV6() {
  var retVal = "";

  for ( var i = 0; i < 8; i++ )
  {
    retVal += (Math.round(Math.random() * 65534) + 1).toString(16);
    retVal += (i<7) ? "." : "";
  }

  return retVal;
}


