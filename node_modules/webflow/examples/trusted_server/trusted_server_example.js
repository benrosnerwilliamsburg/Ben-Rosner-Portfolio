'use strict';

var connect = require('connect')
, log = require('winston')
, util = require('util')
, TrustedServerImplementation = require('./trusted_server_implementation_example')
;

var options = {
	log: log
};

var server = new TrustedServerImplementation(options);

connect()
	.use(server.connect(server))
	.use(function (req, res) {
		if (req.trustedClientId) {
			server._log('info', 'Request from trusted client: '.concat(req.trustedClientId, '.'));
			res.setHeader('content-type', 'application/json');
			res.writeHead(200);
			res.write(JSON.stringify({ authorized: req.trustedClientId }));
			res.end();
		} else {
			server._log('info', 'This should never happen.');
			res.setHeader('content-type', 'text/plain');
			res.writeHead(500);
			res.write('Server not properly verifying signatures');
			res.end();
		}
	}).listen(3000);

log.info('Server started\r\n--');