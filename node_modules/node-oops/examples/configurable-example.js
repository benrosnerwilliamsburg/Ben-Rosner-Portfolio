var oops = require('../')
, assert = require('assert')
;

var initial = 'its an immutable string value'
, reconfigured = 'now a function'
, finale = 'now a property'
, it = {};

// give it a value
it.defines.configurable.value('prop', initial);

// verify it...
assert.equal(it.prop, initial);

// benign assignment because prop is not writable
it.prop = reconfigured;
assert.equal(it.prop, initial);

// and the prop is not enumerable...
assert.equal(Object.keys(it).indexOf('prop'), -1);

// ok, can't write it but we can reconfigure it...
it.defines.configurable.method('prop', function() { return reconfigured; });

// note we're now treating it as a method...
assert.equal(it.prop(), reconfigured);

// how about reconfiguring it as a property...
it.defines.configurable.property('prop', function() { return finale; });

// now, treat it as a value again...
assert.equal(it.prop, finale);