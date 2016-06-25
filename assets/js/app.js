'use strict';

angular.module('BeMEAN', [
  'ngRoute'
, 'User'
, 'ngMessages'
])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    // $locationProvider.html5Mode(true);
    $routeProvider
      .when('/', {
        redirectTo: '/usuario-login'
      })
      .otherwise({redirectTo: '/'});
  }])
