angular.module('starter.controllers', ['ui.router'])

.controller('AppCtrl', function($scope, $timeout, $http, $state, $window, appService, StorageService) {
  // ApplicationData
  appService.async().then(function(response) {
    $scope.company = response;
    });

  $http.get('appinfo.json')
    .success(function(data, status, headers,config){
      $scope.company = data; // for UI
    })
    .error(function(data, status, headers,config){
      console.log('data error');
    })
    .then(function(result){
      things = result.data;
    });

  // Form data for the login
  $scope.isLogged = parseInt(StorageService.getStatus());
  console.log($scope.isLogged);
  $scope.loginData = {};
  userLog = StorageService.getAll();
  $scope.user = userLog[0];

  // Perform the login action
  $scope.doLogin = function() {
    StorageService.add({'username': $scope.loginData.username, 'password': $scope.loginData.password});
    StorageService.changeStatus('1');
    $window.location.reload(true);
    $state.go('app.settings');
    };

})

.controller('SettingsCtrl', function($scope) {
  $scope.apps = "";
})

.controller('MaglistsCtrl', function(
  $rootScope,
  $scope,
  $http,
  $cordovaProgress,
  $cordovaFile,
  $cordovaFileTransfer,
  ) {

  $http.get('appinfo.json').success(function(data){
    var project = data['project_id'];
    $http.get('http://api-dev.publixx.id/find/MagzApis/'+ project +'/2JKDLFCUER')
      .success(function(data, status, headers,config){
        $scope.maglists = data.results;
      })
      .error(function(data, status, headers,config){
        console.log('data error');
      })
      .then(function(result){
        things = result.data;
      });
  })
  // $scope.loadContent = function(){
  // $cordovaProgress.showDeterminate(false, 100000);
  // }

  // var targetPath = $rootScope.downloadDir;
  // var trustHosts = true;
  // var options = {};
  //
  // alert(targetPath);
  //
  // $scope.downloadContent = function(url){
  //   $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
  //       .then(function(result) {
  //         alert('downloaded')
  //       }, function(err) {
  //         alert('fail download')
  //       }, function (progress) {
  //         $timeout(function () {
  //           $scope.downloadProgress = (progress.loaded / progress.total) * 100;
  //         });
  //       });
  // }




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
