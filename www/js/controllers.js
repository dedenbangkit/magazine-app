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
  $cordovaZip,
  $timeout,
  lodash,
  DownloadService
  ) {

  $http.get('appinfo.json').success(function(data){
    var project = data['project_id'];
    $http.get('http://api-dev.publixx.id/find/MagzApis/'+ project +'/2JKDLFCUER')
      .success(function(data, status, headers,config){
        $scope.maglists = _.map(data.results, function(thing) {
          thing.folderName = thing.zipFile.substring(thing.zipFile.lastIndexOf('/')+1).slice(0,-4);
          thing.progress = 0;
          return thing;
        });
        console.log($scope.maglists);
      })
      .error(function(data, status, headers,config){
        console.log('data error');
      })
      .then(function(result){
        // data = result.data.results[0];
        // $scope.folderName = data.zipFile.substring(data.zipFile.lastIndexOf('/')+1).slice(0,-4);
        // console.log(data.zipFile);
      });
  })

  $cordovaFile.checkDir(cordova.file.cacheDirectory, "contents/")
      .then(function (data) {
        alert(data);
      }, function (error) {
        // error
      });

  //Downloading File
  $scope.downloadContent = function (fn, zf){
    // DownloadService.createFolder(fn);

    var url = zf;
    var targetPath = cordova.file.cacheDirectory + "contents/" + fn + ".zip";
    var unzipPath = cordova.file.cacheDirectory + "contents/" + fn + "/";
    var trustHosts = true;
    var options = {};
    alert(targetPath);

    $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
      .then(function(result) {
        $cordovaZip.unzip(targetPath, unzipPath).then(function () {
          $scope.removeFile(fn);
          }, function () {
            console.log('error');
          }, function (progressEvent) {
            console.log(progressEvent);
          });
      }, function(err) {
        alert('error');
      }, function (progress) {
        $timeout(function () {
          progressBar = (progress.loaded / progress.total) * 100;
          document.getElementById(fn).value = progressBar;
          $scope.$apply(function() {
              $scope.maglists.progress = progressBar;
          });
        });
      });

  };

  //Removing File
  $scope.removeFile = function (fn) {
    $cordovaFile.removeFile(cordova.file.cacheDirectory + "contents/", fn + ".zip")
      .then(function (success) {
        alert('file removed');
      }, function (error) {
        alert('file not removed');
      });
  };


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
