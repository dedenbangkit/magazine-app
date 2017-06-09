angular.module('starter.controllers', ['ionic','ui.router', 'ngSanitize'])

  .controller('AppCtrl', function($scope, $timeout, $http, $state, $window, appService, StorageService) {
    // ApplicationData
    appService.async().then(function(response) {
      $scope.company = response;
    });

    $http.get('appinfo.json')
      .success(function(data, status, headers, config) {
        $scope.company = data; // for UI
      })
      .error(function(data, status, headers, config) {
        console.log('data error');
      })
      .then(function(result) {
        things = result.data;
      });

    $scope.changeStatus = function(active, user) {
      $scope.isLogged = active;
      $scope.user = user;
      console.log($scope.isLogged);
    };

    // Form data for the login
    $scope.isLogged = parseInt(StorageService.getStatus());
    $scope.$watch('isLogged', function() {});
    console.log($scope.isLogged);
    $scope.loginData = {};
    userLog = StorageService.getUser();
    $scope.user = userLog[0];
    $scope.$watch('user', function() {});
    console.log(StorageService.getUser());

    // Perform the login action
    $scope.doLogin = function() {
      StorageService.authUser({
        'username': $scope.loginData.username,
        'password': $scope.loginData.password
      });
      StorageService.changeStatus('1');
      $scope.changeStatus('1', {
        'username': $scope.loginData.username,
        'password': $scope.loginData.password
      });
      // $window.location.reload(true);
      // $state.go('app.settings');
    };
  })

  .controller('SettingsCtrl', function($scope) {
    $scope.apps = "";
  })

  .controller('MaglistsCtrl', function(
    $scope,
    $http,
    $cordovaProgress,
    $cordovaFile,
    $cordovaFileTransfer,
    $cordovaZip,
    $timeout,
    $location,
    $localStorage,
    StorageService,
    lodash
  ) {
    $http.get('appinfo.json').success(function(data) {
      var project = data['project_id'];
      $http.get('http://api-dev.publixx.id/find/MagzApis/' + project + '/2JKDLFCUER')
        .success(function(data, status, headers, config) {
          var maglists = _.map(data.results, function(thing, idx) {
            thing.progress = StorageService.cacheIssue(idx);
            console.log(thing.progress);
            $http.get('http://api-dev.publixx.id/issue/' + thing.magazineId + '/MagzApis/')
              .success(function(data) {
                $localStorage.content['issue-' + thing.magazineId] = data.results;
                thing.totalPage = data.results.length;
              });
            thing.folderName = thing.zipFile.substring(thing.zipFile.lastIndexOf('/') + 1).slice(0, -4);
            thing.index = idx;
            return thing;
          });
          $scope.maglists = maglists;
          console.log($scope.maglists);
        })
        .error(function(data, status, headers, config) {
          console.log('data error');
        })
        .then(function(result) {
          // data = result.data.results[0];
          // $scope.folderName = data.zipFile.substring(data.zipFile.lastIndexOf('/')+1).slice(0,-4);
          // console.log(data.zipFile);
        });
    });
    // var test = StorageService.getIssue(1);
    // console.log(test[0][0]);

    $scope.downloadContent = function(fn, zf, idx) {

      var url = zf;
      var targetPath = cordova.file.cacheDirectory + "contents/" + fn + ".zip";
      var unzipPath = cordova.file.cacheDirectory + "contents/" + fn + "/";
      var jsonPath = unzipPath + "data_json.json";
      var trustHosts = true;
      var options = {};

      $scope.$watch('maglists[' + idx + '].progress', function() {});
      $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
        .then(function(result) {
          $cordovaZip.unzip(targetPath, unzipPath).then(function(){
            $http.get(jsonPath).success(function(data) {
              var imageDownload = 50 / data.length;
              data.forEach(function(i, x) {
                var imageName = unzipPath + i.substring(i.lastIndexOf('/') + 1);
                $cordovaFileTransfer.download(i, imageName, options, trustHosts);
                $scope.maglists[idx].progress += imageDownload;
                document.getElementById(fn).value += imageDownload;
                //save cache
                StorageService.addMagazine(idx);
              });
            });
          });

          $scope.removeFile(fn);
        }, function(err) {
          alert('download failed');
        }, function(progress) {
          progressBar = (progress.loaded / progress.total) * 50;
          document.getElementById(fn).value = progressBar;
          $scope.maglists[idx].progress = progressBar;
        });
    };

    //Removing File
    $scope.removeFile = function(fn) {
      $cordovaFile.removeFile(cordova.file.cacheDirectory + "contents/", fn + ".zip")
        .then(function(success) {
          document.getElementById('btn-' + fn).remove();
        }, function(error) {
          alert('file not removed');
        });
    };


  })

  //Read Page Online
  .controller('OnlineCtrl', function(
    $scope,
    $http,
    $stateParams,
    $ionicSideMenuDelegate,
    $ionicScrollDelegate,
    $timeout,
    $ionicModal,
    $cordovaFile
  ) {
    $scope.details = [];
    $scope.id = $stateParams.magazineId;
    $scope.issueName = $stateParams.issueName;
    $scope.folderName = $stateParams.folderName;

    $http.get('http://api-dev.publixx.id/issue/' + $scope.id + '/MagzApis/')
      .success(function(data, status, headers, config) {
        $scope.pages = data.results;
      })
      .error(function(data, status, headers, config) {
        console.log('data error');
      })

    $scope.options = {
      noSwiping: true,
      noSwipingClass: 'do_not_swipe',
      watchSlidesVisibility: true,
      pagination: false,
    };

    $ionicSideMenuDelegate.canDragContent(false)
    $ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope,
      animation: 'jelly'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show()
      $scope.imgUrl = "http://placekitten.com/g/500/800";
    }

  })

  //Read Page Online
  .controller('OfflineCtrl', function(
    $scope,
    $http,
    $stateParams,
    $ionicSideMenuDelegate,
    $ionicScrollDelegate,
    $timeout,
    $ionicModal,
    $cordovaFile,
    $localStorage,
    StorageService,
    lodash
  ) {
    $scope.details = [];
    $scope.id = $stateParams.magazineId;
    $scope.issueName = $stateParams.issueName;
    $scope.folderName = $stateParams.folderName;

    var olHTML = $localStorage.content['issue-' + $stateParams.magazineId];
    var localAssets = cordova.file.cacheDirectory + "contents/" + $scope.folderName + "/";
    $scope.pages = _.map(olHTML, function(thing) {
      var newHTML = thing.pageContent.replace(/https:\/\/s3-ap-southeast-1.amazonaws.com\/publixx-statics\/images-lib\//g, localAssets);
      thing.pageContent = newHTML;
      return thing;
    });

    $scope.options = {
      noSwiping: true,
      noSwipingClass: 'do_not_swipe',
      watchSlidesVisibility: true,
      pagination: false,
    };

    $ionicSideMenuDelegate.canDragContent(false)
    $ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope,
      animation: 'jelly'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show()
      $scope.imgUrl = "http://placekitten.com/g/500/800";
    }

  })
