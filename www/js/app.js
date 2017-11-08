// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var db = null;
var module = angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    db = window.openDatabase("Project.db", "1.0", "Project", 1);
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS item (id integer primary key, name text, description text, expiry_date date)");
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    })
    .state('app.playlists', {
      url: '/playlists',
      views: {
        'menuContent': {
          templateUrl: 'templates/playlists.html',
          controller: 'PlaylistsCtrl'
        }
      }
    })

  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/browse');
});

module.controller("ExampleController", function($scope, $cordovaBarcodeScanner, $cordovaSQLite) {
  var scope = $scope
  // $scope.getData = function(id) {
  //   var query = "SELECT name, description FROM item WHERE id = ?";
  //   var run = $cordovaSQLite.execute(db, query, [id]).then(function(result) {
  //     if(result.rows.length > 0) {
  //       alert("SELECTED -> " + result.rows.item(0).name);
  //     } else {
  //       alert("No results found");
  //     }
  //   }, function (error) {
  //       console.error(error);
  //   });
  // };

  $scope.scanBarcode = function() {
    $cordovaBarcodeScanner.scan().then(function(imageData) {
      alert(imageData.text);
      // var query = "INSERT INTO item (name, description) VALUES (?,?)";
      // $cordovaSQLite.execute(db, query, [imageData.text, imageData.text]).then(function(result) {
      //   scope.getData(result.insertId);
      // }, function (err) {
      //   alert("something went wrong");
      //   alert(err);
      // });
    }, function(error) {
      console.log("An error happened -> " + error);
    });
  };
});
