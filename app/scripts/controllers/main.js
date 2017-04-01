'use strict';

angular.module('semavisApp').controller('MainCtrl', function ($rootScope, $scope, $timeout, api) {


  $scope.columns = {
    'left': ['text'],
    'right': ['heatmap', 'readability', 'suggestions', 'relevant']
  };
  $scope.views = {
    'columnLocation': 8,
    'viewMaximized': false,
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

  $scope.getTemplateName = function (view) { return 'views/section-' + view + '.html'; };

  $scope.input = {
    corpus: '',
    corpusHtml: ''
  };

  $scope.output = {
    relatedKeywords: [],
    relatedKeywordsHighlightRegex: null
  };
  $scope.setColumnLocation = function (loc) {
    $scope.views.columnLocation = loc;
    $scope.saveLs();
  };

  $scope.openCloseView = function (view) {
    if ($scope.isMaximized(view)) { $scope.maximizeView(view); }
    else { $scope.views[view].closed = !$scope.views[view].closed; }
    $scope.saveLs();
  };
  $scope.minimizeView = function (view) {
    $scope.views[view].minimized = !$scope.views[view].minimized;
    $scope.saveLs();
  };
  $scope.maximizeView = function (view) {
    $scope.views[view].maximized = !$scope.views[view].maximized;
    $scope.views.viewMaximized = $scope.views[view].maximized;
    $scope.saveLs();
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

  $scope.syncColumnsOrders = function () {
    var leftCol = document.getElementById('col-left');
    var rightCol = document.getElementById('col-right');
    if (leftCol && rightCol) {
      if (leftCol.children) {
        var arr1 = [].slice.call(leftCol.children);
        $scope.columns.left = arr1.map(function (i) { return i.id; });
      }
      if (rightCol.children) {
        var arr2 = [].slice.call(rightCol.children);
        $scope.columns.right = arr2.map(function (i) { return i.id; });
      }
    }
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
      var drake = dragula(containers, options);
      drake.on('drop', function (el, target, source, sibling) {
        $scope.syncColumnsOrders();
        $scope.saveLs();
      });
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

  $scope.restoreLs = function () {
    var lsViews = localStorage.getItem('semavis-views');
    var lsColumns = localStorage.getItem('semavis-columns');
    if (lsViews) { $scope.views = JSON.parse(lsViews); }
    if (lsColumns) { $scope.columns = JSON.parse(lsColumns); }
  };
  $scope.saveLs = function () {
    localStorage.setItem('semavis-views', JSON.stringify($scope.views));
    localStorage.setItem('semavis-columns', JSON.stringify($scope.columns));
  };

  $scope.restoreLs();

});
