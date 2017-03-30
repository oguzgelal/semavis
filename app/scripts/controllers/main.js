'use strict';

angular.module('semavisApp').controller('MainCtrl', function ($rootScope, $scope, api) {

  $scope.textEditActive = true;

  $scope.input = {
    corpus: ''
  };

  $scope.analyze = function () {
    $scope.textEditActive = false;
    $rootScope.loading = true;
    api.extractKeywords($scope.input.corpus).then(function (res) {
      var related = res.data.join(', ');
      swal('Extracted keywords', related, 'success');
      $rootScope.loading = false;
    }, function () {
      swal('Oops...', 'Something went wrong!', 'error');
      $rootScope.loading = false;
    });
  };

});
