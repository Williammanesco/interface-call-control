angular.module('Chamadas', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/chamadas', {
        templateUrl: 'views/chamadas.html',
        controller: 'ChamadasController',
        controllerAs: 'Chamadas'
      });
  }])
  //.service('UserService', UserService)
  .controller('ChamadasController', ChamadasController );
//  .controller('UsuarioLoginController', ['UserService', UsuarioLoginController]);

function ChamadasController(){
  vm = this;


}
