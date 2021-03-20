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