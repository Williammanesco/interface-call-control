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
  .service('ChamadasService', ChamadasService)
  .controller('ChamadasController', ['$interval', '$routeParams', 'GruposService', 'UsuariosGrupoService', 'ChamadasService', ChamadasController])
  .controller('AddGrupoController', ['$routeParams', 'GruposService', 'UsuariosGrupoService', AddGrupoController]);


function ChamadasService($http){
  const BASE_URL_RECEBIDAS = 'http://localhost:3000/api/chamadas-recebidas';
  const BASE_URL_REALIZADAS = 'http://localhost:3000/api/chamadas-realizadas';

  this.findRecebidas = function(idGrupo){
    return $http.get(BASE_URL_RECEBIDAS + '/?id_grupo='+idGrupo);
  }

  this.findRealizadas = function(idGrupo){
    return $http.get(BASE_URL_REALIZADAS + '/?id_grupo='+idGrupo);
  }

}

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

  this.remove = function(grupoId) {
    return $http.delete(BASE_URL + '/?id_grupo='+grupoId);
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

  this.remove = function(grupoId) {
    return $http.delete(BASE_URL + '/?_id=' + grupoId);
  }

}

function ChamadasController($interval, $routeParams, GruposService, UsuariosGrupoService, ChamadasService){
  vm = this;
  vm.grupoSelecionado = '';
  vm.userId = $routeParams.userId;
  vm.checkRealizadas = true;
  vm.checkRecebidas = true;
  vm.chamadas = Array();
  vm.ultConsRealizadas = Array();
  vm.ultConsRecebidas = Array();
  vm.paginaAtual = 1;
  vm.paginaChamadas = Array();
  vm.processando = false;

  vm.selecionaPagina = function(page){
    vm.paginaAtual = page;
    paginar(vm);
  }

  vm.avancaPagina = function(){
    vm.paginaAtual++;
    paginar(vm);
  }

  vm.voltaPagina = function(){
    vm.paginaAtual--;
    paginar(vm);
  }

  vm.filter = function (){
    var tipo = '';
    var obj = {}

    if(vm.checkRecebidas && vm.checkRealizadas){
      obj.tipo = ''
    } else if(!vm.checkRecebidas && !vm.checkRealizadas) {
      obj.tipo = 'NENHUMA'
    }
    else {
      if(vm.checkRecebidas)
        obj.tipo = 'RECEBIDA';
      else if(vm.checkRealizadas)
        obj.tipo = 'REALIZADA';
    }

    return obj
  }

  vm.ordenar = function(keyname){
    vm.sortKey = keyname;
    vm.reverse = vm.reverse;
  };

  carregaGruposCadastrados(GruposService, vm);

/*
  vm.timerChamadas = $interval(function(){
    carregaChamadasRealizadas(ChamadasService, vm);
  }, 2000);
*/

  vm.removerGrupoSelecionado = function (){
    vm.processando = true;

    GruposService
    .remove(vm.grupoSelecionado)
    .success(function(data){

      UsuariosGrupoService.remove(vm.grupoSelecionado)
      .success(function(data){
        Materialize.toast("Grupo removido!", 3000);
        carregaGruposCadastrados(GruposService,vm);
      })
      .error(function(err){
        Materialize.toast("Erro ao remover grupo!", 3000);
      })

    })
    .error(function(err){
      Materialize.toast("Erro ao remover grupo!", 3000);
    });
    vm.processando = false;
  }

  vm.atualizaChamadas = function(){
    vm.processando = true;
    carregaChamadasRealizadas(ChamadasService, vm);
    vm.processando = false;
  }

  vm.selecionaGrupo = function (grupoId){
    vm.processando = true;
    vm.grupoSelecionado = grupoId;
    carregaChamadasRealizadas(ChamadasService, vm);
    vm.processando = false;
  }

  vm.checkFiltros = function (){
    //carregaChamadasRealizadas(ChamadasService, vm)
  }

  vm.coresTabela = function (chamada){
    if(chamada.tipo === 'RECEBIDA') return { 'cor-chamada-recebida': true }

    return { 'cor-chamada-realizada': true }
  }

  vm.ativaPreLoader = function(){
    return { 'active': vm.processando }
  }

}

function carregaGruposCadastrados(GruposService, vm){
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

function carregaChamadasRealizadas(ChamadasService, vm){

  if(vm.grupoSelecionado === ''){
    vm.paginaChamadas = Array();
    return;
  }

  ChamadasService
  .findRealizadas(vm.grupoSelecionado)
  .success(function(realizadas){
    vm.ultConsRealizadas = realizadas;

    ChamadasService
    .findRecebidas(vm.grupoSelecionado)
    .success(function(recebidas){
      vm.ultConsRecebidas = recebidas;

      vm.chamadas = Array();
      if(vm.ultConsRealizadas.length != 0){
        vm.ultConsRealizadas.forEach(function(el){
          vm.chamadas.push(getArrayChamadas(el, 'REALIZADA'));
        });
      };

      if(vm.ultConsRecebidas.length != 0){
        vm.ultConsRecebidas.forEach(function(el){
          vm.chamadas.push(getArrayChamadas(el, 'RECEBIDA'));
        });
      };

      vm.chamadas.sort(function(a, b){
        return a.dataCompleta - b.dataCompleta;
      });

      paginar(vm);

    })
    .error(function(err){
      console.log(err);
    });

  })
  .error(function(err){
    console.log(err);
  });

}

function getArrayChamadas(chamada, tipo){
  return {
     nome: chamada.nome_usuario
   , telefone: chamada.telefone
   , duracao: chamada.duracao
   , finalizada: chamada.finalizada
   , data: chamada.data.toString().substring(0,10)
   , dataCompleta: chamada.data
   , tipo: tipo
  }
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

function paginar(vm) {
    var tamanhoPagina = 5;
    var pagina = vm.paginaAtual;

    console.log('pagina',pagina);
    vm.paginaChamadas = Array();

    if(vm.chamadas.length > tamanhoPagina ){
      if(pagina === 1){
        for (var i = 0; i <= 4; i++){
          vm.paginaChamadas.push(vm.chamadas[i]);
        }
      } else {
        for (var i = pagina * tamanhoPagina - tamanhoPagina; i < vm.chamadas.length && i < pagina * tamanhoPagina; i++){
          vm.paginaChamadas.push(vm.chamadas[i]);
        }
      }
    } else vm.paginaChamadas = vm.chamadas;

}
