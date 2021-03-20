# hooked [![Build Status](https://secure.travis-ci.org/flitbit/hooked.png)](http://travis-ci.org/flitbit/hooked)

A simple javascript/node.js base type supporting before and after hooks over functions.

_or should I say, yet another..._

You may have landed here while looking for the widely used [`hooks` module](https://github.com/bnoguchi/hooks-js). This is a [*clean-room*](http://www.epiclaw.net/blog/2008/10/23/clean-room-defeats-software-infringement-claim-us-federal-court) implementation, similar in scope, that I put together as a base class used across many of my other modules. Of note are the options related to which methods are eligible for hooks.

##Features

+ Derived from EventEmitter; intended to be used as a base type.
+ Methods on derived types can be hooked with `before` and `after` hooks.
+ Control over which methods are eligible for each type of hook.
+ Hooked methods will raise `error` events upon error.
+ Hooked methods will raise `canceled` events upon cancelation.
+ Middleware pipelines are immutable at the time of execution (copy-on-write).

## Types of Hooks

`before`

+ `predicate hook` - indicates whether the method pipeline should continue.
+ `pipeline hook` - observes and potentially transforms arguments before continuing the method pipeline.

`after`

+ `pipeline hook` - observes and potentially transforms the method's result before continuing the method pipeline.
+ `observer hook` - observes a method's result.

### Predicate Hooks

A _predicate hook_ determines whether a method pipeline continues to process `before` the target method. Any hook can act as a predicate by returning a defined falsy value. If a hook's return value is undefined it is not treated as a predicate.

### Pipeline Hooks (otherwise known as _middleware_)

A pipeline hook is added to a method's processing pipeline, either `before` or `after` the method.

Pipeline hooks `before` a method must have the same signature as the hooked method.

Pipeline hooks `after` a method must have the signature `function (err, res, next) { /*...*/ }` where `err`, if truthy, is an error produced by the operation, `res` is an anticipated result, and `next` is the next method in the pipeline.

If any pipeline hook fails to call the `next` method that it is given, it has, in effect, silently canceled the operation.

### Observer Hooks

Every hook is an observer of either the arguments `before` a target method, or the result `after`. However, if an `after` hook has an arity less than 3 it is assumed to be an observer. These hooks are called as synchronous participants in the method pipeline.

If an observer hook throws, the error is captured and communicated to the caller-supplied callback as an error.

## Hookable Methods

Methods that take a `callback` as the last argument, and have an arity 1 or 2, are eligible for hooks. The two supported signatures are:

+ `function(callback) { /*...*/ }`
+ `function(any, callback) { /*...*/ }`

## Installation

```
npm install hooked
```

## Tests

Tests are written using [vows](http://vowsjs.org/) & [should.js](https://github.com/visionmedia/should.js/) (you may need to install them). If you've installed in a development environment you can use npm or node to run the tests.

```
npm test hooked
```

... or from the hooked directory...

```
node test
```

## Use

`hooked` exports one type called `Hooked`. It is entended as a base type, and you'll have to create a type that inherits from it in order to start working with hooks.

### Importing

```javascript
var hooked = require('hooked');
```

### Adding a `before` Hook

```javascript
// assumes your object has a `perform` method...
my.before('perform', function(obj, next) {
	// do something interesting.
	next(null, obj);
});
```

### Adding an `after` Hook

```javascript
// assumes your object has a `perform` method...
my.after('perform', function(err, res, next) {
	// do something interesting.
	next(null, res);
});
```

### Canceling (well-behaved example)

Well-behaved hooks should call `next` or return `false`. Returning `false` cancels the operation and emits a `canceled` event.

```javascript
// assumes your object has a `perform` method
my.before('perform', function(obj, next) {
	// assumes there is a `shouldCancel` method in the current scope
	if (shouldCancel('perform', obj)) {
		// as a predicate, returning `false` cancels.
		return false;
	} else {
		next(null, obj);
	}
});
```

### Enabling Events

Once a method has been hooked, unless it is configured for `noevents`, an event will be emitted. The event's name matches the method's name.

**Events**

+ `error` - emitted when a hook throws an error.
+ `canceled` - emitted when a `before` hook canceles an operation.
+ `{method}` - emitted when the target method completes, before `after` hooks.

Events can be enabled before hooks are present by using the `enableMethodEvents` method.

```javascript
// enable an event for the assumed `perfrom` method
my.enableMethodEvents(["perform"]);

// hook up an event handler...
my.on('perform', function (res){ /* hrm, something just occurred */});
```

### Making Methods Ineligible for Hooks

Methods that would normally be eligible for hooks based on their signature can be made ineligible by constructor option.

#### Ineligible for Any

Methods may be marked ineligible for any hook throught the `unhooked` option.

```javascript
var util = require('util')
, Hooked = require('hooked').Hooked
;

function My() {
	// instruct the base class that `perform` will be ineligible for hooks...
	My.super_.call(this, { unhooked: ["perform"] });

	this.perform = function(any, callback) {
		/* ... elided ... */
		callback(null, 'ok');
	};
}
util.inherits(My, Hooked);
```

#### Ineligible `before`

Methods may be marked ineligible for `before` hooks throught the `nonbefore` option.

```javascript
var util = require('util')
, Hooked = require('hooked').Hooked
;

function My() {
	// instruct the base class that `perform` will be ineligible for `before` hooks...
	My.super_.call(this, { nonbefore: ["perform"] });

	this.perform = function(any, callback) {
		/* ... elided ... */
		callback(null, 'ok');
	};
}
util.inherits(My, Hooked);
```

#### Ineligible `after`

Methods may be marked ineligible for `after` hooks throught the `nonafter` option.

```javascript
var util = require('util')
, Hooked = require('hooked').Hooked
;

function My() {
	// instruct the base class that `perform` will be ineligible for `after` hooks...
	My.super_.call(this, { nonafter: ["perform"] });

	this.perform = function(any, callback) {
		/* ... elided ... */
		callback(null, 'ok');
	};
}
util.inherits(My, Hooked);
```

### Method Events

By default, the base class will emit events for hooked methods.

The events can be suppressed through the `noevents` option.

```javascript
var util = require('util')
, Hooked = require('hooked').Hooked
;

function My() {
	// instruct the base class not to emit a `perform` event...
	My.super_.call(this, { noevent: ["perform"] });

	this.perform = function(any, callback) {
		/* ... elided ... */
		callback(null, 'ok');
	};
}
util.inherits(My, Hooked);
```
