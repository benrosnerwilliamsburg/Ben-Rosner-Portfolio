var util = require('util')
;

var errors = {

	400: { code: 400, error: "BadRequest", reason: "The request could not be understood due to malformed syntax." },
	401: { code: 401, error: "Unauthorized", reason: "The request requires user authentication." },
	402: { code: 402, error: "PaymentRequired" },
	403: { code: 403, error: "Forbidden" },
	404: { code: 404, error: "NotFound", reason: "Unable to find a resource matching the requested URI." },
	405: { code: 405, error: "MethodNotAllowed", reason: "The resource does not allow that method." },
	406: { code: 406, error: "NotAcceptable", reason: "The resource can only generate responses that are not acceptable according to the accept header provided." },

	408: { code: 408, error: "RequestTimeout", reason: "Client endpoint taking too long to produce a request." },
	409: { code: 409, error: "Conflict", reason: "The request conflicts with the current state of the resource." },
	410: { code: 410, error: "Gone", reason: "The requested resource is no longer available on the server and no forwarding address is known." },
	411: { code: 411, error: "LengthRequired", reason: "The request cannot be accepted without a content-length." },
	412: { code: 412, error: "PreconditionFailed", reason: "A given precondition evaluated to false." },
	413: { code: 413, error: "EntityTooLarge", reason: "The requested entity is too large." },

	415: { code: 415, error: "UnsupportedMediaType", reason: "The resource does not support the media type provided." },

	417: { code: 417, error: "ExpectationFailed", reason: "A given expectation cannot be met by the server." },

	422: { code: 422, error: "UnprocessableEntity", reason: "The given entity does not conform to the server's requirements for the resource." },
	428: { code: 428, error: "PreconditionRequired", reason: "The server requires that the request be conditional." },
	429: { code: 429, error: "TooManyRequests", reason: "The client has sent too many requests in rapid succession and is being rate-limited." },

	500: { code: 500, error: "InternalServerError", reason: "The server encountered an unexpected condition which prevented it from fulfilling the request." },
	501: { code: 501, error: "NotImplemented", reason: "The server does not support the functionality required to fulfill the request." },
	502: { code: 502, error: "BadGateway", reason: "The server recieved an invalid response from the upstream server while attempting to fulfill the request." },
	503: { code: 503, error: "ServiceUnavailable", reason: "The server is currently unable to handle the request." },
	504: { code: 504, error: "GatewayTimeout", reason: "The server failed to receive a timely response from the upstream server." },
	505: { code: 505, error: "HttpVersionNotSupported", reason: "The server does not support the version of HTTP specifie." }

}
, errorPreamble = 'ResourceError: '
;

function ResourceError(err, reason, code, ctor) {
	var msg = err || errors[500].error
	ResourceError.super_.call(this, msg);
	Error.captureStackTrace(this, ctor || this);
	Object.defineProperties(this, {

		error: { value: msg, enumerable: true },
		reason: { value: reason, enumerable: true },
		httpEquivalent: { value: code || errors[500].code }

	});
}
util.inherits(ResourceError, Error);

Object.defineProperties(ResourceError.prototype, {

	toString : {
		value: function() {
			var reason = this.reason
			, typeofReason = typeof reason
			, res = errorPreamble.concat(this.httpEquivalent, ' - ', this.error);
			;
			if ('string' === typeofReason) {
				res = res.concat('; ', reason);
			} else if ('undefined' !== typeofReason) {
				res = res.concat('; ', util.inspect(reason, false, 3));
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

function makeWithReason(code, reason) {
	var err = errors[code];
	return new ResourceError(err.error, reason || err.reason, err.code);
}

Object.defineProperties(ResourceError, {

  badRequest:           { value: makeWithReason.bind(null, 400), enumerable: true },
  unauthorized:         { value: makeWithReason.bind(null, 401), enumerable: true },
  paymentRequired:      { value: makeWithReason.bind(null, 402), enumerable: true },
  forbidden:            { value: makeWithReason.bind(null, 403), enumerable: true },
  notFound:             { value: makeWithReason.bind(null, 404), enumerable: true },
  methodNotAllowed:     { value: makeWithReason.bind(null, 405), enumerable: true },
  notAcceptable:        { value: makeWithReason.bind(null, 406), enumerable: true },
  requestTimeout:       { value: makeWithReason.bind(null, 408), enumerable: true },
  conflict:             { value: makeWithReason.bind(null, 409), enumerable: true },
  gone:                 { value: makeWithReason.bind(null, 410), enumerable: true },
  lengthRequired:       { value: makeWithReason.bind(null, 411), enumerable: true },
  preconditionFailed:   { value: makeWithReason.bind(null, 412), enumerable: true },
  entityTooLarge:       { value: makeWithReason.bind(null, 413), enumerable: true },
  unsupportedmediaType: { value: makeWithReason.bind(null, 415), enumerable: true },
  expectationFailed:    { value: makeWithReason.bind(null, 417), enumerable: true },
  unprocessableEntity:  { value: makeWithReason.bind(null, 422), enumerable: true },
  precondtionRequired:  { value: makeWithReason.bind(null, 428), enumerable: true },
  tooManyRequests:      { value: makeWithReason.bind(null, 429), enumerable: true },
  internalServerError:  { value: makeWithReason.bind(null, 500), enumerable: true },
  notImplemented:       { value: makeWithReason.bind(null, 501), enumerable: true },
  badGateway:           { value: makeWithReason.bind(null, 502), enumerable: true },
  serviceUnavailable:   { value: makeWithReason.bind(null, 503), enumerable: true },
  gatewayTimeout:       { value: makeWithReason.bind(null, 504), enumerable: true },
  versionNotSupported:  { value: makeWithReason.bind(null, 505), enumerable: true },
  unexpected:           { value: makeWithReason, enumerable: true }

});

module.exports = ResourceError;
