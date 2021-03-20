var util = require('util')
, assert = require('assert')
, Hooked = require('../').Hooked;

var squeeker  = new Hooked();

// observe the errors as they occur...
squeeker.on('error', function(e) {
	console.log("".concat(new Date().toISOString(), ": observed error event - ", util.inspect(e, false, 10)));
});

// Add a function that squeeks...
squeeker.squeek = function(times, callback) {
	if (times < 1) throw new Error("Cannot squeek less than one time.");
	callback(null, new Array(times + 1).join('Squeek!'));
}

squeeker.before('squeek', function(args, next) {
	assert(typeof args === 'number');
	console.log("somebody's gonna squeek...");
	next(null, args);
});

squeeker.before('squeek', function(args, next) {
	assert(typeof args === 'number');
	console.log("plug your ears...");
	next(null, args);
});

squeeker.before('squeek', function(args, next) {
	assert(typeof args === 'number');
	console.log("here it comes...");
	next(null, args);
});

function after(err, res) {
	console.log("".concat(new Date().toISOString(), ": ", util.inspect(err || res)));
}

squeeker.squeek(4, after);
squeeker.squeek(3, after);
squeeker.squeek(2, after);

