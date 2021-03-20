var vows = require('vows');

var options = { reporter: require('../node_modules/vows/lib/vows/reporters/spec') };

require('./hooked-tests.js').batch.run(options);

