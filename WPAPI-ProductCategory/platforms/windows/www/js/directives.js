﻿angular.module('fimex.directives', [])

// Set up for grouped Radio Buttons, used in Language Selection
.directive('gpRadio', function () {
    return {
        restrict: 'AE',
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
                };
            });
        }
    };
})

// Handling Keyboard KeyIn Event; especially for search
.directive('keyInput', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.keyInput);
                });
                event.preventDefault();
            };
        });
    };
})

// Handling Element to hide while Keyboard shows up
.directive('keyboardHide', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch('native.keyboardshow', function () {
                element.addClass('hide');
                alert('element is ' + element);
            });
            scope.$watch('native.keyboardhide', function () {
                element.removeClass('hide');
            });
        }
    };
});