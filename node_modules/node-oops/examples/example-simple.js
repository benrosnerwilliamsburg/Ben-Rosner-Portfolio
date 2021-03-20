;
var oops = require('../')
, util = require('util')
, events = require('events');

/**
* Simple observable person object
*/
function Person(firstname, lastname, middlenames) {
	Person.super_.call(this);

	var _priv = {
		first: firstname || '-unknown-',
		last: lastname || '-unknown-',
		middle: middlenames || '-unknown-'
	};

	this.defines
	.value('_state', {})
	.property('first_name',
		function() { return _priv.first; },
		function(first) {
			first = first || '-unknown-';
			if (first !== _priv.first) {
				var change = {
					what: 'first_name',
					from: _priv.first,
					to: first
				};
				_priv.first = first;
				this.emit('property-changed', change);
			}
		})

	.property('last_name',
		function() { return _priv.last; },
		function(last) {
			last = last || '-unknown-';
			if (last !== _priv.last) {
				var change = {
					what: 'last_name',
					from: _priv.last,
					to: last
				};
				_priv.last = last;
				this.emit('property-changed', change);
			}
		})

	.property('middle_names',
		function() { return _priv.middle; },
		function(middle) {
			middle = middle || '-unknown-';
			if (middle !== _priv.middle) {
				var change = {
					what: 'middle_names',
					from: _priv.middle,
					to: middle
				};
				_priv.middle = middle;
				this.emit('property-changed', change);
			}
		})
	;
}
oops.inherits(Person, events.EventEmitter);

/**
* The default fullname formatter.
*/
function fullnameFormatter( first, last, middle ) {
	return ''.concat(first,
		(last) ? ' '.concat(last) : '',
		(middle) ? ' '.concat(middle) : '');
}

function full_name() {
	var f = this._state.formatter || fullnameFormatter;
	return f(this.first_name, this.last_name, this.middle_names);
}

function overrideFormatter( formatter ) {
	this._state.formatter = formatter;
}

Person.defines
.method(overrideFormatter)
.property(full_name);

var me = new Person('willie', 'wonka');
me.on('property-changed', function(change) {
	console.log('property changed: '.concat(util.inspect(change)));
	console.log('name: '.concat(me.full_name));
});

console.log("initial me: ".concat(me.full_name));

me.first_name = 'Phillip';
me.last_name = 'Clark';
me.middle_names = '-ithinknot-';

me.overrideFormatter(
function ( first, last, middle ) {
	return ''.concat(last, ', ',
		(first) ? ' '.concat(first) : '',
		(middle) ? ' '.concat(middle) : '');
});

console.log("final me: ".concat(me.full_name));
