'use strict';

angular.module('semavisApp', [
  'ngAnimate',
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ngSanitize',
  'ngTouch'
]).config(function ($routeProvider) {

  $routeProvider.when('/', {
    templateUrl: 'views/main.html',
    controller: 'MainCtrl',
    controllerAs: 'main'
  }).otherwise({
    redirectTo: '/'
  });


});
