'use strict';

var util = require('util')
, TrustedServer = require('../../').TrustedServer
, config = require('./trusted_server_config.json')
;

function TrustedServerImplementation(options) {
	TrustedServerImplementation.super_.call(this, options);
}
util.inherits(TrustedServerImplementation, TrustedServer);

Object.defineProperties(TrustedServerImplementation.prototype, {

	getSignatureKey: {
		value: function(keyId) {
			return config.keys[keyId];
		},
		enumerable: true
	}

});

Object.defineProperties(TrustedServerImplementation, {

	create: {
		enumerable: true,
		value: function(options) {
			return new TrustedServerImplementation(options);
		}
	}

});

module.exports = TrustedServerImplementation;