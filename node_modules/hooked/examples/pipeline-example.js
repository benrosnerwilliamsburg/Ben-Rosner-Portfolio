var util = require('util')
, assert = require('assert')
, Hooked = require('../').Hooked;

var logger  = new Hooked();

// observe the errors as they occur...
logger.on('error', function(e) {
	console.log("".concat(new Date().toISOString(), ": observed error event - ", util.inspect(e, false, 10)));
});

// Add a function that logs what it is given...
logger.log = function(what, callback) {
	console.log("".concat(new Date().toISOString(), ": ", util.inspect(what, false, 10)));
	callback();
}

// Add a pipeline hook tags tags the args as they pass...
logger.before('log', function(args, next) {
	if (!args.pipeline) { args.pipeline = []; }
	args.pipeline.push("first");
	next(null, args);
});

// Add a pipeline hook tags tags the args as they pass...
logger.before('log', function(args, next) {
	if (!args.pipeline) { args.pipeline = []; }
	args.pipeline.push("second");
	next(null, args);
});

// Add a pipeline hook tags tags the args as they pass...
logger.before('log', function(args, next) {
	if (!args.pipeline) { args.pipeline = []; }
	args.pipeline.push("third");
	next(null, args);
});

// Add a hook that filters objects containing secrets from being logged...
logger.before('log', function(a, next) {
	var s = JSON.stringify(a);
	if (s.indexOf('secret') < 0) {
		return false;
	}
	next(null, a);
});

logger.log({ some: { data: ["this", "is", { number: 4 }]}});
logger.log({ more: { data: [{ number: 5 }, { and: { a: 'secret'}}]}});
logger.log({ last: "element"});

// 2013-01-11T14:27:44.700Z: { some: { data: [ 'this', 'is', { number: 4 } ] }, pipeline: [ 'first', 'second', 'third' ] }
// 2013-01-11T14:27:44.705Z: { last: 'element', pipeline: [ 'first', 'second', 'third' ] }
