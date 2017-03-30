'use strict';

angular.module('semavisApp').service('api', function ($rootScope, $http) {
  var api = {
    keys: [
      '933bb080-f919-11e6-b22d-93a4ae922ff1',
      'de081440-149a-11e7-b22d-93a4ae922ff1',
      'c746ce20-148d-11e7-b22d-93a4ae922ff1',
      '7cda2ea0-148c-11e7-b22d-93a4ae922ff1',
      '99196470-148a-11e7-b22d-93a4ae922ff1'
    ],
    base: 'http://api.cortical.io/rest',
    getApiKey: function () {
      return api.keys[Math.floor(Math.random() * api.keys.length)];
    },
    getHeaders: function () {
      return {
        'api-key': api.getApiKey(),
        'Content-Type': 'application/json'
      };
    }
  };

  api.extractKeywords = function (body) {
    return $http({
      method: 'POST',
      url: api.base + '/text/keywords',
      timeout: 180000,
      headers: api.getHeaders(),
      params: { 'retina_name': 'en_associative' },
      data: body
    });
  };

  return api;
});