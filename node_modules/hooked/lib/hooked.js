var events = require('events')
, oops     = require('node-oops')
, dbc      = oops.dbc
, defines  = oops.create
;

function Hooked(options) {
	Hooked.super_.call(this);
	options = options || {};

	defines(this).value('_hooks', { });
	if (options.unhooked) {
		dbc(Array.isArray(options.unhooked), "options.unhooked must be an array");
		defines(this).value('_unhooked', options.unhooked.slice(0));
	}
	if (options.nonbefore) {
		dbc(Array.isArray(options.nonbefore), "options.nonbefore must be an array");
		defines(this).value('_nonbefore', options.nonbefore.slice(0));
	}
	if (options.nonafter) {
		dbc(Array.isArray(options.nonafter), "options.nonafter must be an array");
		defines(this).value('_nonafter', options.nonafter.slice(0));
	}
	if (options.noevent) {
		dbc(Array.isArray(options.noevent), "options.noevent must be an array");
		defines(this).value('_noevent', options.noevent.slice(0));
	}
	if (options.preenabled) {
		this.enableMethodEvents(options.preenabled);
	}
}
oops.inherits(Hooked, events.EventEmitter);

function copyOnWrite(hooks, when, item) {
	var updated = hooks[when].slice(0);
	updated.push(item);
	hooks[when] = updated;
}

// adapt the recommended delaying mechanism...
var delay = (process && typeof process.nextTick === 'function')
? process.nextTick
: function(delay) { setTimeout(delay, 0); }
;

function ensureConfigurable(it, name) {
	var descriptor = Object.getOwnPropertyDescriptor(it, name);
	if (descriptor && !descriptor.configurable) {
		throw new TypeError('target has a non-configurable property obstructing the operation.');
	}
	return descriptor;
}

function enableMethodEvents(methods) {
	if (typeof methods !== 'undefined') {
		methods = Array.isArray(methods) ? methods : [methods];
		methods.forEach(function (e) {
			_ensureMethodHook(e);
		});
	}
}

function _ensureMethodHook(method) {
	var hooks = this._hooks, hook, that = this;
	if (typeof hooks[method] === 'undefined') {
		var orig = this[method];
		dbc([typeof orig === 'function'], function(){
			return 'Member `'.concat(method, '` is not a function; it cannot be hooked.');
		});
		dbc((!this._unhooked) || this._unhooked.indexOf(method) < 0, function() {
			return 'Method `'.concat(method, '` is ineligible for hooks.');
		});
		dbc([orig.length === 1 || orig.length === 2], function(){
			return 'Method `'.concat(method, '` does not have a signature that can be hooked.');
		});
		var noevent = this._noevent && this._noevent.indexOf(method) >= 0;

		var descriptor = ensureConfigurable(this, method) || {};
		hooks[method] = hook = { before: [], after: [] };
		orig = orig.bind(this);

		if (orig.length === 1) {
			descriptor.value = function(callback) {
				var cb = function(err, res) {
					if (err) {
						if (err.error === 'canceled') {
							that.emit('canceled', err);
						} else {
							that.emit('error', { error: 'unexpected', method: method, reason: err });
						}
					} else if (!noevent) {
						that.emit(method, res);
					}
					if (callback) { callback(err || null, res); }
				};
				that._runBeforeHooksWithoutArgs(method, cb, hook.before, function() {
					orig(function(err, res) {
						if (err) {
							that.emit('error', { error: 'unexpected', method: method, reason: err });
							callback(err);
						} else {
							that._runAfterHooks(err, res, hook.after, cb);
						}
					});
				});
			};
		} else if (orig.length === 2) {
			descriptor.value = function(args, callback) {
				var cb = function(err, res) {
					if (err) {
						if (err.error === 'canceled') {
							that.emit('canceled', err);
						} else {
							that.emit('error', { error: 'unexpected', method: method, reason: err });
						}
					} else if (!noevent) {
						that.emit(method, res);
					}
					if (callback) { callback(err || null, res); }
				};
				that._runBeforeHooks(method, args, cb, hook.before, function(args) {
					orig(args, function(err, res) {
						if (err) {
							that.emit('error', { error: 'unexpected', method: method, reason: err });
							callback(err);
						} else {
							that._runAfterHooks(err, res, hook.after, cb);
						}
					});
				});
			};
		}
		Object.defineProperty(this, method, descriptor);
	}
}

function before(method, hook, behaviors) {
	dbc([typeof method === 'string', method.length > 0], 'method must be a non-empty string.');
	dbc([typeof hook === 'function'], 'method must be a function.');
	dbc([(!this._nonbefore) || this._nonbefore.indexOf(method) < 0], function() {
		return 'Method `'.concat(method, '` is ineligible for before hooks.');
	});
	this._ensureMethodHook(method);
	copyOnWrite(this._hooks[method], 'before', hook);
	return this;
}

function after(method, hook, behaviors) {
	dbc([typeof method === 'string', method.length > 0], 'method must be a non-empty string.');
	dbc([typeof hook === 'function'], 'method must be a function.');
	dbc([(!this._nonafter) || this._nonafter.indexOf(method) < 0], function() {
		return 'Method `'.concat(method, '` is ineligible for after hooks.');
	});
	this._ensureMethodHook(method);
	copyOnWrite(this._hooks[method], 'after', hook);
	return this;
}

function _runBeforeHooksWithoutArgs(method, callback, seq, then) {
	var that = this;
	if (seq.length) {
		(function loop(n) {
			var canceled = false;
			if (n >= seq.length) {
				then();
			} else {
				var it = seq[n];
				try {
					if (it) {
						var cont = it(function(e) {
							if (!canceled) {
								if (e) {
									if (callback) {
										delay(function() {callback(e);});
									}
								} else {
									delay(function() {loop(n + 1);});
								}
							}
						});
						// assume continue unless canceled by falsy result.
						if (typeof cont !== 'undefined' && !cont) {
							canceled = true;
							if (callback) {
								delay(function() {
									callback({ error: 'canceled', method: method, reason: 'Canceled by predicate.' });
								});
							}
						}
					}
				} catch (e) {
					if (callback) { callback(e); }
					else { throw e; }
				}
			}
		}(0));
	} else {
		then();
	}
}

function _runBeforeHooks(method, obj, callback, seq, then) {
	var that = this
	, mutable = obj;
	if (seq.length) {
		(function loop(n) {
			var canceled = false;
			if (n >= seq.length) {
				then(mutable);
			} else {
				var it = seq[n];
				try {
					if (it) {
						var cont = it(mutable, function(e, obj) {
							if (!canceled) {
								if (e) {
									if (callback) {
										delay(function() {callback(e);});
									}
								} else {
									mutable = obj;
									delay(function() {loop(n + 1);});
								}
							}
						});
						// assume continue unless canceled by falsy result.
						if (typeof cont !== 'undefined' && !cont) {
							canceled = true;
							if (callback) {
								delay(function() {
									callback({ error: 'canceled', method: method, reason: 'Canceled by predicate.' });
								});
							}
						}
					}
				} catch (e) {
					if (callback) { callback(e); }
					else { throw e; }
				}
			}
		}(0));
	} else {
		then(mutable);
	}
}

function _runAfterHooks(err, res, seq, then) {
	var mutable = res;
	if (seq.length) {
		(function loop(n) {
			if (n >= seq.length) {
				then(null, mutable);
			} else {
				var it = seq[n];
				try {
					if (it) {
						if (it.length === 3) {
							it(err, mutable, function(err, res) {
								if (err) { then(err); }
								else {
									mutable = res;
									delay(function() {loop(n + 1);});
								}
							});
						} else {
							it(err, mutable);
							delay(function() { loop(n + 1); });
						}
					}
				} catch (e) {
					then(e);
				}
			}
		}(0));
	} else {
		then(null, mutable);
	}
}

defines(Hooked).enumerable
.method(enableMethodEvents)
.method(before)
.method(after);

defines(Hooked)
.method(_ensureMethodHook)
.method(_runBeforeHooks)
.method(_runBeforeHooksWithoutArgs)
.method(_runAfterHooks);

module.exports.Hooked = Hooked;
module.exports.version = require('../package').version;