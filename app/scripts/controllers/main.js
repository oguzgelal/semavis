'use strict';

angular.module('semavisApp').controller('MainCtrl', function ($rootScope, $scope, $timeout, $interval, api) {

  $scope.heatmapSize = 128; // 128 x 128
  $scope.heatmapDimentions = 300; // 300px
  $scope.clusterSize = 10;
  $scope.clusterQuantity = 300;

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

  $scope.calculateHeatmapSize = function () {
    try { $scope.heatmapDimentions = angular.element(angular.element('.heatmap-container')[0]).width(); }
    catch (e) { }
  };

  $scope.getTemplateName = function (view) { return 'views/section-' + view + '.html'; };

  $scope.initReset = function () {

    $scope.input = {
      corpus: '',
      corpusHtml: ''
    };

    $scope.resetOutput();
  };

  $scope.resetOutput = function () {
    $scope.output = {
      relatedKeywords: [],
      relatedKeywordsHighlightRegex: null,
      suggestedKeywords: [],
      fingerprints: [],
      heatmap: [],
      clusterMarks: []
    };

    $scope.heatmapMax = 0;
    $scope.clusterMax = 0;

    // initialise the heatmap data
    for (var i = 0; i < $scope.heatmapSize; i++) {
      $scope.output.heatmap[i] = [];
      for (var y = 0; y < $scope.heatmapSize; y++) {
        $scope.output.heatmap[i][y] = 0;
      }
    }
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
    $scope.resetOutput();
    $scope.toggleEdit(false);
    $rootScope.loading = true;

    //api.sliceText($scope.input.corpus).then(function (slices) {
    //for (var i = 0; i < slices.data.length; i++) {
    //  var slicedText = slices.data[i].text;
    api.extractKeywords($scope.input.corpus).then(function (res) {
      $scope.output.relatedKeywords = $scope.output.relatedKeywords.concat(res.data);
      $scope.highlightRegex();
      $scope.processRelatedKeywords(res.data);
      $rootScope.loading = false;
    }, function () {
      swal('Oops...', 'Something went wrong!', 'error');
      $rootScope.loading = false;
    });
    //}

    //}, function () {
    //  swal('Oops...', 'Something went wrong!', 'error');
    //  $rootScope.loading = false;
    //});
  };

  $scope.printHeatmap = function () {
    console.log('--------------------------------------');
    for (var i = 0; i < $scope.heatmapSize; i++) { console.log($scope.output.heatmap[i].join('')); }
    console.log('--------------------------------------');
  };

  $scope.getCellColor = function (val) {
    var value = 0;
    if (val && $scope.heatmapMax) { value = val / $scope.heatmapMax; }
    if (value > 0 && value <= 0.3) { value = 0.3; }
    var hue = ((1 - value) * 120).toString(10);
    return ['hsl(', hue, ',63.2%,49%)'].join('');
  };

  $scope.findCluster = function (row, col) {
    var clusterStartRow = row - ($scope.clusterSize / 2);
    var clusterStartCol = col - ($scope.clusterSize / 2);
    if (clusterStartRow < 0) { clusterStartRow = 0; }
    if (clusterStartCol < 0) { clusterStartCol = 0; }
    var clusterEndRow = row + ($scope.clusterSize / 2);
    var clusterEndCol = col + ($scope.clusterSize / 2);
    if (clusterEndRow >= $scope.heatmapSize) { clusterEndRow = $scope.heatmapSize - 1; }
    if (clusterEndCol >= $scope.heatmapSize) { clusterEndCol = $scope.heatmapSize - 1; }

    var clusterTotal = 0;
    var clusterMarks = [];
    for (var r = clusterStartRow; r <= clusterEndRow; r++) {
      for (var c = clusterStartCol; c <= clusterEndCol; c++) {
        clusterTotal += $scope.output.heatmap[r][c];
      }
    }

    $scope.output.clusterMarks.push({
      key: row + '-' + col,
      val: clusterTotal
    });

    $scope.output.clusterMarks.sort(function (a, b) {
      if (a.val < b.val) { return 1; }
      if (a.val > b.val) { return -1; }
      return 0;
    });

    if ($scope.output.clusterMarks.length > $scope.clusterQuantity) {
      $scope.output.clusterMarks.length = $scope.clusterQuantity;
    }

    //if (clusterTotal > $scope.clusterMax) {
    //  $scope.clusterMax = clusterTotal;
    //  $scope.output.clusterMarks.push(row + '-' + col);
    //}
  };

  $scope.isClusterMarked = function (r, c) {
    //if ($scope.output.clusterMarks.length > 0){ console.log(r, c, $scope.output.clusterMarks); }
    return $scope.output.clusterMarks.map(function(i){ return i.key; }).indexOf(r + '-' + c) !== -1;
  };

  $scope.insertDataToHeatmap = function (dataArr) {
    if (!$scope.output.heatmap) { $scope.output.heatmap = []; }
    for (var i = 0; i < dataArr.length; i++) {
      var index = dataArr[i];
      var row = index % $scope.heatmapSize;
      var col = (index - row) / $scope.heatmapSize;
      $scope.output.heatmap[row][col] += 1;
      // find clusters
      $scope.findCluster(row, col);
      // find max boundry
      if ($scope.output.heatmap[row][col] > $scope.heatmapMax) { $scope.heatmapMax = $scope.output.heatmap[row][col]; }
    }
  };

  $scope.getFingerPrint = function (term) {
    if (!$scope.output.fingerprints) { $scope.output.fingerprints = []; }
    api.getFingerprints(term).then(function (data) {
      $scope.output.fingerprints.push(data.data[0].fingerprint.positions);
      $scope.insertDataToHeatmap(data.data[0].fingerprint.positions);
    }, function () {
      swal('Oops...', 'Something went wrong while generating the fingerprint', 'error');
    });
  };

  $scope.processRelatedKeywords = function (keys) {
    for (var i = 0; i < keys.length; i++) {
      $scope.getFingerPrint(keys[i]);
      $scope.getSuggestedKeywords(keys[i]);
    }
  };

  $scope.getSuggestedKeywords = function (keyword) {
    if (!$scope.output.suggestedKeywords) { $scope.output.suggestedKeywords = []; }
    api.getSuggestedKeywords(keyword).then(function (data) {
      var suggestedKeys = data.data.map(function (i) { return i.term; });
      $scope.output.suggestedKeywords = $scope.output.suggestedKeywords.concat(suggestedKeys);
    }, function () {
      swal('Oops...', 'Something went wrong while getting suggested keywords', 'error');
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
    $timeout(function () { $scope.calculateHeatmapSize(); }, 100);
    localStorage.setItem('semavis-views', JSON.stringify($scope.views));
    localStorage.setItem('semavis-columns', JSON.stringify($scope.columns));
  };

  $scope.restoreLs();
  $scope.initReset();

  $interval(function () {
    $scope.calculateHeatmapSize();
  }, 1000);

});
