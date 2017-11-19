// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var db = null;
var module = angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova'])

module.run(function($ionicPlatform, $cordovaSQLite) {
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
    db = window.openDatabase("barcodescanner4.db", "1.0", "barcodescanner4", 1);

    //creats database
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS item (id integer primary key, name text, description text, expiry_date text)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS scanned_item (id integer primary key, item_id string)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS app_admin (id integer primary key, user_name string, password string)");
    
    //inseart admin
    var query = "INSERT INTO app_admin (user_name, password) VALUES (?,?)";
    var admin_present_query = "SELECT app_admin.* FROM app_admin"
    $cordovaSQLite.execute(db, admin_present_query).then(function(result) {
      if (result.rows.length == 0) {
        $cordovaSQLite.execute(db, query, ["admin", "12345678"]).then(function(scannedresult) {
          alert("admin Added");
        });
      };
    });
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

  .state('app.test', {
    url: '/test',
    views: {
      'menuContent': {
        templateUrl: 'templates/test.html'
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

module.controller('AdminController', function($scope, $cordovaSQLite, $ionicPopup) {
  db = window.openDatabase("barcodescanner4.db", "1.0", "barcodescanner4", 1);
  var scope = $scope

  //select all items added my admin in admin view
  var query = "SELECT item.* FROM item"
  $scope.tasksArray = [];
  $cordovaSQLite.execute(db, query).then(function(result) {
    if (result.rows.length > 0) {
      for (var i = 0; i < result.rows.length; i++) {
        $scope.tasksArray.push({ id: result.rows.item(i).id, name: result.rows.item(i).name, description: result.rows.item(i).description, expiry_date: result.rows.item(i).expiry_date });
      }
    };
  });

  // When button is clicked, the popup will be shown for adding items
  $scope.showPopup = function() {
    $scope.data = {}
    // Custom popup
    var myPopup = $ionicPopup.show({
      template: ["Add Title", '<input type = "text" ng-model="data.model">', "Add Description", '<input type = "text" ng-model="data.model1" id="description">', '<input type="date" id="datetime">'],
      title: 'Add New Records',
      // subTitle: 'Subtitle',
      scope: $scope,
      buttons: [
        { text: 'Cancel' }, {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.model) {
              //don't allow the user to close unless he enters model...
              e.preventDefault();
            } else {
              return {title: $scope.data.model, description: document.getElementById('description').value, expiry_date: document.getElementById('datetime').value};
            }
          }
        }
      ]
    });
    myPopup.then(function(res) {
      var query = "INSERT INTO item (name, description, expiry_date) VALUES (?,?,?)";
      $cordovaSQLite.execute(db, query, [res.title, res.description, res.expiry_date]).then(function(result) {
        alert("record added");
        location.reload();
      });
      // location.reload();
      // console.log('Tapped!', res);
    });    
  };

  $scope.destroyRecord = function(item_id){
    var delete_query = "DELETE FROM item WHERE id = '"+item_id+"'";
    $cordovaSQLite.execute(db, delete_query, []).then(function(results) {
      alert("item with itemID: " + item_id + " is delete.")
      location.reload();
    }, function (err) {
        console.error(err);
    });
  };
})



module.controller("ExampleController", function($scope, $cordovaBarcodeScanner, $cordovaSQLite) {
  db = window.openDatabase("barcodescanner4.db", "1.0", "barcodescanner4", 1);
  var scope = $scope

  //scans the barcode and creats an scanned_item record for user
  $scope.scanBarcode = function() {
    $cordovaBarcodeScanner.scan().then(function(imageData) {
      alert(imageData.text);
      var query = "SELECT item.* FROM item WHERE id=?"
      $cordovaSQLite.execute(db, query, [imageData.text]).then(function(result) {
        if (result.rows.length > 0) {
          alert("Product Name -> " + result.rows.item(0).name + "\n\nDescription -> " + result.rows.item(0).description +  "\n\nExpiryDate -> " + result.rows.item(0).expiry_date);
          var query = "INSERT INTO scanned_item (item_id) VALUES (?)";
          $cordovaSQLite.execute(db, query, [result.rows.item(0).id]).then(function(scannedresult) {
            alert(scannedresult.insertId);
            location.reload();
          });
        }else{
          alert("Item not found in database.")
        }
      });
    }, function(error) {
      console.log("An error happened -> " + error);
    });
  };

  //fetch out scanned items and display it in the view
  var scanned_item_query = "SELECT scanned_item.* FROM scanned_item"
  var item_query = "SELECT item.* FROM item WHERE id=?"
  $scope.scannedItemArray = [];
  $cordovaSQLite.execute(db, scanned_item_query).then(function(result) {
    if (result.rows.length > 0) {
      for (var i = 0; i < result.rows.length; i++) {
        var scanned_item_id = result.rows.item(i).id
        $cordovaSQLite.execute(db, item_query, [result.rows.item(i).item_id]).then(function(item_result) {
          if (item_result.rows.length > 0) {
            for (var i = 0; i < item_result.rows.length; i++) {
              $scope.scannedItemArray.push({ id: item_result.rows.item(i).id ,name: item_result.rows.item(i).name, description: item_result.rows.item(i).description, expiry_date: item_result.rows.item(i).expiry_date, scanned_item_id: scanned_item_id });
            }
          };
        });
      }
    };
  });

  $scope.destroyScannedRecord = function(item_id){
    var delete_query = "DELETE FROM scanned_item WHERE id = '"+item_id+"'";
    $cordovaSQLite.execute(db, delete_query, []).then(function(results) {
      alert("item with itemID: " + item_id + " is delete.")
      location.reload();
    }, function (err) {
        console.error(err);
    });
  };

});
