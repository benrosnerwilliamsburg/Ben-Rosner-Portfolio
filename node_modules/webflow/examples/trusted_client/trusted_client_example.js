'use strict';

var http = require('http')
, log = require('winston')
, util = require('util')
, config = require('./trusted_client_config.json')
, TrustedClient = require('../../').TrustedClient
;

var clientOptions = {
	log: log,
	baseUrl: 'http://localhost:3000',
	httpSignature: {
		key: config.keys.trustedClientExampleKey.priv,
		keyId: 'trustedClientExampleKeyId'
	}
};

var client = new TrustedClient(clientOptions);
client.get({ path: '' }, function (err, res) {
	console.log(util.inspect(err || res, false, 10));
});