'use strict';

angular.module('semavisApp').controller('MainCtrl', function ($rootScope, $scope, $timeout, $compile, api) {

  $scope.views = {
    'text': {
      closed: false,
      minimized: false,
      maximized: false,
      edit: true
    },
    'heatmap': {
      closed: false,
      minimized: false,
      maximized: false
    },
    'details': {
      closed: false,
      minimized: false,
      maximized: false
    },
    'relevant': {
      closed: false,
      minimized: false,
      maximized: false
    },
    'suggestions': {
      closed: false,
      minimized: false,
      maximized: false
    },
    'readability': {
      closed: false,
      minimized: false,
      maximized: false
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

  $scope.closeView = function (view) { $scope.views[view].closed = true; };
  $scope.openView = function (view) { $scope.views[view].closed = false; };
  $scope.minimizeView = function (view) { $scope.views[view].minimized = !$scope.views[view].minimized; };
  $scope.maximizeView = function (view) {
    // TODO: find a better way
    $scope.views[view].maximized = !$scope.views[view].maximized;
    $rootScope.viewMaximized = $scope.views[view].maximized;
    $timeout(function () {
      if ($rootScope.viewMaximized) {
        var el = document.getElementById(view).cloneNode(true);
        el.id = 'remove-view';
        var parent = document.getElementById('section-copy');
        if (parent) {
          parent.innerHTML = '';
          parent.appendChild(el);
          $compile(el)($scope);
        }
      }
      else {
        var removeEl = document.getElementById('remove-view');
        if (removeEl) { document.removeChild(removeEl); }
      }
    });
  };
  $scope.isMinimized = function (view) { return $scope.views[view].minimized; };
  $scope.isMaximized = function (view) { return $scope.views[view].maximized; };
  $scope.isClosed = function (view) { return $scope.views[view].minimized; };

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
