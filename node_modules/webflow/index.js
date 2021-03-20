var lib = require('./lib')
, pkg   = require('./package')
;

Object.defineProperties(lib, {
	VERSION: { value: pkg.version, enumerable: true }
});

module.exports = lib;