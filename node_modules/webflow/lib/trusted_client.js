'use strict';

var dbc         = require('dbc.js')
, request       = require('request')
, util          = require('util')
, extend        = util._extend
, url           = require('url')
, Hooked        = require('hooked').Hooked
, Success       = require('./success')
, ResourceError = require('./errors')
;

var __sequence = 0;

function nonEmpty(item) {
	return !!item;
}

function padL(n, len) {
	// JSLINT doesn't like the next line but we're purposely initializing the len.
	// ...there should be some JSLINT options that remove the warning but I don't know
	//    what they are.
	return (new Array(len - String(n).length + 1)).join("0").concat(n);
};

function sequence() {
	return padL(__sequence++, 10);
};

function TrustedClient(options) {
	dbc(['object' === typeof options], "options (argument 1) must be provided.");
	dbc(['string' === typeof options.baseUrl], "options (argument 1) must provide have a baseUrl property.");
	TrustedClient.super_.call(this);

	var log = options.log || null
	, baseUrl = url.parse(options.baseUrl)
	, state = {}
	, httpSignature = options.httpSignature
	;

	Object.defineProperties(state, {

		prepared_path: {
			value: url.format(baseUrl),
			enumerable: true,
			writable: true
		},

		options: {
			get: function() {
				return (options) ? {
					baseUrl: options.baseUrl,
					log: log,
					httpSignature: httpSignature
				} : undefined;
			}
		}
	});

	Object.defineProperties(this, {

		baseUrl: {
			get: function get_baseUrl() { return baseUrl; },
			enumerable: true
		},

		_log: {
			value: function(level, msg, data) {
				if (log) {
					if(typeof data === 'undefined') {
						log[level](msg);
					} else {
						log[level](msg, data);
					}
				}
			}
		},

		_state: { get: function() { return state; } },
	});

	this._log('info', 'new TrustedClient instance for baseUrl: '.concat(url.format(this.baseUrl)));
}
util.inherits(TrustedClient, Hooked);


Object.defineProperties(TrustedClient.prototype, {

	filtered_headers: {
		value: ['server', 'vary'],
		enumerable: true
	},

	_parseLink: {
		value: function(link) {
			// format: <some/path/npaths>; key="value"
			var capture = link.trim().match(/^<([^>]+)>;\s([^=]+)="([^"]+)"$/)
			, decoded = capture.map(decodeURIComponent)
			, linkPart = decoded.slice(1, 2)[0].split('/').filter(nonEmpty)
			, kvPart = decoded.slice(2)
			;
			return {
				link: linkPart,
				arg: {
					key: kvPart[0],
					value: kvPart[1]
				}
			};
		},
		enumerable: true
	},

	_parseLinks: {
		value: function(links) {
			var them = links.split(',')
			, i = -1
			, len = them.length
			, res = []
			;
			while(++i < len) {
				res.push(this._parseLink(them[i]));
			}
			return res;
		},
		enumerable: true
	},

	_filterHeaders: {
		value: function(head) {
			var o = {}
			, that = this;
			;
			Object.keys(head).forEach(function (k) {
				if (that.filtered_headers.indexOf(k) < 0) {
					switch (k) {
						case 'content-length':
						o[k] = parseInt(head[k], 10);
						break;
						case 'last-modified':
						o[k] = head[k];
						o['last-modified-sort'] = new Date(head[k]).toISOString();
						break;
						case 'link':
						o.links = that._parseLinks(head[k]);
						break;
						default:
						o[k] = head[k];
						break;
					}
				}
			});
			return o;
		},
		enumerable: true
	},

	_decodeMultipartPart: {
		value: function(part) {
			if (typeof part !== 'object') {
				throw new TypeError('[Object] part must be an object');
			}
			if (part.body) {
				var contentType = ((part.headers) ? part.headers['content-type'] : undefined) || '';
				switch (contentType) {
					case 'application/binary':
					case 'application/octet-stream':
						part.body = new Buffer(part.body, 'binary');
						break;
					case 'application/json':
						part.body = JSON.parse(part.body);
						break;
				}
			}
			return part;
		},
		enumerable: true
	},

	_extractBoundary: {
		value: function(header) {
			var c = header.match(/boundary=([A-Za-z0-9\'()+_,-.\/:=?]+)/);
			if (c) {
				return c[1];
			}
		},
		enumerable: true
	},

	_parseHttpHeadersAndBody: {
		value: function(part) {
			var body, headers, parsed, res, md = part.split(/\r?\n\r?\n/);
			if (md) {
				headers = md[0];
				body = md[1];
				parsed = {};
				headers.split(/\r?\n/).forEach(function(header) {
					var ea = header.split(': '),
					k = ea[0],
					v = ea[1];
					return (parsed[k.toLowerCase()] = v);
				});
				headers = this._filterHeaders(parsed);
				return {
					headers: headers,
					body: body
				};
			}
		},
		enumerable: true
	},

	_sortLastModifiedHeader: {
		value: function (a, b) {
			return a.headers['last-modified-sort'] > b.headers['last-modified-sort'];
		}
	},

	_parseMultiPartResponse: {
		value: function(body, res, contentType) {
			if (body && res) {
				var boundary = this._extractBoundary(contentType);
				var escapedBoundary = boundary.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
				var outerBoundary = new RegExp('\r?\n--'.concat(escapedBoundary, '--\r?\n'));
				var innerBoundary = new RegExp('\r?\n--'.concat(escapedBoundary, '\r?\n'));
				var parts = body.split(outerBoundary);
				parts = ((parts) !== null ? parts[0] : undefined) || "";
				parts = parts.split(innerBoundary).filter(nonEmpty)
				.map(this._parseHttpHeadersAndBody).filter(nonEmpty)
				.map(this._decodeMultipartPart);
				parts.sort(this._sortLastModifiedHeader);
				res.body = parts;
			}
		},
		enumerable: true
	},

	_handleResponse: {
		value: function(method, req, cb, err, res, body) {
			if (err) {
				if (cb) { cb(err); }
			}
			else if (cb) {
				var result;
				try {
					var meta =  {
						method: method,
						uri: this.formatPath(req.path, req.params),
						path: req.path,
						statusCode: res.statusCode,
						headers: this._filterHeaders(res.headers)
					};
					if (req.params) {
						meta.query = req.params;
					}
					result = { meta: meta };
					if (req.mixin) {
						extend(result, req.mixin);
					}
					var contentType = res.headers['content-type'] || ''
					, bodyType = typeof body
					;
					switch (contentType) {
						case 'application/json':
							var json = body;
							if (bodyType === 'string') {
								if (body.length) {
									try {
										json = JSON.parse(body);
									}
									catch (e) {
										this._log('error', ''.concat(req.__sequence,
											' - HTTP ', method, ' response: ',
											res.statusCode, '. Claimed application\\json but could not parse body.'));
										cb(e);
										return;
									}
								}
							}
							if (Array.isArray(json)) {
								result.body = json;
							} else {
								result.body = this.jsonBodyTransform(json, meta);
							}
							break;
						case 'application/binary':
						case 'application/octet-stream':
							result.body = new Buffer(part.body, 'binary');
							break;
						case 'multipart/mixed':
							this._parseMultipartResponse(body, result, contentType);
							break;
						default:
							if (bodyType !== 'undefined') {
								result.body = body;
							}
							break;
					}
				} catch (ee) {
					this._log('error', ''.concat(req.__sequence, ' - HTTP ', method, ' response: ', res.statusCode));
					cb(ee, null);
					return;
				}
				this._log('info', ''.concat(req.__sequence, ' - HTTP ', method), result);
				cb(null, result);
			}
		}
	},

	_request: {
		value: function(req, callback) {
			dbc([typeof req === 'object'], 'req must be an object.');
			var method = req.method || 'GET'
			, basePath
			, opt
			;
			req.__sequence = sequence();
// if server_path is specified it overrides the default relative path;
// hook it up if present...
			if (req.server_path) {
				req.path = req.server_path;
				basePath = url.format(this.baseUrl);
			}
			opt = { uri: this.formatPath(req.path, req.params, basePath) };
			if (req.options) {
				extend(opt, req.options);
			}
			this._log('info', ''.concat(req.__sequence, ' - HTTP ', method), util.inspect(opt));
// allow subclasses to contribute request options...
			if (this.contributeOptions) {
				extend(opt, this.contributeOptions(req));
			}
// only attach the httpSignature after options have been contributed, raises difficulty of spying
// on the private key.
			if (this._state.options.httpSignature) opt.httpSignature = this._state.options.httpSignature;
			var m = method.toLowerCase();
			if (m[0] === 'd') { m = 'del'; }
			request[m](opt, this._handleResponse.bind(this, method, req, callback));
		}
	},

	_appendPath: {
		value: function(base, plus) {
			var end = base && base[base.length-1] === '/';
			var begin = plus && plus[0] === '/';
			if (begin && end) { return base.concat(plus.substring(1)); }
			return (end || begin) ? base.concat(plus) : base.concat('/',plus);
		}
	},

	appendPath: {
		value: function(path) {
			this._state.prepared_path = this._appendPath(this._state.prepared_path, path);
		},
		enumerable: true
	},

	_method: {
		value: function(method, req, callback) {
			try {
				dbc(typeof req === 'object', 'req must be an object.');
				req.method = method;
				this._request(req, callback);
			} catch (err) {
				if (callback) { callback(err); }
			}
		}
	},

	head: {
		value: function(req, callback) {
			this._method('HEAD', req, callback);
		},
		enumerable: true
	},

	get: {
		value: function(req, callback) {
			this._method('GET', req, callback);
		},
		enumerable: true
	},

	post: {
		value: function(req, callback) {
			this._method('POST', req, callback);
		},
		enumerable: true
	},

	put: {
		value: function(req, callback) {
			this._method('PUT', req, callback);
		},
		enumerable: true
	},

	del: {
		value: function(req, callback) {
			this._method('DELETE', req, callback);
		},
		enumerable: true
	},

	successOk: {
		value: function(callback, elm, evt) {
			dbc([typeof callback === 'function' || !callback], 'callback must be a function');
			return function(err, res) {
				if (callback) {
					var typ = typeof elm
					, it
					;
					if (typ === 'string') {
						if (evt) this.emit(evt, res.body[elm]);
						callback(null, Success.ok(res.body[elm]));
					} else if (typ === 'function') {
						it = elm(res);
						if (evt) this.emit(evt, it);
						callback(null, Success.ok(it));
					} else {
						if (evt) this.emit(evt);
						callback(null, Success.ok());
					}
				}
			}.bind(this);
		}
	},

	expect200: {
		value: function(error, next) {
			dbc([typeof error === 'function' || !error], 'error must be a function');
			dbc([typeof next === 'function' || !next], 'next must be a function');
			return function(err, res) {
				if (err) {
					if (error) { error(err); }
					return;
				}
				if (res.meta.statusCode === 200) {
					if (next) { next(null, res); }
					return;
				}
				if (error) { error(ResourceError.unexpected(res.meta.statusCode, res)); }
			};
		}
	},

	expect200range: {
		value: function(error, next) {
			dbc([typeof error === 'function' || !error], 'error must be a function');
			dbc([typeof next === 'function' || !next], 'next must be a function');
			return function(err, res) {
				if (err) {
					if (error) { error(err); }
					return;
				}
				if (res.meta.statusCode >= 200 && res.meta.statusCode < 300) {
					if (next) { next(null, res); }
					return;
				}
				if (error) { error(ResourceError.unexpected(res.meta.statusCode, res)); }
			};
		}
	},

	jsonBodyTransform: {
		value: function(body, meta) {
			return body;
		},
		enumerable: true
	},

	formatPath: {
		value: function(path, query, base) {
			base = base || this._state.prepared_path;
			var result = (path) ? url.parse(this._appendPath(base, path)) : url.parse(base);
			if (query) {
				result.query = query;
			}
			return url.format(result);
		},
		enumerable: true
	},

 	defaultHeaders: {
		value: function(body, meta) {
			var headers = {};
			headers.Accept = 'application/json';
			return headers;
		},
		enumerable: true
	}

});

Object.defineProperties(TrustedClient, {

	create: {
		value: function(options) {
			return new TrustedClient(options);
		},
		enumerable: true
	}

});

module.exports = TrustedClient;