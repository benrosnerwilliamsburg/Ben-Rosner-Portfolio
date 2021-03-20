var util = require('util')
, events = require('events')
, should = require('should')
, oops   = require('node-oops')
, hooked = require('../')
;

function appendPath(base, plus) {
	if (typeof base !== 'string') { throw new TypeError('[String] base must be a string!'); }
	if (typeof plus !== 'string') { throw new TypeError('[String] plus must be a string!'); }
	var end = base && base.length > 0 && base[base.length] === '/';
	var begin = plus && plus.length > 0 && plus[0] === '/';
	return (end || begin) ? base + plus : base + '/' + plus;
}

/**
 * Simple (fake) HTTP Resource class exemplifying
 * the use of the Hooked class...
 */
function FakeHttpResource(baseUri) {
	FakeHttpResource.super_.call(this);

	this.defines.enumerable
	.value('baseUri', baseUri || 'http://127.0.0.1:3000');
}
FakeHttpResource.inherits(hooked.Hooked);

/**
 * Simulate an HTTP GET...
 *
 * This method will get hooked in the example below.
 */
function get(path, callback) {
	// This should be preserved!
	var fullUri = appendPath(this.baseUri, path);
	// Simulate some latency, then return an unfriendly
	// http response...
	setTimeout(function() {
		var response = [
			'HTTP/1.1 200 OK',
			'Date: '.concat((new Date().toUTCString())),
			'Connection: Keep-Alive',
			'Content-Type: text/plain',
			'Content-Length: '.concat(path.length, '\n'),
			path
		];

		callback(null, { path: fullUri, response: response.join('\n')});
	}, 1000);
}

FakeHttpResource.defines.configurable.enumerable
.method(get);

var fake = new FakeHttpResource();

// Any configurable method can be hooked...
fake.before('get', function(path, next) {
	if (path.indexOf('ok') < 0) {
		return false;
	}
	next(null, path);
});

// Hooked methods will emit 'error' events...
fake.on('error', function(err) {
	util.log('got error: '.concat(util.inspect(err)));
});

// Hooked methods will emit an event upon completion,
// the event is named the same as the hooked method.
fake.on('get', function(res) {
	util.log('get event: '.concat(util.inspect(res)));
});

// The get method should be hooked... try it out...
fake.get('ok-if-you-do', function(err, res) {
	util.log('got: '.concat(util.inspect(err || res)));
});

// This one will fail, raising the error event, and return
// a cancellation...
fake.get('no-you-dont', function(err, res) {
	util.log('got: '.concat(util.inspect(err || res)));
});