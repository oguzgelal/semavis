'use strict';

/**
 * @ngdoc overview
 * @name semavisApp
 * @description
 * # semavisApp
 *
 * Main module of the application.
 */
angular
  .module('semavisApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .otherwise({ redirectTo: '/' });
  });
