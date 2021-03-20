// This file is imported by the index.html test page.
// It is my [experimental] AngularJS module for loading and running tests.
// If you run it from nodejs it will fail.

angular.module('testApp', ['ui.directives'])
.config(function($routeProvider){
	$routeProvider
	.otherwise({redirectTo: '/', templateUrl: 'home.html'})
})
;

function TestCtrl ($scope, $timeout, $location, $window) {
	$scope.resetTests = function() {
		var tests = [];
		$('script.test').each(function(i, t) {
			var elm = $(t);
			tests.push({
				test: elm.attr('test'),
				entrypoint: elm.attr('entrypoint'),
				script: elm.text(),
				status: 'ready'
			});
		});
		$scope.tests = tests;
		$scope.counts.tests = tests.length;
		$scope.counts.scheduled = 0;
		$scope.counts.running = 0;
		$scope.counts.passed = 0;
		$scope.counts.failed = 0;
		$timeout(function() { prettyPrint(); }, 0);
	};

	$scope.runTest = function ( test ) {
		try {
			$scope.counts.scheduled --;
			$scope.counts.running ++;
			var entrypoint = $window[test.entrypoint]
			, ended = false
			, parallel = false
			, result = entrypoint(test, function(err, res) {
				$scope.counts.running --;
				if (err) {
					test.status = 'error';
					test.message = err.toString();
					$scope.counts.failed ++;
				} else {
					$scope.counts.passed ++;
					test.status = 'success';
					if (typeof res === 'string') {
						test.message = res;
					} else if (typeof res === 'object' && res !== null) {
						extend(test)
					}
				}
				if (parallel) { $scope.$digest(); }
				ended = true;
			});
			if (typeof result === 'undefined') {
				if (!ended) {
					parallel = true;
					test.status = 'running';
				}
			} else {
				$scope.counts.running --;
				if (result) {
					$scope.counts.passed ++;
					test.status = 'success';
				} else {
					$scope.counts.failed ++;
					test.status = 'error';
				}
			}
		} catch(e) {
			$scope.counts.running --;
			$scope.counts.failed ++;
			test.status = 'error';
			test.message = 'Unexptected error: '.concat(e.toString());
		}
	};

	$scope.performTests = function () {
		$scope.resetTests();
		var i;
		for(i = 0; i < $scope.tests.length; i++) {
			var test = $scope.tests[i];
			$scope.counts.scheduled ++;
			$timeout($scope.runTest.bind($scope, test), 0, true);
		}
	};

	$scope.counts = {
		tests: 0,
		scheduled: 0,
		running: 0,
		passed: 0,
		failed: 0
	};

	$scope.resetTests();
}