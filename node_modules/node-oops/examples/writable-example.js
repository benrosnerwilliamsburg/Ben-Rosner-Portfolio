var oops = require('../')
, assert = require('assert')
;

var value = 'your name here'
, updated = 'Gilbert Snodgraph'
, it = {}
, not = {};

// give it an writable prop
it.defines.writable.value('prop', value);

// verify...
assert.equal(it.prop, value);

// write it...
it.prop = updated;

// verify...
assert.equal(it.prop, updated);

// now for one that is not writable...
not.defines.value('prop', value);

// verify...
assert.equal(not.prop, value);

// write it...
not.prop = updated;

// verify the value did not change...
assert.equal(not.prop, value);