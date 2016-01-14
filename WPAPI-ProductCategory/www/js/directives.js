angular.module('fimex.directives', [])

// Set up for grouped Radio Buttons, used in Language Selection
.directive('gpRadio', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            model: '=ngModel',
            value: '=gpRadio'
        },
        link: function (scope, element, attrs, ngModelCtrl) {
            element.addClass('button');
            element.on('click', function (e) {
                scope.$apply(function () {
                    ngModelCtrl.$setViewValue(scope.value);
                });
            });

            scope.$watch('model', function (newVal) {
                element.removeClass('button-positive');
                if (newVal === scope.value) {
                    element.addClass('button-positive');
                }
            });
        }
    };
})

.directive('keyInput', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.keyInput);
                });

                event.preventDefault();
            }
        });
    };
})

.directive('keyboardHandler', function ($window) {
    return {
        restrict: 'A',
        link: function postLink(scope, element, attrs) {
            angular.element($window).bind('native.keyboardshow', function() {
                element.addClass('tabs-item-hide');
            });

            angular.element($window).bind('native.keyboardhide', function() {
                element.removeClass('tabs-item-hide');
            });
        }
    };
});