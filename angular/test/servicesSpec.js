'use strict';

jasmine.Matchers.prototype.shouldBeOneOf = function () {
	var arr = this.actual
	  , items = arguments;
	for (var i = 0; i < items.length; i++) {
		
	}
};

describe('service', function () {
	beforeEach(module('shuffler'));

	describe('Testing ArrayService', function () {
		it('should do something', inject(function (ArrayService) {
			var arr = ['Hi', 'Hello', 'Hey'];
			ArrayService.extractRandom(arr).shouldBeOneOf('Hi', 'Hello', 'Hey');
		});
	});
});