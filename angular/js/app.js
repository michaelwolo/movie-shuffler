var shuffler = angular.module('shuffler', [
	// 'shufflerControllers',
  'ngRoute',
	'ngAnimate'
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
	      	console.log('Window resized!');
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

shuffler.controller('ShufflerController', [ '$scope', '$http', '$window', '$sce', function ($scope, $http, $window, $sce) {

  $scope.array = [];
  // $scope.total = [];
  $scope.random = [];
  // $scope.shown = [];


  // $scope.$parent.movies = [];
  // $scope.sent = false;

  // $scope.first = false;

  $scope.selected = [];
  $scope.movies = [];

  // TODO: Move extractRandom to Angular service
  $scope.extractRandom = function (arr) {
    var index = Math.floor(Math.random() * arr.length)
      , result = arr[index];
    arr.splice(index, 1);
    return result;
  };

  // $scope.loadTags = function () {
  //  $http.get('http://movieshuffler.com/scripts/tags.php').success(function(data){
  //    // $scope.$parent.array = data;
  //    // Temporarily use fake data for extra active property
  //    $scope.$parent.array = [
  //      {
  //        name: 'weird',
  //        active:false
  //      },{
  //        name: 'awkward',
  //        active:false
  //      },{
  //        name: 'crime',
  //        active:false
  //      },{
  //        name: 'foreign',
  //        active:false
  //      },{
  //        name: 'zombies',
  //        active:false
  //      },{
  //        name: 'time travel',
  //        active:false
  //      },{
  //        name: 'magic',
  //        active:false
  //      },{
  //        name: 'science fiction',
  //        active:false
  //      },{
  //        name: '2010s',
  //        active:false
  //      },{
  //        name: 'family friendly',
  //        active:false
  //      },{
  //        name: 'party',
  //        active:false
  //      },{
  //        name: 'superhero',
  //        active:false
  //      },{
  //        name: 'disaster',
  //        active:false
  //      },{
  //        name: 'dark',
  //        active:false
  //      },{
  //        name: 'animated',
  //        active:false
  //      },{
  //        name: 'robots',
  //        active:false
  //      },{
  //        name: 'mystery',
  //        active:false
  //      },{
  //        name: 'dating',
  //        active: false
  //      },{
  //        name: '90s',
  //        active: false
  //      },{
  //        name: 'feel good',
  //        active: false
  //      },{
  //        name: 'military',
  //        active: false
  //      },{
  //        name: 'disney',
  //        active: false
  //      },{
  //        name: 'thriller',
  //        active: false
  //      }
  //    ];
  //    $scope.total.push.apply($scope.total, $scope.$parent.array);
  //    var total = 0
  //      , i = 0
  //      , num = 0
  //      , length = 17
  //      , shortest = []
  //      , temp = [];
  //    for (i; i < length; i++) {
  //      temp.push($scope.$parent.array[i]);
  //      total += temp[i].name.length;
  //      // Take from beginning each time because the array mutates after each operation
  //      // TODO: Improve hacky double array algorithm
  //      $scope.total.splice(0, 1);
  //    }
  //    console.log('Average: ' + total/length);
  //    $scope.size = Math.round(100-8.8*(7.5-(total / length)));
  //    num = Math.floor(temp.length / 2);
  //    shortest = [].concat((temp.sort(function (a, b) { return a.length - b.length; })).splice(0,num));
  //    while (shortest.length || temp.length) {
  //      if (shortest.length)
  //        $scope.$parent.random.push(extractRandom(shortest));
  //      if (temp.length)
  //        $scope.$parent.random.push(extractRandom(temp));
  //    }
  //    $scope.first = true;
  //  });
  // };

  // $scope.loadTags();

  // $scope.shuffleTags = function () {
  //  // TODO: Move tagBalancer to separate service
  //  // TODO: Move tagShuffler to separate service
  //  var total = 0
  //    , index = 0
  //    , num = 0
  //    , required = 0
  //    , length = 17
  //    , shortest = []
  //    , temp = []
  //    , selected = [];
  //  for (var j = $scope.$parent.random.length-1; j >= 0; j--) {
  //    if ($scope.$parent.random[j].active) {
  //      console.log('Tag is active: ' + $scope.$parent.random[j].name);
  //      selected.unshift($scope.$parent.random[j]);
  //      total += $scope.$parent.random[j].name.length;
  //      $scope.$parent.random.splice(j, 1);
  //    }
  //  }
  //  console.log('selected [] length: ' + selected.length);
  //  required = length - selected.length;
  //  for (var i = 0; i < required; i++) {
  //    if (!$scope.total.length) {
  //      if (!$scope.shown.length) {
  //        index = Math.floor(Math.random()*$scope.$parent.random.length);
  //        $scope.total.push($scope.$parent.random[index]);
  //        $scope.$parent.random.splice(index, 1);
  //      } else {
  //        $scope.total = $scope.shown;
  //        $scope.shown = [];
  //      }
  //    }
  //    index = Math.floor(Math.random()*$scope.total.length);
  //    temp.push($scope.total[index]);
  //    total += $scope.total[index].name.length;
  //    $scope.total.splice(index, 1);
  //  }
  //  $scope.shown.push.apply($scope.shown, $scope.$parent.random);
  //  console.log('Average: ' + total/length);
  //  $scope.size = Math.round(100-8.8*(7.5-(total / length)));
  //  num = Math.floor(temp.length / 2);
  //  shortest = [].concat((temp.sort(function (a, b) { return a.length - b.length; })).splice(0,num));
  //  $scope.$parent.random = [];
  //   while (shortest.length || temp.length) {
  //     if (shortest.length)
  //       $scope.$parent.random.push(extractRandom(shortest));
  //     if (temp.length)
  //       $scope.$parent.random.push(extractRandom(temp));
  //   }
  //   if (selected.length) {
  //    $scope.$parent.random.unshift.apply($scope.$parent.random, selected);
  //   }
  // };

  // $scope.getMovie = function(array) {
  //  var names = [];
  //  // if ($scope.$parent.movies.length) {
  //  //  $scope.$parent.movies[0].trailer = '';
  //  // }
  //  $scope.$parent.movies = [];
  //  $scope.sent = true;
  //  $scope.first = false;
  //  // $scope.second = false;
  //  for (var i = 0; i < array.length; i++) {
  //    if (array[i].active) {
  //      names.push(array[i].name);
  //    }
  //  }
  //  $scope.$parent.array = [];
  //  console.log(names);
  //  $http({method: 'POST', data:'tags='+names.join(','), headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: 'http://movieshuffler.com/php/suggestion.php'}).success(function(data){
  //    $scope.sent = false;
  //    $scope.$parent.movies[0] = data;
  //    $scope.$parent.movies[0].trailer = $sce.trustAsResourceUrl('http://www.youtube.com/embed/'+data.trailer+'?rel=0&amp;showinfo=0');
  //    // $scope.second = true;
  //    console.log($scope.$parent.movies);
  //  });
  // };

  // $scope.clearData = function() {
  //  $scope.loadTags();
  //  $scope.$parent.movies = [];
  //  // $scope.sent = false;
  //  for (var i = 0; i < $scope.$parent.random.length; i++) {
  //    if ($scope.$parent.random[i].active) {
  //      $scope.$parent.random[i].active = false;
  //    }
  //  }
  // };
}]);

shuffler.controller('StartController', [ '$scope', '$http', '$location', '$sce', function ($scope, $http, $location, $sce) {
  $scope.total = [];
  // $scope.$parent.random = [];
  $scope.shown = [];

  $scope.loadTags = function () {
    $http.get('http://movieshuffler.com/scripts/tags.php').success(function(data){
      // $scope.$parent.array = data;
      // Temporarily use fake data for extra active property
      $scope.$parent.array = [
        {
          name: 'weird',
          active:false
        },{
          name: 'awkward',
          active:false
        },{
          name: 'crime',
          active:false
        },{
          name: 'foreign',
          active:false
        },{
          name: 'zombies',
          active:false
        },{
          name: 'time travel',
          active:false
        },{
          name: 'magic',
          active:false
        },{
          name: 'science fiction',
          active:false
        },{
          name: '2010s',
          active:false
        },{
          name: 'family friendly',
          active:false
        },{
          name: 'party',
          active:false
        },{
          name: 'superhero',
          active:false
        },{
          name: 'disaster',
          active:false
        },{
          name: 'dark',
          active:false
        },{
          name: 'animated',
          active:false
        },{
          name: 'robots',
          active:false
        },{
          name: 'mystery',
          active:false
        },{
          name: 'dating',
          active: false
        },{
          name: '90s',
          active: false
        },{
          name: 'feel good',
          active: false
        },{
          name: 'military',
          active: false
        },{
          name: 'disney',
          active: false
        },{
          name: 'thriller',
          active: false
        }
      ];
      $scope.total.push.apply($scope.total, $scope.$parent.array);
      var total = 0
        , i = 0
        , num = 0
        , length = 17
        , shortest = []
        , temp = [];
      for (i; i < length; i++) {
        temp.push($scope.$parent.array[i]);
        total += temp[i].name.length;
        // Take from beginning each time because the array mutates after each operation
        // TODO: Improve hacky double array algorithm
        $scope.total.splice(0, 1);
      }
      console.log('Average: ' + total/length);
      $scope.size = Math.round(100-8.8*(7.5-(total / length)));
      num = Math.floor(temp.length / 2);
      shortest = [].concat((temp.sort(function (a, b) { return a.length - b.length; })).splice(0,num));
      // $scope.$parent.random = [];
      while (shortest.length || temp.length) {
        if (shortest.length)
          $scope.$parent.random.push($scope.extractRandom(shortest));
        if (temp.length)
          $scope.$parent.random.push($scope.extractRandom(temp));
      }
      $scope.first = true;
    });
  };

  $scope.loadTags();

  $scope.shuffleTags = function () {
    // TODO: Move tagBalancer to separate service
    // TODO: Move tagShuffler to separate service
    var total = 0
      , index = 0
      , num = 0
      , required = 0
      , length = 17
      , shortest = []
      , temp = []
      , selected = [];
    for (var j = $scope.$parent.random.length-1; j >= 0; j--) {
      if ($scope.$parent.random[j].active) {
        console.log('Tag is active: ' + $scope.$parent.random[j].name);
        selected.unshift($scope.$parent.random[j]);
        total += $scope.$parent.random[j].name.length;
        $scope.$parent.random.splice(j, 1);
      }
    }
    console.log('selected [] length: ' + selected.length);
    required = length - selected.length;
    for (var i = 0; i < required; i++) {
      if (!$scope.total.length) {
        if (!$scope.shown.length) {
          index = Math.floor(Math.random()*$scope.$parent.random.length);
          $scope.total.push($scope.$parent.random[index]);
          $scope.$parent.random.splice(index, 1);
        } else {
          $scope.total = $scope.shown;
          $scope.shown = [];
        }
      }
      index = Math.floor(Math.random()*$scope.total.length);
      temp.push($scope.total[index]);
      total += $scope.total[index].name.length;
      $scope.total.splice(index, 1);
    }
    $scope.shown.push.apply($scope.shown, $scope.$parent.random);
    console.log('Average: ' + total/length);
    $scope.size = Math.round(100-8.8*(7.5-(total / length)));
    num = Math.floor(temp.length / 2);
    shortest = [].concat((temp.sort(function (a, b) { return a.length - b.length; })).splice(0,num));
    $scope.$parent.random = [];
    while (shortest.length || temp.length) {
      if (shortest.length)
        $scope.$parent.random.push($scope.extractRandom(shortest));
      if (temp.length)
        $scope.$parent.random.push($scope.extractRandom(temp));
    }
    if (selected.length) {
      $scope.$parent.random.unshift.apply($scope.$parent.random, selected);
    }
  };

  $scope.changeView = function (view) {
   $location.path(view); // path not hash
  };
}]);

shuffler.controller('MovieController', [ '$scope', '$http', '$location', '$sce', function ($scope, $http, $location, $sce) {
  $scope.seen = [];
  $scope.searching = true;
  $scope.suggestion = {};
  $scope.disabled = false;

  $scope.getMovie = function (array) {
    // Clear previous suggestion to ensure previous trailer image does not flicker prior to loading new trailer
    $scope.suggestion = {};
    if (!$scope.searching) {
      $scope.searching = true;
    }
    // Clear previously selected tags
    $scope.$parent.selected = [];
    for (var i = 0; i < array.length; i++) {
      if (array[i].active) {
        $scope.$parent.selected.push(array[i].name);
      }
    }
    // TODO: Store movie IDs in parent scope and send with tags to prevent server from repeating suggestions
    $http({method: 'POST', data:'tags='+$scope.$parent.selected.join(','), headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: 'http://movieshuffler.com/php/suggestion.php'}).success(function(data){
      $scope.$parent.movies = data;
      // // Temporarily use fake data to simulate returned array
      // $scope.$parent.movies = [
      //   {
      //     title: "This is the End",
      //     year: 2013,
      //     rating: 72,
      //     trailer: "Yma-g4gTwlE"
      //   },{
      //     title: "Twelve Monkeys",
      //     year: 1995,
      //     rating: 88,
      //     trailer: "15s4Y9ffW_o"
      //   }
      // ];
      // Flesh out YouTube URL for all YouTube trailer IDs
      // for (var i = 0; i < $scope.$parent.movies.length; i++) {
      //   console.log('Iteration ' + i);
      //   console.log($scope.$parent.movies[i].title);
        $scope.$parent.movies.trailer = $sce.trustAsResourceUrl('http://www.youtube.com/embed/'+$scope.$parent.movies.trailer+'?rel=0&amp;showinfo=0');
      // }
      // Store movie IDs here
      // $scope.$parent.ids = $scope.$parent.movies.id;
      $scope.suggestion = $scope.$parent.movies;
      $scope.searching = false;
    });
  };

  $scope.getMovie($scope.$parent.random);

  $scope.clearActive = function() {
    $scope.$parent.random = [];
    $location.path('/');
  };
}]);