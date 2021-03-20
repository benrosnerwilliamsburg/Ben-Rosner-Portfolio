var oops = require('../')
, assert = require('assert')
;

var value = 'your name here'
, it = {}
, other = {};

// give it an enumerable prop
it.defines.enumerable.value('prop', value);

// verify...
assert.equal(it.prop, value);
// and we can see it by enumerating...
assert(Object.keys(it).indexOf('prop') >= 0);

try {
	// while we're here, prove it is non-configurable
	it.defines.value('prop', 'some other value');
	assert.fail('should never get here because the prop is not configurable');
} catch(e) {
	assert(e instanceof TypeError); // Cannot redefine property: prop
}

// give other a prop that is NOT enumerable
other.defines.value('prop', value);

// verify...
assert.equal(other.prop, value);
// and we CAN NOT see it by enumerating...
assert(Object.keys(other).indexOf('prop') < 0);