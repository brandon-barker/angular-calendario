(function(angular) {
  'use strict';

  // src/js/
  angular.module('ngCalendario', [])

  angular.module('ngCalendario').provider('$calendario', calendarioProvider);

  calendarioProvider.$inject = [];

  function calendarioProvider() {
    var defaults = {
      weeks: [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      weekabbrs: [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ],
      months : [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
      monthabbrs : [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
      // choose between values in options.weeks or options.weekabbrs
      displayWeekAbbr : true,
      // choose between values in options.months or options.monthabbrs
      displayMonthAbbr : false,
      // left most day in the calendar
      // 0 - Sunday, 1 - Monday, ... , 6 - Saturday
      startIn : 0
    };

    var calendarioOptions = defaults;

    this.setOptions = function(options) {
      calendarioOptions = angular.extend(calendarioOptions, options);
    };

    this.getOptions = function() {
      return calendarioOptions;
    };

    this.$get = function () {
      return {
        setOptions: this.setOptions,
        getOptions: this.getOptions
      }
    };
  }

  angular.module('ngCalendario').directive('calendario', calendarioDirective);

  calendarioDirective.$inject = ['$calendario'];

  function calendarioDirective($calendario) {
    return {
      restrict: 'E',
      require: 'ngModel',
      replace: false,
      scope: false,
      template: '<div><div class="custom-header clearfix"><nav><span id="custom-prev" class="custom-prev" ng-click="calendario.gotoPreviousMonth()" ng-hide="hidePrevMonth()"></span><span id="custom-next" class="custom-next" ng-click="calendario.gotoNextMonth()" ng-hide="hideNextMonth()"></span></nav><h2 id="custom-month" class="custom-month">{{ calendario.getMonthName() }}</h2><h3 id="custom-year" class="custom-year">{{ calendario.getYear() }}</h3></div><div class="fc-calendar-container"></div><div>',
      link: function($scope, $element, attrs, $ngModel) {
        attrs.$observe('minDate', function(val) {
          if (val[0] === '+' || val[0] === '-') {
            var now = new Date()
            var date = new Date(now.getFullYear(), now.getMonth() + parseInt(val))
            $scope.minYear = date.getFullYear();
            $scope.minMonth = date.getMonth() + 1;
          } else {
            var dateParts = val.match(/(\d\d\d\d)-(\d\d)/);
            if (dateParts !== null) {
              $scope.minYear = parseInt(dateParts[1]);
              $scope.minMonth = parseInt(dateParts[2]);
            }
          }
        });
        attrs.$observe('maxDate', function(val) {
          if (val[0] === '+' || val[0] === '-') {
            var now = new Date()
            var date = new Date(now.getFullYear(), now.getMonth() + parseInt(val))
            $scope.maxYear = date.getFullYear();
            $scope.maxMonth = date.getMonth() + 1;
          } else {
            var dateParts = val.match(/(\d\d\d\d)-(\d\d)/);
            if (dateParts !== null) {
              $scope.maxYear = parseInt(dateParts[1]);
              $scope.maxMonth = parseInt(dateParts[2]);
            }
          }
        });

        $scope.onDayClick = function($el, $content, dateProperties) {
          var year   = dateProperties.year;
          var month  = ("00" + dateProperties.month).slice(-2);
          var day    = ("00" + dateProperties.day).slice(-2);
          var dateCalendario = month+'-'+day+'-'+year;
          var dateISO = year+"-"+month+"-"+day
          var data = {};
          data[dateCalendario] = '<div class="ng-hide">Selected</div>';

          $scope.calendario.caldata = {};
          $scope.calendario.setData(data);
          $scope.$apply(function () {
            $ngModel.$setViewValue(dateISO);
          });
        };

        $scope.hidePrevMonth = function () {
          return (
          angular.isDefined($scope.minYear) &&
          angular.isDefined($scope.minMonth) &&
          $scope.minYear*100+$scope.minMonth >= $scope.calendario.getYear()*100+$scope.calendario.getMonth()
          );
        };

        $scope.hideNextMonth = function () {
          return (
          angular.isDefined($scope.maxYear) &&
          angular.isDefined($scope.maxMonth) &&
          $scope.maxYear*100+$scope.maxMonth <= $scope.calendario.getYear()*100+$scope.calendario.getMonth()
          );
        };

        // Specify how UI should be updated
        $ngModel.$render = function() {
          if ($ngModel.$viewValue) {
            var dateParts = $ngModel.$viewValue.match(/(\d\d\d\d)-(\d\d)-(\d\d)/);
            if (dateParts !== null) {
              var dateCalendario = dateParts[2]+'-'+dateParts[3]+'-'+dateParts[1];
              var data = {};
              data[dateCalendario] = '<div class="ng-hide">Selected</div>';
              $scope.calendario.caldata = {};
              $scope.calendario.setData(data);
              $scope.calendario.gotoMonth(dateParts[2],dateParts[1]);
            }
          }
        };

        $calendario.setOptions({
          onDayClick: $scope.onDayClick
        });
        $scope.calendario = $element.find('.fc-calendar-container').calendario($calendario.getOptions());
      }
    };
  }
})(angular);
