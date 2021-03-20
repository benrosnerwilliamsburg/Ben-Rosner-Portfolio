var vows = require('vows'),
should   = require('should'),
util     = require('util'),
hooked   = require('../')
;

exports.batch = vows.describe('hooked')
.addBatch({
	'Exposes a version': {
		topic: function() { return hooked.version; },
		'matching the package`s version': function(it) {
			it.should.eql(require('../package').version);
		}
	}
})
.addBatch({
	'Exposes a Hooked type': {
		topic: function() { return hooked.Hooked; },
		'which is a function we can construct': {
			topic: function(ctor) {
				var it = new ctor();
				// give our instance a method we can hook...
				it.ping = function pong(times, callback) {
					if (times > 0) {
						callback(null, 'pong');
						if (times > 1) {
							setTimeout(function() { pong(--times, callback); }, 1000);
						}
					}
				};
				return it;
			},
			'the instance has a `before` method': function(it) {
				it.should.have.property('before');
				it.before('ping', function(times, next) {
					console.log('Gonna ping '.concat(times, ' time(s).'));
					next(null, times);
				});
			},
			'the instance has an `after` method': function(it) {
				it.should.have.property('after');
				it.after('ping', function (err, res, next) {
					// should get called 3 times!
					console.log('after ping: '.concat(err || res));
					next(err, res);
				});
			},
			'and ping': {
				topic: function (it) {
					it.ping(3, this.callback);
				},
				'receives the pong': function(err, res) {
					should.not.exist(err);
					res.should.eql('pong');
				}
			}
		}
	},
	'Another instance': {
		topic: function() {
			var it = new hooked.Hooked();
			it.yo = function (name, callback) {
				callback(null, "Yo, ".concat(name, '!'));
			};
			return it;
		},
		'can be hooked before': {
			topic: function (it) {
				it.before('yo', function(name, next) {
					if (name === 'yo') {
						// what are we, a yoyo?
						return false;
					}
					next(null, name);
				});
				return it;
			},
			'and be selectively canceled':  {
				topic: function(it) {
					// this one is selectively canceled.
					it.yo('yo', this.callback);
				},
				'it was canceled': function(err, res) {
					should.exist(err);
					err.should.have.property('error', 'canceled');
				}
			},
			'and be selectively allowed':  {
				topic: function(it) {
					var self = this;
					// delay long enough for the prior test...
					setTimeout(function() {
						it.yo('Adriane', self.callback);
					});
				},
				'succeeded': function(err, res) {
					should.not.exist(err);
					res.should.eql('Yo, Adriane!');
				}
			},
			'and the canceled event gets called when canceled': {
				topic: function(it) {
					it.once('canceled', this.callback);
					// this one is selectively canceled.
					setTimeout(function() {
						it.yo('yo');
					}, 200);
				},
				'it was canceled': function(err, res) {
					should.exist(err);
					err.should.have.property('error', 'canceled');
				}
			},
		}
	}
});
