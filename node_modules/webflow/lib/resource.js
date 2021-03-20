"use strict";

var util = require('util')
, EventEmitter = require('events').EventEmitter
;

function Resource(options) {
	Resource.super_.call(this);

}
util.inherits(Resource, EventEmitter);

Object.defineProperties(Resource.prototype, {

});

Object.defineProperties(Resource, {

	Resource: {
		value: Resource,
		enumerable: true
	}

});
module.exports = Resource;