angular.module('starter.controllers', ['ionic', 'ui.router', 'ngSanitize'])

  .controller('AppCtrl', function(
    $scope,
    $timeout,
    $http,
    $state,
    $window,
    $ionicPopup,
    appService,
    StorageService
  ) {
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

    $scope.clearCache = function(){
      var clearAllData = $ionicPopup.confirm({
        title: 'Clear Cache',
        template: '<center>Are you sure you want to remove all Storage Data?</center>'
      });
      clearAllData.then(function(res) {
        StorageService.clearCache;
      });
    };
  })

  .controller('SettingsCtrl', function($scope) {
    $scope.apps = "";
  })

  .controller('MaglistsCtrl', function(
    $scope,
    $ionicPlatform,
    $ionicLoading,
    $ionicPopup,
    $http,
    $cordovaProgress,
    $cordovaFile,
    $cordovaFileTransfer,
    $cordovaZip,
    $timeout,
    $location,
    $localStorage,
    $q,
    StorageService,
    lodash,
  ) {


    var spinner = '<ion-spinner icon="dots" class="spinner-stable"></ion-spinner><br/>';

    $ionicLoading.show({
      template: spinner + 'Loading Magazine...',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

    $timeout(function() {
      $http.get('appinfo.json').success(function(data) {
        var promiseDownload = [];
        var project = data['project_id'];
        $http.get('http://api-dev.publixx.id/find/MagzApis/' + project + '/2JKDLFCUER')
          .success(function(data, status, headers, config) {
            var maglists = _.map(data.results, function(thing, idx) {
              thing.progress = StorageService.cacheIssue(idx);
              thing.magazineId = thing.magazineId;
              thing.issueName = thing.issueName;
              console.log(idx);
              $http.get('http://api-dev.publixx.id/issue/' + thing.magazineId + '/MagzApis/')
                .success(function(data) {
                  $localStorage.content['issue-' + thing.magazineId] = data.results;
                  StorageService.cacheHtml(thing.magazineId,data.results);
                  $cordovaFile.writeFile(cordova.file.cacheDirectory, "magazine-" + thing.magazineId + ".json", data.results, true);
                  thing.totalPage = data.results.length;
                });
              var coverImage = thing.issueCover.substring(thing.issueCover.lastIndexOf('/') + 1);
              thing.coverPath = cordova.file.cacheDirectory + "contents/covers/" + coverImage;
              promiseDownload.push($cordovaFileTransfer.download(thing.issueCover, thing.coverPath, {}, true));
              thing.folderName = thing.zipFile.substring(thing.zipFile.lastIndexOf('/') + 1).slice(0, -4);
              thing.index = idx;
              return thing;
            });
            StorageService.saveList(maglists);
            $q.all(promiseDownload).finally(function(){
              $scope.maglists = StorageService.getList();
            });
          })
          .error(function(data, status, headers, config) {
            $scope.maglists = StorageService.getList();
          })
      });

      $ionicLoading.hide();
    }, 2000);
    // var test = StorageService.getIssue(1);
    // console.log(test[0][0]);

    $scope.downloadContent = function(fn, zf, idx, iName) {

      var url = zf;
      var targetPath = cordova.file.cacheDirectory + "contents/" + fn + ".zip";
      var unzipPath = cordova.file.cacheDirectory + "contents/" + fn + "/";
      var jsonPath = unzipPath + "data_json.json";
      var trustHosts = true;
      var options = {};

      var confirmPopup = $ionicPopup.confirm({
        title: 'Download Offline',
        template: '<center>Are you sure you want to download ' + iName + '?</center>'
      });

      confirmPopup.then(function(res) {
        if (res) {
          $scope.$watch('maglists[' + idx + '].progress', function() {});
          $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
            .then(function(result) {
              $cordovaZip.unzip(targetPath, unzipPath).then(function() {
                $http.get(jsonPath).success(function(data) {
                  var imageDownload = 50 / data.length;
                  data.forEach(function(i, x) {
                    var imageName = unzipPath + i.substring(i.lastIndexOf('/') + 1);
                    $cordovaFileTransfer.download(i, imageName, options, trustHosts);
                    $scope.maglists[idx].progress += imageDownload;
                    document.getElementById(fn).value += imageDownload;
                    StorageService.addMagazine(idx);
                  });
                });
              });

              $scope.removeFile(fn);
            }, function(err) {
                 var alertPopup = $ionicPopup.alert({
                   title: 'Download Failed',
                   template: '<center>Please connect through the Internet to Download this Issue</center>'
                 });
                 alertPopup.then(function(res) {
                   console.log('Download Failed');
                 });
            }, function(progress) {
              progressBar = (progress.loaded / progress.total) * 50;
              document.getElementById(fn).value = progressBar;
              $scope.maglists[idx].progress = progressBar;
            });

        }
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

    //In App Purchase

    // var productIds = ['com.publixx.magazineapp.5']; // <- Add your product Ids here
    //
    // $scope.loadProducts = function() {
    //   $ionicLoading.show({
    //     template: spinner + 'Loading Products...'
    //   });
    //   inAppPurchase
    //     .getProducts(productIds)
    //     .then(function(products) {
    //       $ionicLoading.hide();
    //       $scope.products = products;
    //       // returnnya productId,title,price
    //     })
    //     .catch(function(err) {
    //       $ionicLoading.hide();
    //       console.log(err);
    //     });
    // };
    //
    // $scope.buy = function(productId) {
    //
    //   $ionicLoading.show({
    //     template: spinner + 'Purchasing...'
    //   });
    //   inAppPurchase
    //     .buy(productId)
    //     .then(function(data) {
    //       console.log(JSON.stringify(data));
    //       console.log('consuming transactionId: ' + data.transactionId);
    //       return inAppPurchase.consume(data.type, data.receipt, data.signature);
    //     })
    //     .then(function() {
    //       var alertPopup = $ionicPopup.alert({
    //         title: 'Purchase was successful!',
    //         template: 'Check your console log for the transaction data'
    //       });
    //       console.log('consume done!');
    //       $ionicLoading.hide();
    //     })
    //     .catch(function(err) {
    //       $ionicLoading.hide();
    //       console.log(err);
    //       $ionicPopup.alert({
    //         title: 'Something went wrong',
    //         template: 'Check your console log for the error details'
    //       });
    //     });
    //
    // };
    //
    // $scope.restore = function() {
    //   $ionicLoading.show({
    //     template: spinner + 'Restoring Purchases...'
    //   });
    //   inAppPurchase
    //     .restorePurchases()
    //     .then(function(purchases) {
    //       $ionicLoading.hide();
    //       console.log(JSON.stringify(purchases));
    //       $ionicPopup.alert({
    //         title: 'Restore was successful!',
    //         template: 'Check your console log for the restored purchases data'
    //       });
    //     })
    //     .catch(function(err) {
    //       $ionicLoading.hide();
    //       console.log(err);
    //       $ionicPopup.alert({
    //         title: 'Something went wrong',
    //         template: 'Check your console log for the error details'
    //       });
    //     });
    // };


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
    $cordovaFile,
    StorageService,
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
    var localAssets = cordova.file.cacheDirectory + "contents/" + $scope.folderName + "/";

    $http.get(cordova.file.cacheDirectory + "magazine-" + $scope.id + ".json")
      .success(function(data) {
        $scope.pages = _.map(data, function(thing) {
          var newHTML = thing.pageContent.replace(/https:\/\/s3-ap-southeast-1.amazonaws.com\/publixx-statics\/images-lib\//g, localAssets);
          thing.pageContent = newHTML;
          return thing;
        });
      })
      .error(function(data) {
        alert('data error');
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
