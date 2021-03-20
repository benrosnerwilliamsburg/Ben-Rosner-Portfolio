var webflow = require('..')
, util      = require('util')
, expect    = require('expect.js')
, Success = webflow.Success
;

describe('Success', function() {

	describe('a new instance', function() {

		describe('created with arity/1', function() {

			describe('the instance', function() {
				var m = "We be good here"
				, obj = new Success(m)
				;

				it('has #success property that reflects the default success message', function() {
					expect(obj).to.have.property('success');
					expect(obj.success).to.be('OK');
				});


				it('has m #result property that reflects the ctor`s first argument', function() {
					expect(obj).to.have.property('result');
					expect(obj.result).to.be(m);
				});

				it('has #httpEquivelant property of 200', function() {
					expect(obj.httpEquivalent).to.be(200);
				});

				it('explains the success when converted to a string', function() {
					expect(obj.toString()).to.eql('Success: 200 - OK; We be good here.');
				})

			});
		});

		describe('created with arity/2', function() {

			describe('the instance', function() {
				var result = "Yay - this is good!"
				, m = "Okidokie"
				, obj = new Success(result, m)
				;

				it('has #success property that reflects the default success message', function() {
					expect(obj).to.have.property('success');
					expect(obj.success).to.be(m);
				});


				it('has #result property equal to the ctor`s second argument', function() {
					expect(obj).to.have.property('result');
					expect(obj.result).to.be(result);
				});

				it('has #httpEquivelant property of 200', function() {
					expect(obj.httpEquivalent).to.be(200);
				});

				it('explains the success when converted to a string', function() {
					expect(obj.toString()).to.eql('Success: 200 - '.concat(m, '; ', result));
				});

				it('converts to a JSON success as expected', function() {
					var json = JSON.stringify(obj);
					expect(json).to.eql('{"success":"Okidokie","result":"Yay - this is good!"}');
				});

			});
	});

describe('created with arity/3', function() {

		describe('the instance', function() {
		var m = "MoreGood"
		, result = "Yeah, it happened!"
		, code = 299
		, obj = new Success(result, m, code)
		;

		it('has #success property equal to the ctor`s second argument', function() {
			expect(obj).to.have.property('success');
			expect(obj.success).to.be(m);
		});


		it('has #result property equal to the ctor`s first argument', function() {
			expect(obj).to.have.property('result');
			expect(obj.result).to.be(result);
		});

		it('has #httpEquivelant property equal to the ctor`s thrid argument', function() {
			// expect(obj).to.have.property('httpEquivalent');
			expect(obj.httpEquivalent).to.be(code);
		});

		it('explains the success when converted to a string', function() {
			expect(obj.toString()).to.eql('Success: 299 - MoreGood; Yeah, it happened!');
		});

		it('converts to a JSON success as expected', function() {
			var json = JSON.stringify(obj);
			expect(json).to.eql('{"success":"MoreGood","result":"Yeah, it happened!"}');
		});

	});
});
});
});