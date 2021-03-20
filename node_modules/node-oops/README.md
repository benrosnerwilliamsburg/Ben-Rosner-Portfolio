# Oops - object-oriented programming simplified

A small library that makes object-oriented programming in javascript a little simpler.

+ [Installation](#installation)
+ [Compatability](#compatability)
+ [Rationale](#rationale)
+ [Example](#example)
+ [Use](#use)
	+ [Importing](#importing)
	+ [Specifying Descriptor Properties](#descriptors)
		+ [Configurable - allowing later redefinition](#configurable)
		+ [Enumerable - discoverable](#enumerable)
		+ [Writable](#writable)
		+ [Configurable, Enumerable, Writable - all together now](#cew)
	+ [Defining Values](#dvalues)
	+ [Defining Properties](#dproperties)
	+ [Defining Methods](#dmethods)
	+ [No Conflict](#no-conflict)
+ [API](#api)

<a name="#installation"></a>
## Installation

```
npm install node-oops
```

In a web browser...

```html
<script src="./build/oops.min.js"></script>
```

<a name="#rationale"></a>
## Rationale
The ECMAScript 5 syntax for defining object properties is a bit cumbersome. I'm NOT saying its unusable, not at all... but it does require some concentration, especially when revisiting code written more than a week ago. `oops` was born out of a few helper methods I put together to make object-oriented javascript a bit more understandable and clear. It allows you to define what an object *is*, *has* and *does*.

__Warning #1__

Before proceeding you should understand that as I code primarily for the server-side, I purposely chose NOT to support the extremely loose typing that infects the browser-side. Mind you, I enjoy some of those patterns -- they are powerful techniques when used judiciously -- but in order to keep this library small and focused I stuck to bare-bones, classic, type definition stuff. If you find yourself defining types using the ECMAScript 5 `Object.defineProperty(ies)` method, and customizing a property's CEWability (configurable, enumerable, writable), then you're already in the paradigm I'm talking about. If you tend to use object-merge style inheritance rather than classic prototypal inheritance then this library won't be very useful to you.

<a name="#compatability"></a>
## Compatability

__Warning #2__

`oops` purposely extends `Object.prototype` and `Function.prototype`, and as with most libraries that do so, it is purely for convenience and the semantic sugar. That said, `oops` _is well-behaved_. It detects whether its two additions (`Object.prototype.defines` and `Function.prototype.inherits`) are objstructed and if so does not replace them. It also supplies a `noConflict` method that will restore your environment and run oops in `pristine` mode.

Warnings aside, `oops` is nothing more than a small wrapper over ECMAScript 5's object definition methods. Ultimately it turns right around and calls `Object.defineProperty` after composing the appropriate `descriptor`. It is entirely compatible with well-understood, object-oriented practice in javascript and can be mixed and matched successfully with types defined using prototypal inheritance.

__Warning #3__

As already divulged, I code primarily on the server-side, `nodejs` mostly, so `oops` is entirely node compatible. This means that you can interchangeably use `util.inherits` and `oops.inherits`, and `(function My(){}).inherits`. All three of these use identical code to establish the prototype chain and each pokes `super_` onto your type/function. I put this warning here so that if you're not already familiar with inheritance the way the node community does it [you can go acquire that knowledge before continuing](http://nodejs.org/api/util.html#util_util_inherits_constructor_superconstructor).

<a name="#example"></a>
### Example

Ponder this object definition, it will take just a minute to comprehend in its entirety.

```javascript
var oops = require('node-oops')
, dbc    = oops.dbc
;
/**
* A classic parallel-programming future variable (oops).
*
* Create one on an existing value and it is available immediately
* via the `get` method.
*
* Create one without a value and either poll it using the `has`
* method or call `get` with a callback to get notified when the
* value is available.
*
* The value may be written only once via the `set` method.
*/
function Future(val) {
	var _val = val, _callbacks;

	function notify(val) {
		_val = val;
		if (_callbacks) {
			var i, len = _callbacks.length;
			for(i = 0; i < len; i++) {
				var cb = _callbacks[i];
				cb(null, val);
			}
			delete _callbacks;
		}
	}

	this.defines.enumerable
	.method(function has() { return typeof _val !== 'undefined'; })
	.method(function get(cb) {
		var v = _val;
		if (cb) {
			if (typeof v === 'undefined') {
				_callbacks.push(cb);
			} else {
				cb(null, v);
			}
		}
		return v;
	});

	if (typeof _val === 'undefined') {
		_callbacks = [];

		this.defines.enumerable
		.method(function set(val) {
			dbc([typeof _val !== 'undefined'], "Future value can only be set once.");
			if (typeof val !== 'undefined') {
				notify(val);
			}
		});
	}
}
```

This is the very same object, defined using standard ECMAScript 5 `Object.defineProperty(ies)` methods:

```javascript
/**
* A classic parallel-programming future variable (ECMA).
*
* Create one on an existing value and it is available immediately
* via the `get` method.
*
* Create one without a value and either poll it using the `has`
* method or call `get` with a callback to get notified when the
* value is available.
*
* The value may be written only once via the `set` method.
*/
function Future(val) {
	var _val = val, _callbacks;
	function notify(val) {
		_val = val;
		if (_callbacks) {
			var i, len = _callbacks.length;
			for(i = 0; i < len; i++) {
				var cb = _callbacks[i];
				cb(null, val);
			}
			delete _callbacks;
		}
	}
	Object.defineProperties(this, {
		has: {
			value: function () { return typeof _val !== 'undefined'; },
			enumerable: true
		},
		get: {
			value: function (cb) {
				var v = _val;
				if (cb) {
					if (typeof v === 'undefined') {
						_callbacks.push(cb);
					} else {
						cb(null, v);
					}
				}
				return v;
			},
			enumerable: true
		}
	});
	if (typeof _val === 'undefined') {
		_callbacks = [];
		Object.defineProperty(this, 'set', {
			value: function (val) {
				if (typeof _val !== 'undefined') { throw new Error("Future value can only be set once."); }
				if (typeof val !== 'undefined') {
					notify(val);
				}
			},
			enumerable: true
		});
	}
}
```
Scroll back and forth between the two -- not that either is too complicated, and `oops` is certainly not novel, but the semantic allows you to quickly determine the object's characteristics.

<a name="#use"></a>
## Use

<a name="#importing"></a>
###Importing

```javascript
var oops = require('node-oops');
```

<a name="#descriptors"></a>
###Specifying Descriptor Properties

The default descriptor properties used by `oops` are identical to ECMAScript 5. If you don't specify otherwise then `configurable`, `enumerable`, and `writable` are false.

Therefore, if you don't specify otherwise:

0. The property can't be reconfigured,
0. The property won't be discovered by methods that enumerate the object's properties,
0. The property's value can't be modified.

<a name="#configurable"></a>
####Configurable - allowing later redefinition

```javascript
var oops = require('node-oops')
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
assert.equal(Object.hasOwnProperty('prop'), false);

// ok, can't write it but we can reconfigure it...
it.defines.configurable.method('prop', function() { return reconfigured; });

// note we're now treating it as a method...
assert.equal(it.prop(), reconfigured);

// how about reconfiguring it as a property...
it.defines.configurable.property('prop', function() { return finale; });

// now, treat it as a value again...
assert.equal(it.prop, finale);

```

If you don't define a property as configurable then redefining throws `TypeError` as proved in the next example. In this way you can close a property definition.

<a name="#enumerable"></a>
####Enumerable - discoverable

```javascript
var oops = require('node-oops')
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
```

If you're practiced in other OO languages you may think that we're talking about visibility here but we're not. In javascript things are visible if you know how to refer to them. To make something truly invisible you'll have to use a closure scope \[which is out of scope for this readme\].

One notable place where enumerability comes into play is when copy-constructing, or extending objects \[re. [`extend`](https://github.com/justmoon/node-extend)\]. Most well-behaved extend methods will respect the enumerability of properties.

JSON serialization is another good example, properties that are not enumerable won't get serialized by standard libraries.

<a name="#writable"></a>
####Writable

Well, this one is self explanitory, but here's a proof.

```javascript
var oops = require('node-oops')
, assert = require('assert')
;

var value = 'your name here'
, updated = 'Gilbert Snodgraph'
, it = {}
, not = {};

// give it a writable prop
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
```

<a name="#cew"></a>
####Configurable, Enumerable, Writable - all together now

When defining object properties, you can stack the descriptors and it does what you expect.

```javascript
my.defines.enumerable.writable.value('prop', {});
// my.prop is enumerable and writable
```

Further, once you've established CEW you can chain the definitions:

```javascript
var oops = require('node-oops')
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
```

<a name="#dvalues"></a>
###Defining Values

A **_value_** is any property that is not backed by a user-supplied getter or setter. All values must be explicitly named because there isn't a reasonable way to infer the name. Since there are so many examples above I'll keep this short:

```javascript
my.defines.value('name', value);
```

<a name="#dproperties"></a>
###Defining Properties

There are options when creating properties. You can make them read-only by providing just the getter, or read-write by providing a getter and a setter. Further, the property's name can be inferred from the name of the getter.

**Read-only**

```javascript
var my = {}, _name = "My name";

// let oops infer the property name from the getter's name...
my.defines.enumerable.property(function name() { return _name; });
```

```javascript
// ...or specify the name of the property...
my.defines.enumerable.property("name", function() { return _name; });
```

**Read-write**

```javascript
var my = {}, _name = "My name";

my.defines.enumerable.property(
	function name() { return _name; },
	function(val) { _name = val; }
	);
```

```javascript
// ...or...
my.defines.enumerable.property("name",
	function() { return _name; },
	function(val) { _name = val; }
	);
```
Personally I nearly always let `oops` infer the name. It saves some typing and allows
me to define the functions in one scope, then reuse them as methods when defining types.

**NOTE**: currently there is no support for defining **write-only** properties. To accomplish this rarity you'll have to revert to `Object.defineProperty` like this:

```javascript
var my = {}, _name = "My name";

Object.defineProperty(my, 'name' {
	set: function(val) { _name = val; },
	enumerable: true
})
```

<a name="#dmethods"></a>
###Defining Methods

Defining methods is similar to defining properties. `oops` will infer the name of the method from the function provided, alternately you can specify it.

The following is a more involved example. I've mentioned that I prefer letting `oops` infer the names of things I define. In this example I've established a scope in order to illustrate one form of encapsulation, and within the scope I define independent functions later assigned as methods. Personally, I appreciate the separation when I come back to code after some time away -- but of course you're free to use a style that works for you.

**_the illustrated `method` definition is about half way down the example_**

```javascript
var oops = require('node-oops')
, dbc    = oops.dbc
, util = require('util')
;

var piehole = (function () {
	var it = {}, belly = {};

	function stuff(what) {
		var typ = typeof what;
		if (typeof belly[typ] === 'undefined') {
			belly[typ] = [];
		}
		belly[typ].push(what);
		return what;
	}

	function puke(where) {
		if (typeof where.log == 'function') {
			var keys = Object.keys(belly);
			keys.forEach(function(k) {
				where.log("barfing... ".concat(util.inspect(belly[k], false, 12)));
			});
		}
	}

	// define the methods, we'll go grade-school and rename the second method...
	it.defines.enumerable
		.method(stuff)
		.method('barf', puke)
		;

	return it;
}());

function yummy(what) {
	console.log("Yummy! I just consumed ".concat(util.inspect(what, false, 12), '!'));
}

// now stuff our pie hole...
yummy(piehole.stuff({ some: "gruel"}));
yummy(piehole.stuff("beans"));
yummy(piehole.stuff("cake"));
yummy(piehole.stuff({ beer: { pints: 3 }}));
yummy(piehole.stuff(["hot dog", "pop-rocks"]));
yummy(piehole.stuff({ eggs: 3, kind: "raw"}));
yummy(piehole.stuff({ oil: { volume: '3 cups', kind: "olive"} }));

// that ought to do it... now wait just a second...
setTimeout(function make_room_here_it_comes() {
	piehole.barf(console);
}, 1000);
```

<a name="#no-conflict"></a>
###No Conflict

`oops` supports a no-conflict mode. In this mode you must explicitly create your own instances of the `Define` type... my personal practice is to reassign the factory method `create` to a local variable that mimics the basic semantics of `oops`:

```javascript
var oops = require('../').noConflict()
, defines = oops.create
;

function Favorite(greeting) {
	defines(this).value('greeting', greeting);
}

function Greeter(greeting){
	Greeter.super_.call(this, greeting);
}
oops.inherits(Greeter, Favorite);

defines(Greeter).enumerable
	.method(function greet(who) {
		console.log("".concat(this.greeting, ' ', who));
	});

var bob = new Greeter("Good day");
bob.greet("Jane");
```

<a name="#api"></a>
## API

**Methods**

+ `dbc` - a light-weight desing-by-contract method (enforces one or more required conditions).
+ `create` - Factory method for `oops.Define`. Useful in `no-conflict` mode.
+ `inherits` - same as [node's](http://nodejs.org/) [`util.inherits`](http://nodejs.org/api/util.html#util_util_inherits_constructor_superconstructor), redefined to support contexts other than node.
+ `noConflict` - resets the javascript environment to `pristine` mode.
+ `obstructed` - reports whether a critical feature is obstructed (`defines` or `inherits`)

**Types**

+ `Define` - used to define an object's characteristics.
	+ **Properties**
		+ `configurable` - establishes the subsequent definition(s) as configurable.
		+ `enumerable` - establishes the subsequent definition(s) as enumerable.
		+ `writable` - establishes the subsequent definition(s) as writable.
	+ **Methods**
		+ `method` - defines a method.
		+ `property` - defines a property.
		+ `value` - defines a value.
+ `ContractError` - thrown by `dbc` when one or more conditions is not truthy.

**Environmental**

+ `Object.prototype.defines` - A _read-only_ property; constructs an instance of `Define` over the object on which it is invoked.
+ `Function.prototype.inherits` - A _single-use_ method for establishing a type's inheritance hierarchy. See `inherits`.
