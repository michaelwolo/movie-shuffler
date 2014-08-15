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
        controller: 'MovieController'
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


  // $scope.movies = [];
  // $scope.sent = false;

  // $scope.first = false;

  $scope.selected = [];
  $scope.movies = [];

  // TODO: Move extractRandom to Angular service
  $scope.extractRandom = function (arr) {
    var index = Math.floor(Math.random() * arr.length)
      , result = arr[index];
    arr.splice(index, 1);
    return(result);
  };

  // $scope.loadTags = function () {
  //  $http.get('http://movieshuffler.com/scripts/tags.php').success(function(data){
  //    // $scope.array = data;
  //    // Temporarily use fake data for extra active property
  //    $scope.array = [
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
  //    $scope.total.push.apply($scope.total, $scope.array);
  //    var total = 0
  //      , i = 0
  //      , num = 0
  //      , length = 17
  //      , shortest = []
  //      , temp = [];
  //    for (i; i < length; i++) {
  //      temp.push($scope.array[i]);
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
  //        $scope.random.push(extractRandom(shortest));
  //      if (temp.length)
  //        $scope.random.push(extractRandom(temp));
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
  //  for (var j = $scope.random.length-1; j >= 0; j--) {
  //    if ($scope.random[j].active) {
  //      console.log('Tag is active: ' + $scope.random[j].name);
  //      selected.unshift($scope.random[j]);
  //      total += $scope.random[j].name.length;
  //      $scope.random.splice(j, 1);
  //    }
  //  }
  //  console.log('selected [] length: ' + selected.length);
  //  required = length - selected.length;
  //  for (var i = 0; i < required; i++) {
  //    if (!$scope.total.length) {
  //      if (!$scope.shown.length) {
  //        index = Math.floor(Math.random()*$scope.random.length);
  //        $scope.total.push($scope.random[index]);
  //        $scope.random.splice(index, 1);
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
  //  $scope.shown.push.apply($scope.shown, $scope.random);
  //  console.log('Average: ' + total/length);
  //  $scope.size = Math.round(100-8.8*(7.5-(total / length)));
  //  num = Math.floor(temp.length / 2);
  //  shortest = [].concat((temp.sort(function (a, b) { return a.length - b.length; })).splice(0,num));
  //  $scope.random = [];
  //   while (shortest.length || temp.length) {
  //     if (shortest.length)
  //       $scope.random.push(extractRandom(shortest));
  //     if (temp.length)
  //       $scope.random.push(extractRandom(temp));
  //   }
  //   if (selected.length) {
  //    $scope.random.unshift.apply($scope.random, selected);
  //   }
  // };

  // $scope.getMovie = function(array) {
  //  var names = [];
  //  // if ($scope.movies.length) {
  //  //  $scope.movies[0].trailer = '';
  //  // }
  //  $scope.movies = [];
  //  $scope.sent = true;
  //  $scope.first = false;
  //  // $scope.second = false;
  //  for (var i = 0; i < array.length; i++) {
  //    if (array[i].active) {
  //      names.push(array[i].name);
  //    }
  //  }
  //  $scope.array = [];
  //  console.log(names);
  //  $http({method: 'POST', data:'tags='+names.join(','), headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: 'http://movieshuffler.com/php/suggestion.php'}).success(function(data){
  //    $scope.sent = false;
  //    $scope.movies[0] = data;
  //    $scope.movies[0].trailer = $sce.trustAsResourceUrl('http://www.youtube.com/embed/'+data.trailer+'?rel=0&amp;showinfo=0');
  //    // $scope.second = true;
  //    console.log($scope.movies);
  //  });
  // };

  // $scope.clearData = function() {
  //  $scope.loadTags();
  //  $scope.movies = [];
  //  // $scope.sent = false;
  //  for (var i = 0; i < $scope.random.length; i++) {
  //    if ($scope.random[i].active) {
  //      $scope.random[i].active = false;
  //    }
  //  }
  // };
}]);

shuffler.controller('StartController', [ '$scope', '$http', '$location', '$sce', function ($scope, $http, $location, $sce) {
  $scope.total = [];
  // $scope.random = [];
  $scope.shown = [];

  $scope.loadTags = function () {
    $http.get('http://movieshuffler.com/scripts/tags.php').success(function(data){
      // $scope.array = data;
      // Temporarily use fake data for extra active property
      $scope.array = [
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
      $scope.total.push.apply($scope.total, $scope.array);
      var total = 0
        , i = 0
        , num = 0
        , length = 17
        , shortest = []
        , temp = [];
      for (i; i < length; i++) {
        temp.push($scope.array[i]);
        total += temp[i].name.length;
        // Take from beginning each time because the array mutates after each operation
        // TODO: Improve hacky double array algorithm
        $scope.total.splice(0, 1);
      }
      console.log('Average: ' + total/length);
      $scope.size = Math.round(100-8.8*(7.5-(total / length)));
      num = Math.floor(temp.length / 2);
      shortest = [].concat((temp.sort(function (a, b) { return a.length - b.length; })).splice(0,num));
      // $scope.random = [];
      while (shortest.length || temp.length) {
        if (shortest.length)
          $scope.random.push($scope.extractRandom(shortest));
        if (temp.length)
          $scope.random.push($scope.extractRandom(temp));
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
    for (var j = $scope.random.length-1; j >= 0; j--) {
      if ($scope.random[j].active) {
        console.log('Tag is active: ' + $scope.random[j].name);
        selected.unshift($scope.random[j]);
        total += $scope.random[j].name.length;
        $scope.random.splice(j, 1);
      }
    }
    console.log('selected [] length: ' + selected.length);
    required = length - selected.length;
    for (var i = 0; i < required; i++) {
      if (!$scope.total.length) {
        if (!$scope.shown.length) {
          index = Math.floor(Math.random()*$scope.random.length);
          $scope.total.push($scope.random[index]);
          $scope.random.splice(index, 1);
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
    $scope.shown.push.apply($scope.shown, $scope.random);
    console.log('Average: ' + total/length);
    $scope.size = Math.round(100-8.8*(7.5-(total / length)));
    num = Math.floor(temp.length / 2);
    shortest = [].concat((temp.sort(function (a, b) { return a.length - b.length; })).splice(0,num));
    $scope.random = [];
    while (shortest.length || temp.length) {
      if (shortest.length)
        $scope.random.push($scope.extractRandom(shortest));
      if (temp.length)
        $scope.random.push($scope.extractRandom(temp));
    }
    if (selected.length) {
      $scope.random.unshift.apply($scope.random, selected);
    }
  };

  // $scope.changeView = function (view) {
  //  $location.path(view); // path not hash
 //  };

  $scope.getMovies = function (array) {
    // Clear previously selected tags
    $scope.selected = [];
    for (var i = 0; i < array.length; i++) {
      if (array[i].active) {
        $scope.selected.push(array[i].name);
      }
    }
    $http({method: 'POST', data:'tags='+$scope.selected.join(','), headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: 'http://movieshuffler.com/php/suggestion.php'}).success(function(data){
      // $scope.movies = data;
      // Temporarily use fake data to simulate returned array
      $scope.movies = [
        {
          title: "This is the End",
          year: 2013,
          rating: 72,
          trailer: "Yma-g4gTwlE"
        },{
          title: "Twelve Monkeys",
          year: 1995,
          rating: 88,
          trailer: "15s4Y9ffW_o"
        }
      ];
      // Flesh out YouTube URL for all YouTube trailer IDs
      for (var i = 0; i < $scope.movies.length; i++) {
        $scope.movies[i].trailer = $sce.trustAsResourceUrl('http://www.youtube.com/embed/'+$scope.movies[i].trailer+'?rel=0&amp;showinfo=0');
      }
      console.log($scope.movies);
      $location.path('/movie');
    });
  };
}]);

shuffler.controller('MovieController', [ '$scope', '$http', '$location', function ($scope, $http, $location) {
  $scope.seen = [];
  $scope.searching = true;

  console.log($scope.movies);

  // Pull additional suggestions from relevant list, ensuring not to repeat unless all have been shown
  $scope.pickOne = function (arr) {
    console.log(arr);
    if (!$scope.searching) {
      $scope.searching = true;
    }
    if (!arr.length) {
      $scope.movies = $scope.seen;
      $scope.seen = [];
    }
    // TODO: Move extractRandom to Angular service
    $scope.suggestion = $scope.extractRandom(arr);
    console.log($scope.suggestion);
    $scope.seen.push($scope.suggestion);
    $scope.searching = false;
  };

  // Pick one movie to suggest
  $scope.suggestion = $scope.pickOne($scope.movies);

  $scope.clearActive = function() {
    // Is clearing necessary? Won't tags be reloaded from the server upon returning to start page?
    // for (var i = 0; i < $scope.random.length; i++) {
    //   if ($scope.random[i].active) {
    //     $scope.random[i].active = false;
    //   }
    // }
    $scope.random = [];
    // Return to start page
    $location.path('/');
  };
}]);