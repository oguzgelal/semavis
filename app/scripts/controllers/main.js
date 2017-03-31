'use strict';

angular.module('semavisApp').controller('MainCtrl', function ($rootScope, $scope, $timeout, api) {

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

  $scope.columnLocation = 8;
  $scope.setColumnLocation = function (loc) { $scope.columnLocation = loc; };

  $scope.openCloseView = function (view) {
    if ($scope.isMaximized(view)) { $scope.maximizeView(view); }
    else { $scope.views[view].closed = !$scope.views[view].closed; }
  };
  $scope.minimizeView = function (view) { $scope.views[view].minimized = !$scope.views[view].minimized; };
  $scope.maximizeView = function (view) {
    $scope.views[view].maximized = !$scope.views[view].maximized;
    $rootScope.viewMaximized = $scope.views[view].maximized;
  };
  $scope.isMinimized = function (view) { return $scope.views[view].minimized; };
  $scope.isMaximized = function (view) { return $scope.views[view].maximized; };
  $scope.isClosed = function (view) { return $scope.views[view].closed; };

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
      $scope.columnLocation = 4;
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

  $scope.dragulaSetup = function () {
    if (dragula) {
      var containers = [
        document.getElementById('col-left'),
        document.getElementById('col-right')
      ];
      var options = {
        moves: function (el, source, handle, sibling) {
          return handle.classList.contains('drag-handle');
        },
      };
      dragula(containers, options);
    }
  };

  $scope.tooltipsSetup = function () {
    angular.element(document).ready(function () {
      angular.element('body').tooltip({ selector: '[data-toggle=tooltip]' });
    });
  };

  $timeout(function () {
    $scope.dragulaSetup();
    $scope.tooltipsSetup();

  }, 100);




});
