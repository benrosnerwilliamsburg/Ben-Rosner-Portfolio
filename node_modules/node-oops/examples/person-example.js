var oops = require('../')
, dbc    = oops.dbc
, assert = require('assert')
;

function Person(first, last, middles) {
	dbc([!first || typeof first === 'string'], "If provided, first name must be a string [argument 0].")
	dbc([!last || typeof last === 'string'], "If provided, last name must be a string [argument 1].")
	dbc([!middles || Array.isArray(middles)], "If provided, middle names must be an array [argument 2].")

	// first CEW descriptor
	this.defines.enumerable.writable
		.value('firstName', first || '')
		.value('lastName', last || '');

	// second CEW descriptor - note that accessing the
	// defines property inializes a new descriptor.
	this.defines.enumerable
		.value('middleNames', middles || []);
}

// We can define directly against the function/ctor.
// Make the fullName configurable.
Person.defines.configurable.enumerable
	.property(function fullName() {
		// Composition: last, first middles
		var first = this.firstName;
		var middles = this.middleNames;
		var last = this.lastName;
		if (first && middles.length) {
			first = first.concat(' ', middles.join(' '));
		}
		return (last)
			? last.concat(', ', first)
			: first;
	});

var person = new Person("Bilbo", "Baggins", ["the Thief"]);

// verify...
assert.equal(person.fullName, "Baggins, Bilbo the Thief");