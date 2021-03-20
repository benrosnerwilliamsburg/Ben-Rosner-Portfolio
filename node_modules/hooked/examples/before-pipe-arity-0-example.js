var util = require('util')
, assert = require('assert')
, ContractError = require('node-oops').ContractError
, Hooked  = require('../').Hooked;

var squeeker  = new Hooked();

// observe the errors as they occur...
squeeker.on('error', function(e) {
	console.log("".concat(new Date().toISOString(), ": observed error event - ", util.inspect(e, false, 10)));
});

// Add a function that squeeks...
squeeker.squeek = function() {
	console.log("".concat(new Date().toISOString(), ": Squeek!"));
}

assert.throws(
	function() {
		squeeker.before('squeek', function(args, next) {
			assert(typeof args === 'undefined');
			console.log("somebody's gonna squeek...");
			next(null, args);
		});
	},
	ContractError
);

