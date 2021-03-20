var webflow = require('..')
, util      = require('util')
, expect    = require('expect.js')
, ResourceError = webflow.ResourceError
;

describe('ResourceError', function() {

	describe('a new instance', function() {

		describe('created with arity/1', function() {

			describe('the instance', function() {
				var a = "BadBadBad"
				, e = new ResourceError(a)
				;

				it('has #error property that reflects the argument given', function() {
					expect(e).to.have.property('error');
					expect(e.error).to.be(a);
				});


				it('has #reason property of undefined value', function() {
					expect(e).to.have.property('reason');
					expect(e.reason).to.be.an('undefined');
				});

				it('has #httpEquivelant property of 500', function() {
					// expect(e).to.have.property('httpEquivalent');
					expect(e.httpEquivalent).to.be(500);
				});

				it('explains the error when converted to a string', function() {
					expect(e.toString()).to.eql('ResourceError: 500 - BadBadBad.');
				})

			});
		});

		describe('created with arity/2', function() {

			describe('the instance', function() {
				var err = "AnotherBadBadThing"
				, reason = "Something bad happened"
				, e = new ResourceError(err, reason)
				;

				it('has #error property equal to the ctor`s first argument', function() {
					expect(e).to.have.property('error');
					expect(e.error).to.be(err);
				});


				it('has #reason property equal to the ctor`s second argument', function() {
					expect(e).to.have.property('reason');
					expect(e.reason).to.be(reason);
				});

				it('has #httpEquivelant property of 500', function() {
					// expect(e).to.have.property('httpEquivalent');
					expect(e.httpEquivalent).to.be(500);
				});

				it('explains the error when converted to a string', function() {
					expect(e.toString()).to.eql('ResourceError: 500 - AnotherBadBadThing; Something bad happened.');
				});

				it('converts to a JSON error as expected', function() {
					var json = JSON.stringify(e);
					expect(json).to.eql('{"error":"AnotherBadBadThing","reason":"Something bad happened"}');
				});

			});
	});

describe('created with arity/3', function() {

		describe('the instance', function() {
		var err = "MoreBad"
		, reason = "Yeah, it happened!"
		, code = 499
		, e = new ResourceError(err, reason, code)
		;

		it('has #error property equal to the ctor`s first argument', function() {
			expect(e).to.have.property('error');
			expect(e.error).to.be(err);
		});


		it('has #reason property equal to the ctor`s second argument', function() {
			expect(e).to.have.property('reason');
			expect(e.reason).to.be(reason);
		});

		it('has #httpEquivelant property equal to the ctor`s thrid argument', function() {
			// expect(e).to.have.property('httpEquivalent');
			expect(e.httpEquivalent).to.be(code);
		});

		it('explains the error when converted to a string', function() {
			expect(e.toString()).to.eql('ResourceError: 499 - MoreBad; Yeah, it happened!');
		});

		it('converts to a JSON error as expected', function() {
			var json = JSON.stringify(e);
			expect(json).to.eql('{"error":"MoreBad","reason":"Yeah, it happened!"}');
		});

	});
});
});
});