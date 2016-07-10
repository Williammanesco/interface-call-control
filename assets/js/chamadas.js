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
      })
      .when('/chamadas/grupos/alt/:userId/:grupoId', {
        templateUrl: 'views/addGrupo.html',
        controller: 'AlteraGrupoController',
        controllerAs: 'Grupo'
      });
  }])
  .service('GruposService', GruposService)
  .service('ChamadasService', ChamadasService)
  .controller('ChamadasController', ['$interval', '$routeParams', 'GruposService', 'ChamadasService', ChamadasController])
  .controller('AddGrupoController', ['$routeParams', 'GruposService',  AddGrupoController])
  .controller('AlteraGrupoController', ['$routeParams', 'GruposService', AlteraGrupoController]);


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

function GruposService($http){
  const BASE_URL = 'http://localhost:3000/api/grupos';

  this.find = function(userId){
    return $http.get(BASE_URL + '/?id_usuario='+userId);
  }

  this.findId = function (grupoId) {
    return $http.get(BASE_URL + '/?_id='+grupoId);
  }

  this.create = function(nome, userId, usuarios) {
    const request = {
      url: BASE_URL,
      method: 'POST',
      data: { nome: nome, id_usuario: userId, usuarios: usuarios }
    }
    return $http(request);
  }

  this.remove = function(grupoId) {
    return $http.delete(BASE_URL + '/?_id=' + grupoId);
  }

  this.update = function (grupoId, nome, userId, usuarios) {
    const request = {
      url: BASE_URL + '/'+grupoId,
      method: 'PUT',
      data: { nome: nome, id_usuario: userId, usuarios: usuarios }
    }
    return $http(request);
  }
}

function ChamadasController($interval, $routeParams, GruposService, ChamadasService){
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
  vm.usuarioSelecionado = 'Todos os usuários';
  vm.usuariosGrupo = Array();

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
    var objFilter = {}

    if(vm.checkRecebidas && vm.checkRealizadas){
      objFilter.tipo = ''
    } else if(!vm.checkRecebidas && !vm.checkRealizadas) {
      objFilter.tipo = 'NENHUMA'
    }
    else {
      if(vm.checkRecebidas)
        objFilter.tipo = 'RECEBIDA';
      else if(vm.checkRealizadas)
        objFilter.tipo = 'REALIZADA';
    }

    if(vm.usuarioSelecionado === 'Todos os usuários'){
      objFilter.nome = '';
    } else {
      objFilter.nome = vm.usuarioSelecionado;
    }

    return objFilter;
  }

  vm.ordenar = function(keyname){
    vm.sortKey = keyname;
    vm.reverse = !vm.reverse;
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
      Materialize.toast("Grupo removido!", 2000);
      carregaGruposCadastrados(GruposService,vm);
    })
    .error(function(err){
      Materialize.toast("Erro ao remover grupo!", 2000);
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
    carregaUsuariosDoGrupo(vm);
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

  vm.atualizaSelectUsuarios = function () {
    $('select').material_select('update');
  }

}

function carregaGruposCadastrados(GruposService, vm){
  GruposService
  .find(vm.userId)
  .success(function(data){
    vm.grupos = Array();
    data.forEach(function(el){
      vm.grupos.push({ nome: el.nome,
                       _id: el._id,
                       usuarios: el.usuarios
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

function carregaUsuariosDoGrupo(vm){
  vm.usuariosGrupo = Array();

  vm.grupos.find( function (element) {
    if (element._id === vm.grupoSelecionado) {
      element.usuarios.forEach(function (user) {
        vm.usuariosGrupo.push({ nome: user.nome_usuario});
      });
      return;
    }
  });

}


function phoneMask() {
  var maskBehavior = function (val) {
   return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009';
  },
  options = {onKeyPress: function(val, e, field, options) {
   field.mask(maskBehavior.apply({}, arguments), options);
   }
  };

  $('.phone').mask(maskBehavior, options);
}

function AddGrupoController($routeParams, GruposService){
  vm = this;

  vm.titulo = 'Adicionar Grupo';
  vm.descBotaoConfirmar = 'Adicionar';
  vm.usuarios = Array();
  vm.FormUsuarios = {
    nome: '',
    telefone: ''
  }

  phoneMask();

  vm.addUsuario = function (user) {
    return addUsuario(user);
  }

  vm.confimarGrupo = function (grupo) {
    return confimarGrupo(grupo,vm)
  };

  vm.cancelar = function () {
    window.location.href = "#/chamadas/" + $routeParams.userId;
  }
}

function addUsuario(user){
  vm.usuarios.push({
    nome: user.nome,
    telefone: user.telefone
  });

  user.nome = '';
  user.telefone = '';
}

function confimarGrupo(grupo,vm){
  var usuariosAdd = Array();

  vm.inserindoGrupo = true;
  vm.usuarios.forEach(function(el){
    var usuario = {
      nome_usuario: el.nome,
      telefone_usuario: el.telefone
    };

    usuariosAdd.push(usuario);
  });

  GruposService
  .create(grupo.nomeGrupo, $routeParams.userId, usuariosAdd)
  .success(function(data){
    Materialize.toast('Grupo inserido com sucesso!', 2000,'', function () {
      vm.inserindoGrupo = false;
      window.location.href = "#/chamadas/" + $routeParams.userId;
    });
  })
  .error(function(err){
    console.log('err grupo', err);
    vm.inserindoGrupo = false;
  });

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

function AlteraGrupoController($routeParams, GruposService) {
  vm = this;

  vm.titulo = 'Alterar Grupo';
  vm.descBotaoConfirmar = 'Alterar';
  vm.usuarios = Array();
  vm.userId = $routeParams.userId;
  vm.grupoId = $routeParams.grupoId;
  vm.FormUsuarios = {  nomeGrupo: ''
                     , nome: ''
                     , telefone: ''
                    };

  phoneMask();

  GruposService
  .findId(vm.grupoId)
  .success(function (data) {
    var grupo = data[0];

    vm.FormUsuarios.nomeGrupo = grupo.nome;
    grupo.usuarios.forEach(function (element) {
      vm.usuarios.push({
        nome: element.nome_usuario,
        telefone: element.telefone_usuario
      });
    });
  })
  .error(function (err) {
    console.log(err);
  });

  vm.confimarGrupo = function (grupo) {
    var usuariosAdd = Array();

    vm.inserindoGrupo = true;
    vm.usuarios.forEach(function(el){
      var usuario = {
        nome_usuario: el.nome,
        telefone_usuario: el.telefone
      };

      usuariosAdd.push(usuario);
    });

    GruposService
    .update(vm.grupoId, grupo.nomeGrupo, vm.userId, usuariosAdd)
    .success(function (data) {
      Materialize.toast('Grupo alterado com sucesso!', 2000,'', function () {
        vm.inserindoGrupo = false;
        window.location.href = "#/chamadas/" + vm.userId;
      })
    })
    .error(function (err) {
      console.log(err);
      Materialize.toast('Erro ao alterar grupo.', 2000);
      vm.inserindoGrupo = false;
    });
  };

  vm.addUsuario = function (user) {
    return addUsuario(user);
  }

  vm.cancelar = function () {
    window.location.href = "#/chamadas/" + vm.userId;
  }
}
