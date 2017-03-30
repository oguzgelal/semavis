'use strict';

angular.module('semavisApp').controller('MainCtrl', function ($rootScope, $scope, api) {

  $scope.views = {
    'text': {
      closed: false,
      minimized: false,
      edit: true
    },
    'heatmap': {
      closed: false,
      minimized: false
    },
    'details': {
      closed: false,
      minimized: false
    },
    'relevant': {
      closed: false,
      minimized: false
    },
    'suggestions': {
      closed: false,
      minimized: false
    },
    'readability': {
      closed: false,
      minimized: false
    }
  };

  $scope.input = {
    corpus: '',
    corpusHtml: ''
  };

  $scope.output = {
    relatedKeywords: [],
    relatedKeywordsHighlightRegex: null
  };

  $scope.toggleEdit = function (editOn) {
    if (editOn) {
      $scope.input.corpusHtml = '';
    }
    else {
      $scope.input.corpusHtml = $scope.input.corpus;
      $scope.highlightRegex();
    }
    $scope.views.text.edit = editOn;
  };

  $scope.analyze = function () {
    $scope.toggleEdit(false);
    $rootScope.loading = true;
    api.extractKeywords($scope.input.corpus).then(function (res) {
      $scope.output.relatedKeywords = res.data;
      $scope.highlightRegex();
      $rootScope.loading = false;
    }, function () {
      swal('Oops...', 'Something went wrong!', 'error');
      $rootScope.loading = false;
    });
  };

  $scope.highlightRegex = function () {
    var regKeys = $scope.output.relatedKeywords.join('|');
    $scope.output.relatedKeywordsHighlightRegex = new RegExp('\\b(?:' + regKeys + ')\\b', 'gi');
    $scope.input.corpusHtml = $scope.input.corpus.replace($scope.output.relatedKeywordsHighlightRegex, function (txt) {
      return '<span class="highlight">' + txt + '</span>';
    });
  };

});
