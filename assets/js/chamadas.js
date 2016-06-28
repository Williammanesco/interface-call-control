angular.module('Chamadas', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/chamadas/:userId', {
        templateUrl: 'views/chamadas.html',
        controller: 'ChamadasController',
        controllerAs: 'Chamadas'
      })
      .when('/chamadas/grupos/add', {
        templateUrl: 'views/addGrupo.html',
        controller: 'AddGrupoController',
        controllerAs: 'Grupo'
      });
  }])
//  .service('ChamadasService', ChamadasService)
//  .service('UsuarioGruposService', UsuarioGruposService)
  .service('GruposService', GruposService)
  .controller('ChamadasController', ['$routeParams', 'GruposService',ChamadasController])
  .controller('AddGrupoController', ['GruposService', AddGrupoController]);

/*
function UsuarioGruposService($http){
  const BASE_URL = 'http://localhost:3000/api/usuario-grupo';

  this.find = function(userId){
    const request = {
      url: BASE_URL,
      method: 'GET',
      params: {
        id_usuario: userId
      }
    }
    return $http(request);
  }

}
*/

function GruposService($http){
  const BASE_URL = 'http://localhost:3000/api/grupos';

  this.find = function(userId){
    return $http.get(BASE_URL + '/?id_usuario='+userId);
  }

}

function ChamadasController($routeParams, GruposService){
  vm = this;
  vm.grupoSelecionado = '';

  $(document).ready(function(){
      $('.tooltipped').tooltip({delay: 50});
  });

  GruposService
  .find($routeParams.userId)
  .success(function(data){
    vm.grupos = Array();
    data.forEach(function(grupo){
      vm.grupos.push({ nome: grupo.nome,
                       _id: grupo._id
                     });
    });

  })
  .error(function(err){
    console.log(err);
  });

}

function AddGrupoController(GruposService){
  vm = this;

}
