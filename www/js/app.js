// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova', 'ngStorage', 'ngLodash'])
.run(function($rootScope,
  $cordovaFile,
  $ionicPlatform,
  $cordovaNetwork,
  $cordovaZip,
  $cordovaBatteryStatus,
  $cordovaLocalNotification,
  $cordovaPush,
  $cordovaFileTransfer,
  $cordovaProgress,
  $timeout) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleBlackOpaque();
    }

    $rootScope.downloadDir = cordova.file.dataDirectory;
    // // create Directory
    //
    // $cordovaFile.createDir(cordova.file.dataDirectory, "content", false)
    //   .then(function (success) {
    //     alert('magazine folder created');
    //   }, function (error) {
    //     alert('folder created');
    //   });
    //
    // // File Transfer
    //
    // var url = "http://cdn.wall-pix.net/albums/art-space/00030109.jpg";
    // var targetPath = cordova.file.dataDirectory + "/content/testImage.png";
    // var trustHosts = true;
    // var options = {};
    //
    // $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
    //   .then(function(result) {
    //     alert('file downloaded');
    //   }, function(err) {
    //     alert('file error');
    //   }, function (progress) {
    //     $timeout(function () {
    //       $rootScope.downloadProgress = (progress.loaded / progress.total) * 100;
    //     });
    //   });

  });

})


//Aplication Service Info

.factory('appService', function($http, $rootScope) {
  var appService = {
    async: function() {
      var promise = $http.get('appinfo.json').then(function (response) {
        $rootScope.applicationsData = response.data;
        return response.data;
      });
      return promise;
    }
  };
  return appService;
})

//Local Storage Service

.factory ('StorageService', function ($localStorage) {
$localStorage = $localStorage.$default({
  things: [],
  status: '0'
});
var _getStatus = function() {
  return $localStorage.status;
};

var _changeStatus = function(thing) {
  $localStorage.status = thing;
  return $localStorage.status;
}

var _getAll = function () {
  return $localStorage.things;
}
var _add = function (thing) {
  $localStorage.things.push(thing);
}
var _remove = function (thing) {
  $localStorage.things.splice($localStorage.things.indexOf(thing), 1);
}
return {
    changeStatus: _changeStatus,
    getStatus: _getStatus,
    getAll: _getAll,
    add: _add,
    remove: _remove
  };
})

//Download factory
.factory('DownloadService', function($cordovaFile, $cordovaFileTransfer, $timeout) {
  var DownloadService = {
    createFolder: function(fn, zf) {
      var folder = $cordovaFile.createDir(cordova.file.cacheDirectory, fn, false)
          .then(function (success) {
            alert('folder' + fn + 'created');
          }, function (error) {
            alert('folder error')
          });
      return folder;
    },
  }
  return DownloadService;
})

//View and Controller Config

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.maglists', {
    url: '/maglists',
    views: {
      'menuContent': {
        templateUrl: 'templates/maglists.html',
        controller: 'MaglistsCtrl'
      }
    }
  })

  .state('app.single', {
    url: '/maglists/:id/:title',
    views: {
      'menuContent': {
        templateUrl: 'templates/maglist.html',
        controller: 'MaglistCtrl'
      }
    }
  })

  .state('app.account', {
    url: '/account',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-account.html'
      }
    }
  })

  .state('app.settings', {
    url: '/settings',
    views: {
      'menuContent': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('app.general', {
    url: '/general',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-general.html'
      }
    }
  })

  .state('app.about', {
    url: '/about',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-about.html'
      }
    }
  });


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/maglists');
});
