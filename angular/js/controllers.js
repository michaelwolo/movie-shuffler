var shufflerControllers = angular.module('shufflerControllers', []);

shufflerControllers.controller('ShufflerController', [ '$scope', '$http', '$window', '$sce', function ($scope, $http, $window, $sce) {

  $scope.array = [];
  $scope.random = [];
  $scope.selected = [];
  $scope.movies = [];

}]);

shufflerControllers.controller('StartController', [ '$scope', '$http', '$location', '$sce', 'ArrayService', function ($scope, $http, $location, $sce, ArrayService) {
  $scope.num = 17;
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
      var total = 0
        , length = 17
        , batch = [];
      for (i = 0; i < length; i++) {
        batch.push($scope.$parent.array[0]);
        total += $scope.$parent.array[0].name.length;
        $scope.$parent.array.splice(0, 1);
      }
      $scope.size = Math.round(100-8.8*(7.5-(total / length)));
      $scope.$parent.random = ArrayService.balance(batch);
    });
  };

  $scope.loadTags();

  $scope.shuffleTags = function () {
    var total = 0
      , index = 0
      , remaining = 0
      , rand = {}
      , batch = []
      , selected = [];
    ArrayService.extractActive($scope.$parent.random, selected);
    remaining = $scope.num - selected.length;
    for (var i = 0; i < remaining; i++) {
      if (!$scope.$parent.array.length) {
        if (!$scope.shown.length) {
          // Will only occur if the total number of tags is less than 2x visible number (aka <34)
          // Will never happen for Movie Shuffler (why am I doing this?)
          rand = ArrayService.extractRandom($scope.$parent.random);
        } else {
          $scope.$parent.array = $scope.shown;
          $scope.shown = [];
        }
      }
      if ($scope.$parent.array.length) {
        rand = ArrayService.extractRandom($scope.$parent.array);
      }
      batch.push(rand);
    }
    $scope.shown.push.apply($scope.shown, $scope.$parent.random);
    $scope.$parent.random = ArrayService.balance(batch);
    // Prepend previously selected tags to new visible batch
    if (selected.length) {
      $scope.$parent.random.unshift.apply($scope.$parent.random, selected);
    }
    // Use average tag length to determine tagbox width
    total = ArrayService.getTotal($scope.$parent.random);
    $scope.size = Math.round(100-8.8*(7.5-(total / length)));
  };

  $scope.submitTags = function (array) {
    // Clear previously selected tags
    $scope.$parent.selected = [];
    for (var i = 0; i < array.length; i++) {
      if (array[i].active) {
        $scope.$parent.selected.push(array[i].name);
      }
    }
    $location.path('/movie');
  };
}]);

shufflerControllers.controller('MovieController', [ '$scope', '$http', '$location', '$sce', function ($scope, $http, $location, $sce) {
  $scope.seen = [];
  $scope.searching = true;
  $scope.suggestion = {};
  $scope.data = '';

  $scope.getMovie = function () {
    // Clear previous suggestion to ensure previous trailer image does not flicker prior to loading new trailer
    $scope.suggestion = {};
    if (!$scope.searching) {
      $scope.searching = true;
    }
    // Create POST data string if tags and/or ids are provided
    $scope.data = 'tags='+$scope.$parent.selected.join(',')+'&ids='+$scope.seen.join(',');
    $http({method: 'POST', data: $scope.data, headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: 'http://movieshuffler.com/php/suggestion.php'}).success(function(data){
      $scope.$parent.movies = data;
      $scope.$parent.movies.trailer = $sce.trustAsResourceUrl('http://www.youtube.com/embed/'+$scope.$parent.movies.trailer+'?rel=0&amp;showinfo=0');
      // If the movie has already been suggested, clear the seen array to cycle through movies again
      if ($scope.seen.indexOf($scope.$parent.movies.id) >= 0) {
        $scope.seen = [];
      }
      // Store movie IDs here
      $scope.seen.push($scope.$parent.movies.id);
      // Create new suggestion
      $scope.suggestion = $scope.$parent.movies;
      // Hide spinning reel
      $scope.searching = false;
    });
  };

  $scope.getMovie();

  $scope.clearActive = function() {
    $scope.$parent.random = [];
    $location.path('/');
  };
}]);