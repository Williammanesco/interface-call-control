angular.module('User', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/usuario/login', {
        templateUrl: 'views/usuario-login.html',
        controller: 'UsuarioLoginController',
        controllerAs: 'UsuarioLogin'
      })
      .when('/users/create', {
        templateUrl: 'views/users-create.html',
        controller: 'UserCreateController',
        controllerAs: 'Usuario'
      });
  }])
  .service('UserService', UserService)
  .controller('UserCreateController', ['UserService', UserCreateController])
  .controller('UsuarioLoginController', ['UserService', UsuarioLoginController]);


function UserService($http) {
  const BASE_URL = 'http://localhost:3000/api/usuarios';
  this.login = function(user) {
    const request = {
      url: BASE_URL + '/login',
      method: 'POST',
      data: user
    }
    return $http(request);
  }

  this.create = function(user) {
    const request = {
      url: BASE_URL,
      method: 'POST',
      data: user
    }
    //console.log('http', user);
    return $http(request);
  }

  this.remove = function(user) {
    const request = {
      url: BASE_URL + user._id,
      method: 'DELETE'
    }
    return $http(request);
  }
}

function UserCreateController (UserService) {
  var vm = this;

  vm.clicouCadastrar = false;

  vm.submitForm = submitForm;
  function submitForm(user) {
    console.log(user);
    vm.clicouCadastrar = true;

    UserService
    .create(user)
    .success(function(data){
      Materialize.toast('Usuário cadastrado com sucesso!', 2000,'', function(){
        window.location.href = "#/usuario/login";
      });
    })
    .error(function(err){
      vm.erro = err;
    });
  }
}

function UsuarioLoginController(UserService){
  var vm = this;

  vm.login = login;
  function login(user){
    UserService
    .login(user)
    .success(function(data){
      //console.log('data',data);
      if(data.length === 0){
        vm.loginError = 'Email ou senha incorretos';
      } else {
         window.location.href = "#/chamadas/" + data[0]._id;
      }

    })
    .error(function(err){
      console.log('err',err);
    });
  }
}
