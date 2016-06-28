'use strict';


var app = angular.module('CallControl', [
  'ngRoute'
, 'ngMessages'
, 'Chamadas'
, 'User'
])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/', {
        redirectTo: '/usuario/login'
      })
      .otherwise({redirectTo: '/usuario/login'})
  }]);

/*
app.factory('UsuarioLogado', function(){
  return new UsuarioLogado();
});

function UsuarioLogado(){
  this.id = 0;
  this.logado = false;
}
*/
