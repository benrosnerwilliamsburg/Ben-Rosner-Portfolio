'use strict';

var dbc         = require('dbc.js')
, util          = require('util')
, extend        = util._extend
, Hooked        = require('hooked').Hooked
, Success       = require('./success')
, ResourceError = require('./errors')
, httpSignature = require('http-signature')
;

var __sequence = 0;

function TrustedServer(options) {
	TrustedServer.super_.call(this);
	if (options && options.log) {
		var log = options.log;
	}
	Object.defineProperty(this, '_log', {
		value: function(level, msg, data) {
			if (log) {
				if ('undefined' !== typeof data) log[level](msg, data);
				else log[level](msg);
			}
		}
	});
}
util.inherits(TrustedServer, Hooked);

Object.defineProperties(TrustedServer.prototype, {

	connect: {
		enumerable: true,
		value: function() {
			var server = this;
			return function(req, res, next) {
				try {
					server.checkClient(req, function(err, check) {
						if (err) {
							throw err;
						} else if (check && check.success) {
							req.trustedClientId = check.result.trustedClientId;
							next();
						} else {
							throw ResourceError.unexpected(err || check);
						}
					});
				} catch (err) {
					if (err.name === 'MissingHeaderError') {
						err = ResourceError.forbidden();
					} else if (!err.httpEquivalent) {
						err = ResourceError.internalServerError();
					}
					res.setHeader('content-type', 'application/json');
					res.writeHead(err.httpEquivalent);
					res.write(JSON.stringify(err));
					res.end();
				}
			}
		}
	},

	getSignature: {
		enumerable: true,
		value: function(keyId, cb) {
			return cb(null, undefined);
		}
	},

	checkClient: {
		enumerable: true,
		value: function(req, cb) {
			var e, keyId
			, that = this
			;
			var parsed = httpSignature.parseRequest(req);
			keyId = parsed.params.keyId;
			this.getSignature(keyId, function(err, pub) {
				if (pub) {
					if (httpSignature.verifySignature(parsed, pub)) {
						that._log('info', 'HTTP Signature - verified trusted client: `'.concat(keyId, '`.'));
						return cb(null, Success.ok({ trustedClientId: keyId }));
					} else {
						that._log('info', 'HTTP Signature - trusted client signature invalid; trustedClientId: `'.concat(keyId, '`.'));
						return cb(ResourceError.unauthorized("Trusted client signature invalid."));
					}
				} else {
					that._log('info', 'HTTP Signature - unknown client identity: `'.concat(keyId, '`.'));
				}
				return cb(ResourceError.forbidden('Not a trusted client.'));
			});
		}
	}
});

Object.defineProperties(TrustedServer, {

	create: {
		enumerable: true,
		value: function(options) {
			return new TrustedServer(options);
		}
	},

	connect: {
		enumerable: true,
		value: function(options) {
			return TrustedServer.create(options).connect();
		}
	}

});

module.exports = TrustedServer