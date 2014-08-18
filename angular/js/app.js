var shuffler = angular.module('shuffler', [
	'shufflerControllers',
  'ngRoute'
]);

shuffler.config([ '$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
      // Tag Selection Page
      .when('/', {
        templateUrl: 'partials/start.html',
        controller: 'StartController'
      })
      // Suggestion Page
      .when('/movie', {
        templateUrl: 'partials/movie.html',
        controller: 'MovieController',
        
      })
      .otherwise({redirectTo:'/'});
      $locationProvider.html5Mode(true);
}]);

shuffler.factory('ArrayService', function () {
	return {
	  extractRandom: function (arr) {
	    var index = Math.floor(Math.random() * arr.length)
	      , result = arr[index];
	    arr.splice(index, 1);
	    return result;
	  },
	  balance: function (arr) {
	  	var num = Math.floor(arr.length / 2)
	  	  , shortest = []
	  	  , balanced = []
      shortest = [].concat((arr.sort(function (a, b) { return a.length - b.length; })).splice(0,num));
      while (shortest.length || arr.length) {
        if (shortest.length)
          balanced.push(this.extractRandom(shortest));
        if (arr.length)
          balanced.push(this.extractRandom(arr));
      }
      return balanced;
	  },
	  extractActive: function (current, selected) {
	  	for (var j = current.length-1; j >= 0; j--) {
	      if (current[j].active) {
	        selected.unshift(current[j]);
	        current.splice(j, 1);
	      }
	    }
	  },
	  getTotal: function (arr) {
	  	var total = 0;
	  	for (var i = 0; i < arr.length; i++) {
	  		total += arr[i].name.length;
	  	}
	  	return total;
	  }
	}
});

shuffler.directive('tagbox', [ '$window', function ($window) {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/tagbox.html',
		link: function (scope, elem, attr) {
			attr.$observe('size', function(size) {
        var max = 100;
  			if (window.innerWidth > 688 && size < max) {
  				// Adjust width of tagbox to better wrap text
    			elem.css({
      			width: size+'%'
      		});
      	} else if (size >= max) {
      		// Increase size of tagbox after a change in average tag size (after a shuffle)
    			elem.css({
      			width: max+'%'
      		});
      	}
      	var win = angular.element($window);
	      win.bind("resize", function(e) {
	      	if (window.innerWidth < 688 && size < max) {
	      		// Remove adjusted tagbox width for users who manually shrink their browsers
	      		elem.css({
	      			width: max+'%'
	      		});
	      	} else if (window.innerWidth > 688 && size < max) {
	      		// Return to adjusted size for users who manually increase the size of their browser
	      		elem.css({
	      			width: size+'%'
	      		});
	      	}
	      });
  		});
		},
		controller: function($scope, $element) {
			// Toggle between selected and non-selected tags
			$scope.toggleActive = function(tag){
				tag.active = !tag.active;
			};
		}
	};
}]);