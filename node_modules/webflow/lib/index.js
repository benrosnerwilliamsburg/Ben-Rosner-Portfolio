var err    = require('./errors')
, success  = require('./success')
, resource = require('./resource')
, trusted_client  = require('./trusted_client')
, trusted_server  = require('./trusted_server')
;

var lib = {};
Object.defineProperties(lib, {
  Success:       { value: success, enumerable: true },
  ResourceError: { value: err, enumerable: true },
  Resource:      { value: resource, enumerable: true },
  TrustedClient: { value: trusted_client, enumerable: true },
  TrustedServer: { value: trusted_server, enumerable: true },
});

module.exports = lib;