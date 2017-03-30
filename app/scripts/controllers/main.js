'use strict';

angular.module('semavisApp').controller('MainCtrl', function ($rootScope, $scope, api) {

  $scope.textEditActive = true;

  $scope.input = {
    corpus: ''
  };

  $scope.output = {
    relatedKeywords: [],
    relatedKeywordsHighlightRegex: null
  };

  $scope.analyze = function () {
    $scope.textEditActive = false;
    $rootScope.loading = true;
    api.extractKeywords($scope.input.corpus).then(function (res) {
      $scope.output.relatedKeywords = res.data;
      $scope.highlightRegex();
      //var related = res.data.join(', ');
      //swal('Extracted keywords', related, 'success');
      $rootScope.loading = false;
    }, function () {
      swal('Oops...', 'Something went wrong!', 'error');
      $rootScope.loading = false;
    });
  };

  $scope.highlightRegex = function () {
    var regKeys = $scope.output.relatedKeywords.join('|');
    $scope.output.relatedKeywordsHighlightRegex = new RegExp('\\b(?:' + regKeys + ')\\b', 'gi');
    $scope.input.corpus = $scope.input.corpus.replace($scope.output.relatedKeywordsHighlightRegex, function (txt) {
      return '<span class="highlight">' + txt + '</span>';
    });
  };

});
