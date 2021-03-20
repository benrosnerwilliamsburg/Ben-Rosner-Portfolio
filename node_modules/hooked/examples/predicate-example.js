var util = require('util')
, assert = require('assert')
, Hooked = require('../').Hooked;

var logger  = new Hooked();

// observe the errors as they occur...
logger.on('error', function(e) {
	console.log("".concat(new Date().toISOString(), ": observed error event - ", util.inspect(e, false, 10)));
});

// observe the cancelations as they occur...
logger.on('canceled', function(e) {
	console.log("".concat(new Date().toISOString(), ": observed canceled event - ", util.inspect(e, false, 10)));
});

// Add a function that logs what it is given...
logger.log = function(what, callback) {
	console.log("".concat(new Date().toISOString(), ": ", util.inspect(what, false, 10)));
	callback();
}

// Add a hook that filters objects containing secrets from being logged...
logger.before('log', function(a, next) {
	var s = JSON.stringify(a);
	process.nextTick(function() {next(null, a);});
	return s.indexOf('secret') < 0;
});

logger.log("Nothing important here.");
logger.log("This is a secret, maybe I should be more discreet.");
logger.log({ some: { data: ["this", "is", { number: 4 }]}});
logger.log({ more: { data: [{ number: 5 }, { and: { a: 'secret'}}]}});
logger.log("all done now");

/*
2013-01-12T18:22:28.856Z: observed canceled event - { error: 'canceled', method: 'log', reason: 'Canceled by predicate.' }
2013-01-12T18:22:28.861Z: 'This is a secret, maybe I should be more discreet.'
2013-01-12T18:22:28.861Z: observed canceled event - { error: 'canceled', method: 'log', reason: 'Canceled by predicate.' }
2013-01-12T18:22:28.861Z: { more: { data: [ { number: 5 }, { and: { a: 'secret' } } ] } }
2013-01-12T18:22:28.861Z: observed canceled event - { error: 'canceled', method: 'log', reason: 'Canceled by predicate.' }
*/