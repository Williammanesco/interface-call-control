angular.module('Chamadas', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/chamadas/:userId', {
        templateUrl: 'views/chamadas.html',
        controller: 'ChamadasController',
        controllerAs: 'Chamadas'
      });
  }])
//  .service('ChamadasService', ChamadasService)
//  .service('UsuarioGruposService', UsuarioGruposService)
  .service('GruposService', GruposService)
  .controller('ChamadasController', ['$routeParams', 'GruposService',ChamadasController]);

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
  vm.clicouAddGrupo = false;

  console.log('$routeParams', $routeParams);

  GruposService
  .find($routeParams.userId)
  .success(function(data){
    vm.grupos = Array();
    data.forEach(function(grupo){
      vm.grupos.push({ selecionado: false,
                       nome: grupo.nome,
                       _id: grupo._id
                     });
    });

  })
  .error(function(err){
    console.log(err);
  });

  vm.clickAddGrupo = clickAddGrupo;
  function clickAddGrupo(){
    vm.clicouAddGrupo = true;
  }




  //vm.logado = UsuarioLogadoFactory.logado;
  //document.getElementById('principal').style.display = 'none';

}
