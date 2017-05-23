angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};
  $scope.company = [];

  $http.get('appinfo.json')
    .success(function(data, status, headers,config){
      console.log('data success');
      console.log(data); // for browser console
      $scope.company = data; // for UI
    })
    .error(function(data, status, headers,config){
      console.log('data error');
    })
    .then(function(result){
      things = result.data;
    });


  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('SettingsCtrl', function($scope) {
  $scope.apps = "";
})

.controller('MaglistsCtrl', function($scope, $http, $cordovaProgress) {
  $scope.maglists = [];
  $http.get('http://api-dev.publixx.id/findstrict/MagzApis/2/HA10047493/3')
    .success(function(data, status, headers,config){
      console.log('data success');
      console.log(data.results); // for browser console
      $scope.maglists = data.results; // for UI
    })
    .error(function(data, status, headers,config){
      console.log('data error');
    })
    .then(function(result){
      things = result.data;
    });
  $scope.loadContent = function(){
    $cordovaProgress.showDeterminate(false, 100000);

  }

})

.controller('MaglistCtrl', function($scope, $http, $stateParams, $ionicSideMenuDelegate, $ionicScrollDelegate, $timeout, $ionicModal) {
  $scope.details = [];
  $scope.title = $stateParams.title;
  $http.get('http://api-dev.publixx.id/issue/1/magazine/'+ $stateParams.id)
    .success(function(data, status, headers,config){
      console.log('data success');
      console.log(data.results); // for browser console
      $scope.details = data.results; // for UI
    })
    .error(function(data, status, headers,config){
      console.log('data error');
    })
    .then(function(result){
      things = result.data;
    });

  $scope.options = {
            noSwiping: true,
            noSwipingClass: 'do_not_swipe',
            watchSlidesVisibility:true,
            pagination:false,
  };

  $ionicSideMenuDelegate.canDragContent(false)
  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope,
    animation:'jelly'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {
    $scope.modal.show()
    $scope.imgUrl = "http://placekitten.com/g/500/800";

  }

});
