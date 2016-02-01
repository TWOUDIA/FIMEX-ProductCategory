// angular.module is a global place for creating, registering and retrieving Angular modules
angular.module('fimex', [
    'ionic',  // ionic framework
    'ngCookies', // inject the angular-cookies module
    'ngMessages', // inject the angular-messages module
    'angular.filter', // inject the angular-filter module
    'pascalprecht.translate',  // inject the angular-translate module
    'tmh.dynamicLocale', // inject the angular-dynamic-locale module
    'toaster', // inject the angularjs-toaster module
    'fimex.config', 'fimex.controllers', 'fimex.directives', 'fimex.filters', 'fimex.services', 'fimex.info' //customs
])

.run(["$ionicPlatform", "toaster", "$filter", "$timeout", function ($ionicPlatform, toaster, $filter, $timeout) {
    $ionicPlatform.ready(function () {
        cordova.plugins.Keyboard.disableScroll(true);
        if (window.StatusBar && !ionic.Platform.isAndroid()) {
            StatusBar.styleLightContent();
        };

        function alert4Offline() {
            $timeout(function () {
                toaster.pop({
                    type: 'error',
                    body: $filter('translate')('INTERNET_CONNECTION_NONE')
                });
            }, 0);
        }

        /* TODO: Response with Network Unaccessable ? */
        document.addEventListener("offline", alert4Offline, false);

        // Make elements disappear immediately
        window.addEventListener('native.keyboardshow', function () {
            document.body.classList.add('keyboard-open');
        });
    });

    // Exit App
    var countTimerForCloseApp = false;
    $ionicPlatform.registerBackButtonAction(function (e) {
        e.preventDefault();
        if (countTimerForCloseApp) {
            ionic.Platform.exitApp();
        } else {
            countTimerForCloseApp = true;
            // Force to popup immediately
            $timeout(function () {
                toaster.pop({
                    type: 'error',
                    body: $filter('translate')('CONFIRM_BEFORE_APP_EXIT')
                });
            }, 0);
            
            $timeout(function () {
                countTimerForCloseApp = false;
            }, 5000);
        }
        return false;
    }, 101);
}])

.config(["$ionicConfigProvider", "tmhDynamicLocaleProvider", "$translateProvider", "$stateProvider", "$urlRouterProvider", function ($ionicConfigProvider, tmhDynamicLocaleProvider, $translateProvider, $stateProvider, $urlRouterProvider) {
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
            cache: true,
            views: {
                'tab-dash': {
                    templateUrl: 'templates/tab-dash.html',
                    controller: 'DashCtrl'
                }
            }
        })
        .state('tab.categories', {
            url: '/categories/{categoryLevel}/{categoryId}/{categorySlug}/{categoryName:.*}',
            cache: true,
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
}]);