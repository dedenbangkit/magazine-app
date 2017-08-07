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

    $scope.maglists = [];
    $scope.$watch('maglists', function() {});

    $scope.doRefresh = function(){
      $timeout(function () {
        $scope.loadAll();
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.loadAll = function(){
    $timeout(function() {
      $http.get('appinfo.json').success(function(data) {
        var promiseDownload = [];
        var project = data['project_id'];
        $http.get('http://api-dev.publixx.id/find/MagzApis/' + project + '/2JKDLFCUER')
          .success(function(data, status, headers, config) {
            var maglists = _.map(data.results, function(thing, idx) {
              thing.folderName = thing.zipFile.substring(thing.zipFile.lastIndexOf('/') + 1).slice(0, -4);
              thing.progress = StorageService.cacheIssue(thing.folderName);
              thing.magazineId = thing.magazineId;
              thing.issueName = thing.issueName;
              thing.issueRegex = thing.issueName.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
              $http.get('http://api-dev.publixx.id/issue/' + thing.magazineId + '/MagzApis/')
                .success(function(data) {
                  $localStorage.content['issue-' + thing.magazineId] = data.results;
                  StorageService.cacheHtml(thing.magazineId,data.results);
                  $cordovaFile.writeFile(cordova.file.cacheDirectory, thing.magazineId.toString() + ".json", data.results, true)
                  .then(function(success){
                    console.log("sip")
                  },function(error){
                    console.log("failed")
                  });
                  thing.totalPage = data.results.length;
                });
              var coverImage = thing.issueCover.substring(thing.issueCover.lastIndexOf('/') + 1);
              thing.coverPath = cordova.file.cacheDirectory + "contents/covers/" + coverImage;
              promiseDownload.push($cordovaFileTransfer.download(thing.issueCover, thing.coverPath, {}, true));
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
    }, 1000);
    };

    $scope.loadAll();

    // var test = StorageService.getIssue(1);
    // console.log(test[0][0]);

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

  .controller('MaglistsViewCtrl',function(
    $scope,
    $ionicPlatform,
    $ionicLoading,
    $ionicPopup,
    $http,
    $stateParams,
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
  ){
    $scope.theList = StorageService.getIndex($stateParams.issueIdx);

    $scope.maglists = [];
    $scope.$watch('maglists', function() {});

    $scope.maglists.push($scope.theList);
    var issueInfo = StorageService.getInfo($stateParams.issueIdx);
    $scope.issueName = issueInfo;
    $scope.downloadContent = function(fn, zf, ids, iName, idx) {

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
              var promiseDownload = [];
              $cordovaZip.unzip(targetPath, unzipPath).then(function() {
                $http.get(jsonPath).success(function(data) {
                  var imageDownload = 50 / data.length;
                  data.forEach(function(i, x) {
                    var imageName = unzipPath + i.substring(i.lastIndexOf('/') + 1);
                    promiseDownload.push($cordovaFileTransfer.download(i, imageName, options, trustHosts));
                    $scope.maglists[idx].progress += imageDownload;
                    document.getElementById(fn).value += imageDownload;
                  });
                });
              });
              $q.all(promiseDownload).finally(function(){
                StorageService.addMagazine(fn);
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

  })

  //Downloaded Only
  .controller('MaglistsDownloadedCtrl', function(
    $scope,
    $ionicPlatform,
    $localStorage,
    StorageService,
  ) {
    $scope.maglists = [];
    $scope.$watch('maglists', function() {});
    $scope.maglists = StorageService.getList();
  })

  //Read Page Online
  .controller('OnlineCtrl', function(
    $scope,
    $ionicNavBarDelegate,
    $ionicTabsDelegate,
    $ionicPopover,
    $ionicModal,
    $cordovaInAppBrowser,
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
    $scope.issueIdx = $stateParams.issueIdx;
    $scope.folderName = $stateParams.folderName;
    var issueInfo = StorageService.getInfo($scope.issueIdx);
    $scope.issueName = issueInfo;

    $http.get('http://api-dev.publixx.id/issue/' + $scope.id + '/MagzApis/')
      .success(function(data, status, headers, config) {
        $scope.pages = data.results;
      })
      .error(function(data, status, headers, config) {
        console.log('data error');
      });

      $ionicModal.fromTemplateUrl('templates/modal.html', {
        scope: $scope,
        animation: 'jelly'
      }).then(function(modal) {
        $scope.modal = modal;
      });

      $scope.imgUrl = "http://placekitten.com/g/500/800";

      $scope.openModal = function(url) {
        $scope.modal.show();
        $scope.$watch('imgUrl', function() {});
        $scope.imgUrl = url;
      };

      $scope.options = {
        noSwiping: true,
        noSwipingClass: 'do_not_swipe',
        watchSlidesVisibility: true,
        pagination: false,
      };

      $ionicSideMenuDelegate.canDragContent(false)

      //OpenLink
      var browserOptions = {
        location: 'no',
        clearcache: 'no',
        toolbar: 'yes'
      };
      $scope.openWindow = function(link_url) {
        $cordovaInAppBrowser.open(link_url, '_blank', browserOptions);
      };

      //Hide Nav bar
      $scope.hideNavi = function(){
        $ionicNavBarDelegate.showBar(false);
        $ionicTabsDelegate.showBar(false);
      };
      $scope.showNavi = function(){
        $ionicNavBarDelegate.showBar(true);
        $ionicTabsDelegate.showBar(true);
      }

      //Slider Delegate

      $scope.data = {};
      $scope.data.currentPage = 0;

      var setupSlider = function() {
        //some options to pass to our slider

        //create delegate reference to link with slider
        $scope.data.sliderDelegate = null;

        //watch our sliderDelegate reference, and use it when it becomes available
        $scope.$watch('data.sliderDelegate', function(newVal, oldVal) {
          if (newVal != null) {
            $scope.data.sliderDelegate.on('slideChangeEnd', function() {
              $scope.data.currentPage = $scope.data.sliderDelegate.activeIndex;
              //use $scope.$apply() to refresh any content external to the slider
              $scope.$apply();
            });
          }
        });
      };

      setupSlider();

      //Popover delegate
      $ionicPopover.fromTemplateUrl('templates/popover.html', {
      scope: $scope,
      }).then(function(popover) {
        $scope.popover = popover;
      });

      $scope.openPopover = function() {
      $scope.popover.show();
      };
      $scope.closePopover = function() {
        $scope.popover.hide();
      };
      //Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.popover.remove();
      });
      // Execute action on hidden popover
      $scope.$on('popover.hidden', function() {
        // Execute action
      });
      // Execute action on remove popover
      $scope.$on('popover.removed', function() {
        // Execute action
      });

  })

  //Read Page Onffine
  .controller('OfflineCtrl', function(
    $scope,
    $http,
    $ionicNavBarDelegate,
    $ionicTabsDelegate,
    $ionicPopover,
    $ionicModal,
    $cordovaInAppBrowser,
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
    $scope.issueIdx = $stateParams.issueIdx;
    $scope.folderName = $stateParams.folderName;
    var issueInfo = StorageService.getInfo($scope.issueIdx);
    $scope.issueName = issueInfo;

    var localAssets = cordova.file.cacheDirectory + "contents/" + $scope.folderName + "/";
    // var storedHTML = $localStorage.content['issue-' + $scope.id];
    var htmlObj = StorageService.getHtml($scope.id);
    $scope.pages = _.map(htmlObj, function(thing) {
      var newHTML = thing.pageContent.replace(/https:\/\/s3-ap-southeast-1.amazonaws.com\/publixx-statics\/images-lib\//g, localAssets);
      thing.pageContent = newHTML;
      return thing;
    });

    $ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope,
      animation: 'jelly'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.imgUrl = "http://placekitten.com/g/500/800";

    $scope.openModal = function(url) {
      $scope.modal.show();
      $scope.$watch('imgUrl', function() {});
      $scope.imgUrl = url;
    };

    $scope.options = {
      noSwiping: true,
      noSwipingClass: 'do_not_swipe',
      watchSlidesVisibility: true,
      pagination: false,
    };

    $ionicSideMenuDelegate.canDragContent(false)

    //OpenLink
    var browserOptions = {
      location: 'no',
      clearcache: 'no',
      toolbar: 'yes'
    };
    $scope.openWindow = function(link_url) {
      $cordovaInAppBrowser.open(link_url, '_blank', browserOptions);
    };

    //Hide Nav bar
    $scope.hideNavi = function(){
      $ionicNavBarDelegate.showBar(false);
      $ionicTabsDelegate.showBar(false);
    };
    $scope.showNavi = function(){
      $ionicNavBarDelegate.showBar(true);
      $ionicTabsDelegate.showBar(true);
    }

    //Slider Delegate

    $scope.data = {};
    $scope.data.currentPage = 0;

    var setupSlider = function() {
      //some options to pass to our slider

      //create delegate reference to link with slider
      $scope.data.sliderDelegate = null;

      //watch our sliderDelegate reference, and use it when it becomes available
      $scope.$watch('data.sliderDelegate', function(newVal, oldVal) {
        if (newVal != null) {
          $scope.data.sliderDelegate.on('slideChangeEnd', function() {
            $scope.data.currentPage = $scope.data.sliderDelegate.activeIndex;
            //use $scope.$apply() to refresh any content external to the slider
            $scope.$apply();
          });
        }
      });
    };

    setupSlider();

    //Popover delegate
    $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope,
    }).then(function(popover) {
      $scope.popover = popover;
    });

    $scope.openPopover = function() {
    $scope.popover.show();
    };
    $scope.closePopover = function() {
      $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.popover.remove();
    });
    // Execute action on hidden popover
    $scope.$on('popover.hidden', function() {
      // Execute action
    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function() {
      // Execute action
    });

  })

  //directive
.directive('compile', ['$compile', function ($compile) {
    return function(scope, element, attrs) {
      scope.$watch(
        function(scope) {
          return scope.$eval(attrs.compile);
        },
        function(value) {
          element.html(value);
          $compile(element.contents())(scope);
        }
    );
  };
}]);
