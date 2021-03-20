var util = require('util')
, assert = require('assert')
, Hooked = require('../').Hooked;

var squeeker  = new Hooked();

// observe the errors as they occur...
squeeker.on('error', function(e) {
	console.log("".concat(new Date().toISOString(), ": observed error event - ", util.inspect(e, false, 10)));
});

// Add a function that squeeks...
squeeker.squeek = function(callback) {
	callback(null,"Sqwawk!");
}

// Add a pipeline hook tags tags the args as they pass...
squeeker.before('squeek', function(next) {
	console.log("somebody's gonna squeek...");
	next();
});

// Add a pipeline hook tags tags the args as they pass...
squeeker.before('squeek', function(next) {
	console.log("plug your ears...");
	next();
});

// Add a pipeline hook tags tags the args as they pass...
squeeker.before('squeek', function(next) {
	console.log("here it comes...");
	next();
});

function after(err, res) {
	console.log("".concat(new Date().toISOString(), " observed after: ", util.inspect(err || res)));
}

squeeker.after('squeek', after);

squeeker.squeek();
squeeker.squeek();
squeeker.squeek(function (err, res) {
 console.log("".concat(new Date().toISOString(), " final: ", util.inspect(err || res)));
});

