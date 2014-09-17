// IE8 does not support "toISOString"
// IE7 does not have the JSON object so does not support JSON.stringify and JSON.parse

// a VIP/SelfIP/ManagementIP firewall name is the IP address of the interface
// and cannot be edited

// ADDRESSING OBJECTS
// many of the keys in the API uses dashes in the name which is valid JSON but not a valid Javascript identifier
// therefore objects frequently need to be address like
// _i.model["address-lists"] instead of like
// _i.model.addres-lists

// CREATE GET PUT database
// var x = new mockEnterprise();
// x.createDB() -- creates and puts new mock data
// x.getDB( externalCallback ) -- gets the current DB and calls externalCallback when done, eg cancel a modal spinner with externalCallback
// x.putDB( externalCallback ) -- puts the current DB and calls externalCallback when done, eg cancel a modal spinner with exeternalCallback

// NEW API CALLS NEEDED
// /emapi/secmgr/devices?$select=name  -  get a collection of names for all devices

// QUESTIONS
// Do we handle "*" as a Port for example, or does a blank port imply "*", or do we populate
// blank fields with "*", or a named object called "All"

// There needs to be a deployment status object

// There could be a thousand VIPS:  scale of VIPS is not handled in the interface

// ADDITIONAL API
// We got look at GUID-backed data
// Deploy API / Object with status
// Brushing API

// DEMO
// EM needs to be loaded with up to 50 devices, 1 of which is real
// Possibly Couch DB needs to be added to EM

// ADD NOTE HERE ABOUT NO CROSS ROUTE DOMAIN VIP IP CONFLICTS
//

// MISSING STUFF
// Upstream rules
// Grid editing needs mucho improvement
// New objects
// 







