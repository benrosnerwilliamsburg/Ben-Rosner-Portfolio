var util = require('util')
, extend = require('extend')
, dbc    = require('dbc.js')
;

var success = {

	200: { code: 200, message: 'OK' },
	201: { code: 201, message: 'Created' },
	202: { code: 202, message: 'Accepted' },
	203: { code: 203, message: 'NonAuthoratative' },
	204: { code: 204, message: 'NoContent' }

}
, successPreamble = 'Success: '
;

function Success(result, message, code) {
	Object.defineProperties(this, {

    success:        { value: message || success[200].message, enumerable: true },
    httpEquivalent: { value: code || success[200].code },
    headers:        { value: {} }

	});
	if ('undefined' !== typeof result) {
		Object.defineProperty(this, 'result', { value: result, enumerable: true });
	}
}

Object.defineProperties(Success.prototype, {

	setHeaders: {
		value: function(headers) {
			extend(this.headers, headers);
		}
	},

	toString : {
		value: function() {
			var result= this.result
			, typeofResult = typeof result
			, res = successPreamble.concat(this.httpEquivalent, ' - ', this.success);
			;
			if ('string' === typeofResult) {
				res = res.concat('; ', result);
			} else if ('undefined' !== typeofResult) {
				res = res.concat('; ', util.inspect(result, false, 3));
			}
			if ('.?!'.indexOf(res[res.length - 1]) < 0) {
				res += '.'
			}
			return res;
		},
		enumerable: true,
		configurable: true
	}

});

function makeWithResult(code, result) {
	var it = success[code];
	return new Success(result, it.message, it.code);
}

Object.defineProperties(Success, {

	ok:               { value: makeWithResult.bind(null, 200), enumerable: true },
	created:          {
		value: function(result, location) {
			dbc([!location || 'string' === typeof location], "location must be a string");
			var res = makeWithResult(201, result);
			if (location) {
				res.location = location;
			}
			return res;
  	}, enumerable: true
  },
  accepted:         { value: makeWithResult.bind(null, 202), enumerable: true },
  nonAuthoratative: { value: makeWithResult.bind(null, 203), enumerable: true },
  noContent:        { value: makeWithResult.bind(null, 204), enumerable: true }

});

module.exports = Success;
