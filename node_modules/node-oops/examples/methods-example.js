var oops = require('../')
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
