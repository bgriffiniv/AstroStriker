// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module("starter", ["ionic", "firebase"])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.factory("Items", function($firebaseArray) {
  var itemsRef = new Firebase('https://popping-heat-7322.firebaseio.com/items');
  return $firebaseArray(itemsRef);
})

.factory("Auth", function($firebaseAuth) {
  var authRef = new Firebase('https://popping-heat-7322.firebaseio.com/');
  return $firebaseAuth(authRef);
})

.factory("Users", function($firebaseArray) {
  var usersRef = new Firebase('https://popping-heat-7322.firebaseio.com/users');
  return $firebaseArray(usersRef);
})


.controller("ListCtrl", function($scope, Auth, Users, Items) {

  $scope.users = Users;
  $scope.items = Items;
  $scope.authType = {
    facebook : "facebook",
    google : "google",
    twitter : "twitter",
    password : "password"
  };
  
  $scope.user = {};
  
  $scope.addItem = function() {
    var name = prompt("What do you need to buy?");
    if (name) {
      $scope.items.$ref().child(name).set(true);
    }
  };
  
  $scope.removeItem = function(item) {
    $scope.items.$remove(item);
  };

  $scope.login = function(provider) {
    if (provider === $scope.authType.password) {
      // Try to create user
      // for some reason, we lose $scope.user here, so use a local variable
      var user = $scope.user;
      Auth.$createUser(user).then(function(userData){
        // Try to login
        Auth.$authWithPassword(user).catch(function(error) {
          // Some error logging in
          console.log(error);
        });
        $scope.users.$ref().child(userData.uid).set({email:user.email});
      }).catch(function(error) {
        // Maybe the user already exists...that's fine
        console.log(error);
        // Try to login
        Auth.$authWithPassword($scope.user).catch(function(error) {
          // Some error logging in
          console.log(error);
        });
      });
      
    } else {
      Auth.$authWithOAuthRedirect(provider).catch(function(error) {
          console.log(error);
          if (error.code === 'TRANSPORT_UNAVAILABLE') {
            Auth.$authWithOAuthPopup(provider).catch(function(error) {
              console.log(error);
            });
          }
      });
    }
  };
  
  $scope.logout = function() {
    Auth.$unauth();
    $scope.authData = null;
    $scope.displayName = null;
    $scope.profileImage = null;
  };
    
  Auth.$onAuth(function(authData) {
    if (authData === null) {
      console.log("User is logged out");
    } else {
      if (authData.password) {
        $scope.displayName = authData[authData.provider].email;
      } else {
        $scope.displayName = authData[authData.provider].displayName;
      }
      $scope.profileImg = authData[authData.provider].profileImageURL;
      console.log("User is logged in as " + $scope.displayName + "(" + authData.uid + ") with " + authData.provider);
    }
    $scope.authData = authData; // This will display the user's name in our view
  });
});

