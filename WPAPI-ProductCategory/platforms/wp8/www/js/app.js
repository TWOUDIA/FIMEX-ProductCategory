// angular.module is a global place for creating, registering and retrieving Angular modules
angular.module('fimex', [
    'ionic',  // ionic framework
    'ngCookies',
    'ngMessages',
    'angular.filter', // inject the angular-filter module
    'pascalprecht.translate',  // inject the angular-translate module
    'tmh.dynamicLocale', // inject the angular-dynamic-locale module
    'ionic-toast', // inject the ionic-toast module
    'satellizer', // inject the satellizer module, for OAuth 1 & 2 authorization
    'fimex.controllers', 'fimex.directives', 'fimex.filters', 'fimex.services', 'fimex.info' //customs
])

.run(function ($ionicPlatform, $ionicHistory, ionicToast, $filter, $timeout) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard && ionic.Platform.isIOS()) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        };
        if (window.StatusBar) {
            StatusBar.styleLightContent();
        };
    });

    var countTimerForCloseApp = false;
    $ionicPlatform.registerBackButtonAction(function (e) {
        e.preventDefault();
        // Is there a page to go back to?
        var previousView = $ionicHistory.backView();
        if (!previousView) {
            if (countTimerForCloseApp) {
                ionic.Platform.exitApp();
            } else {
                countTimerForCloseApp = true;
                ionicToast.show($filter('translate')('CLICK_AGAIN_TO_EXIT_APP'), 'middle', false, 1000);
                $timeout(function () {
                    countTimerForCloseApp = false;
                }, 2000);
            }
        } else {
            previousView.go();
        }
        return false;
    }, 101);
})

.config(function ($ionicConfigProvider, tmhDynamicLocaleProvider, $translateProvider, $stateProvider, $urlRouterProvider) {
    //global configure for tabs position
    $ionicConfigProvider.tabs.position('bottom');

    //locale location
    tmhDynamicLocaleProvider.localeLocationPattern('locales/angular-locale_{{locale}}.js');

    // i18n
    $translateProvider
      .useStaticFilesLoader({
          prefix: 'i18n/',
          suffix: '.json'
      })
      .registerAvailableLanguageKeys(['ar', 'de', 'en', 'es', 'fr', 'pt', 'ru', 'zh'], {
          'ar': 'ar', 'ar_*': 'ar',
          'de': 'de', 'de_*': 'de',
          'en': 'en', 'en_*': 'en',
          'es': 'es', 'es_*': 'es',
          'fr': 'fr', 'fr_*': 'fr',
          'pt': 'pt', 'pt_*': 'pt',
          'ru': 'ru', 'ru_*': 'ru',
          'zh': 'zh', 'zh_*': 'zh'
      })
      .preferredLanguage('de')
      .fallbackLanguage(['en', 'zh', 'es', 'fr'])
      .determinePreferredLanguage()
      .useSanitizeValueStrategy('escapeParameters')
      .useLocalStorage();

    // Ionic uses AngularUI Router which uses the concept of states
    $stateProvider
    // setup an abstract state for the tabs directive
        .state('tab', {
            url: "/tab",
            abstract: true,
            templateUrl: "templates/tabs.html"
        })
        .state('tab.dash', {
            url: '/dash',
            views: {
                'tab-dash': {
                    templateUrl: 'templates/tab-dash.html',
                    controller: 'DashCtrl'
                }
            }
        })
        .state('tab.categories', {
            url: '/categories/{categoryLevel}/{categoryId}/{categorySlug}/{categoryName:.*}',
            cache: false,
            views: {
                'tab-categories': {
                    templateUrl: function ($stateParams) {
                        if ($stateParams.categoryLevel == '3') {
                            return 'templates/categories-products.html';
                        } else {
                            return 'templates/tab-categories.html';
                        }
                    },
                    controller: 'CategoriesCtrl'
                }
            }
        })
        .state('tab.ca-product-detail', {
            url: '/ca-products/:productId',
            views: {
                'tab-categories': {
                    templateUrl: 'templates/product-detail.html',
                    controller: 'ProductDetailCtrl'
                }
            }
        })
        .state('tab.search', {
            url: '/search',
            cache: false,
            views: {
                'tab-search': {
                    templateUrl: 'templates/tab-search.html',
                    controller: 'SearchCtrl'
                }
            }
        })
        .state('tab.se-product-detail', {
            url: '/se-products/:productId',
            views: {
                'tab-search': {
                    templateUrl: 'templates/product-detail.html',
                    controller: 'ProductDetailCtrl'
                }
            }
        })
        .state('tab.setting', {
            url: '/setting',
            views: {
                'tab-setting': {
                    templateUrl: 'templates/tab-setting.html',
                    controller: 'SettingCtrl'
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');
});