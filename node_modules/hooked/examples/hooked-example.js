var util = require('util')
, assert = require('assert')
, oops   = require('node-oops')
, dbc    = oops.dbc
, Hooked = require('../').Hooked;

var keeper = (function() {
	var _store = {};

	// Define a type that keeps passwords. Try to ensure the passwords cannot be externally
	// observed by hooks or events (work in progress)...
	function Passwords() {
		Passwords.super_.call(this, {
			// don't allow these to be hooked...
			unhooked: ["authenticate", "has"],
			// don't allow the password to be observed...
			nonbefore: ["store"],
			// don't emit events on this one...
			noevent: ["logAttempt"]
		});
	}
	Passwords.inherits(Hooked);

	function store(creds, callback) {
		dbc([creds, typeof creds.username === 'string'],"Credentails must contain a `username`.");
		dbc([creds.password, typeof creds.password === 'string'],"Credentials must contain a `password`.");

		var existing = _store[creds.username];
		dbc([!existing || creds.existing === existing], "To change a password, credentials must contain `existing` password.")
		// naively store the password as plain text...
		_store[creds.username] = creds.password;
		if (callback) {
			callback(null, "Password established for ".concat(creds.username));
		}
	}

	function has(username, callback) {
		if (typeof _store[username] !== 'undefined') {
			callback(null, "Password present for ".concat(username));
		} else {
			callback("No password");
		}
	}

	function logAttempt(logEntry, callback) {
		console.log("fake log sink: ".concat(util.inspect(logEntry, false, 5)));
		callback(null, logEntry);
	}

	function authenticate(creds, callback) {
		dbc([creds, typeof creds.username === 'string'],"Credentails must contain a `username`.");
		dbc([creds.password, typeof creds.password === 'string'],"Credentials must contain a `password`.");

		var existing = _store[creds.username];
		if (typeof existing === 'undefined' || creds.password !== existing) {
			logAttempt({
				message: "failed to authenticate",
				who: creds.username,
				when: new Date().toISOString()
			}, function() { callback("Unable to authenticate."); }
			);
		} else {
			logAttempt({
				message: "successfully authenticated",
				who: creds.username,
				when: new Date().toISOString()
			}, function() { callback(null, "Ok ".concat(creds.username, ", we trust you for now.")); }
			);
		}
	}

	Passwords.defines.enumerable
		.method(store)
		.method(has)
		.method(logAttempt)
		.method(authenticate)
		;

	return new Passwords();
}());

function ourLoggingHook(err, res) {
	console.log("Observed: ".concat(util.inspect(res, false, 5)));
}

// attempt to `before` hook the store method...
try {
	keeper.before('store', ourLoggingHook);
	assert.fail("Shouldn't have.");
} catch(e) {
	// Expected because the before hook has been disallowed.
	if (!(e instanceof oops.ContractError)) {
		throw e;
	}
}

// `after` hook the store method...
keeper.after('store', ourLoggingHook);
// also watch the `store` event (async)...
keeper.on('store', function(observed) {
	console.log("store event: ".concat(util.inspect(observed, false, 5)));
});
keeper.store({ username: 'me', password: 'my pw'});

// Observed: 'Password established for me'

// it should not actually get fired because we've marked `authenticate` as unhooked...
keeper.on('authenticate', function(observed) {
	console.log("authenticate event: ".concat(util.inspect(observed, false, 5)));
});

// successful...
keeper.authenticate({ username: 'me', password: 'my pw' }, function(err, res) {
	console.log("authenticate callback: ".concat(util.inspect(err || res, false, 5)));
});

// unsuccessful...
keeper.authenticate({ username: 'me', password: 'bull' }, function(err, res) {
	console.log("authenticate callback: ".concat(util.inspect(err || res, false, 5)));
});
