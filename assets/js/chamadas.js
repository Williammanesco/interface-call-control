angular.module('Chamadas', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/chamadas/:userId', {
        templateUrl: 'views/chamadas.html',
        controller: 'ChamadasController',
        controllerAs: 'Chamadas'
      })
      .when('/chamadas/grupos/add/:userId', {
        templateUrl: 'views/addGrupo.html',
        controller: 'AddGrupoController',
        controllerAs: 'Grupo'
      });
  }])
  .service('UsuariosGrupoService', UsuariosGrupoService)
  .service('GruposService', GruposService)
  .controller('ChamadasController', ['$routeParams', 'GruposService', ChamadasController])
  .controller('AddGrupoController', ['$routeParams', 'GruposService', 'UsuariosGrupoService', AddGrupoController]);


function UsuariosGrupoService($http){
  const BASE_URL = 'http://localhost:3000/api/usuario-grupo';

  this.create = function(users){
    const request = {
      url: BASE_URL,
      method: 'POST',
      data: users
    }
    return $http(request);
  }

}

function GruposService($http){
  const BASE_URL = 'http://localhost:3000/api/grupos';

  this.find = function(userId){
    return $http.get(BASE_URL + '/?id_usuario='+userId);
  }

  this.create = function(nome, userId) {
    const request = {
      url: BASE_URL,
      method: 'POST',
      data: { nome: nome, id_usuario: userId }
    }
    //console.log('http', user);
    return $http(request);
  }

}

function ChamadasController($routeParams, GruposService){
  vm = this;
  vm.grupoSelecionado = '';
  vm.userId = $routeParams.userId

  GruposService
  .find(vm.userId)
  .success(function(data){
    vm.grupos = Array();
    data.forEach(function(el){
      vm.grupos.push({ nome: el.nome,
                       _id: el._id
                     });
    });

  })
  .error(function(err){
    console.log(err);
  });

}

function AddGrupoController($routeParams, GruposService, UsuariosGrupoService){
  vm = this;

  var maskBehavior = function (val) {
   return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009';
  },
  options = {onKeyPress: function(val, e, field, options) {
   field.mask(maskBehavior.apply({}, arguments), options);
   }
  };

  $('.phone').mask(maskBehavior, options);

  vm.usuarios = Array();
  vm.FormUsuarios = {
    nome: '',
    telefone: ''
  }

  vm.addUsuario = addUsuario;

  function addUsuario(user){
    vm.usuarios.push({
      nome: user.nome,
      telefone: user.telefone
    });

    user.nome = '';
    user.telefone = '';
  }

  vm.confimarGrupo = confimarGrupo;
  function confimarGrupo(grupo){

    GruposService
    .create(grupo.nomeGrupo, $routeParams.userId)
    .success(function(data){
      var usuariosAdd = Array();
      var idGrupoInserido = data._id;

      vm.usuarios.forEach(function(el){
        var usuario = {
          id_grupo: idGrupoInserido,
          nome_usuario: el.nome,
          telefone_usuario: el.telefone
        };

        usuariosAdd.push(usuario);
      });

      UsuariosGrupoService
      .create(usuariosAdd)
      .success(function(data){
        window.location.href = "#/chamadas/" + $routeParams.userId;
      })
      .error(function(err){
        console.log('err',err);
      });

    })
    .error(function(err){
      console.log('err grupo', err)
    });

  }
}
