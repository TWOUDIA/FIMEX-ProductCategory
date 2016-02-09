// angular.module is a global place for creating, registering and retrieving Angular modules
angular.module('fimex', [
    'ionic',  // ionic framework
    'ngCookies', // inject the angular-cookies module
    'ngMessages', // inject the angular-messages module
    'angular.filter', // inject the angular-filter module
    'pascalprecht.translate',  // inject the angular-translate module
    'tmh.dynamicLocale', // inject the angular-dynamic-locale module
    'toaster', // inject the angularjs-toaster module
    'LocalForageModule', // inject the angular-localforage module
    'fimex.config', 'fimex.controllers', 'fimex.directives', 'fimex.filters', 'fimex.services', 'fimex.info' //customs
])

.run(["AppSettings", "DataLoader", "$ionicPlatform", "$filter", "$timeout", "$interval", "$log", "toaster", "$ionicLoading", function (AppSettings, DataLoader, $ionicPlatform, $filter, $timeout, $interval, $log, toaster, $ionicLoading) {
    $ionicPlatform.ready(function () {
        cordova.plugins.Keyboard.disableScroll(true);
        if (window.StatusBar && !ionic.Platform.isAndroid()) {
            StatusBar.styleLightContent();
        };

        /* TODO: Response with Network Unaccessable ? */
        function alert4Offline() {
            $timeout(function () {
                toaster.pop({
                    type: 'error',
                    body: $filter('translate')('INTERNET_CONNECTION_NONE')
                });
            }, 0);
        }
        document.addEventListener("offline", alert4Offline, false);

        // Check wcCategories every five seconds
        function updatewcCategories() {
            $ionicLoading.show({
                template: '<ion-spinner icon="lines" class="spinner-energized"></ion-spinner>' + $filter('translate')('LOADING_TEXT')
            });

            DataLoader.get(('products/categories?'), 1000).then(function (response) {
                AppSettings.change('wcCategories', response.data.product_categories);
                $ionicLoading.hide();
            }, function (response) {
                $log.error('error', response);
                $ionicLoading.hide();
            });
        }
        $interval(function () {
            if (AppSettings.get('wcCategories').length == 0) {
                updatewcCategories();
            }
        }, 5000);
        
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

.config(["$ionicConfigProvider", "tmhDynamicLocaleProvider", "$translateProvider", "$localForageProvider", "$stateProvider", "$urlRouterProvider", function ($ionicConfigProvider, tmhDynamicLocaleProvider, $translateProvider, $localForageProvider, $stateProvider, $urlRouterProvider) {
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
      .registerAvailableLanguageKeys(['ar', 'de', 'en', 'es', 'fr', 'pt', 'ru'], {
          'ar': 'ar', 'ar_*': 'ar',
          'de': 'de', 'de_*': 'de',
          'en': 'en', 'en_*': 'en',
          'es': 'es', 'es_*': 'es',
          'fr': 'fr', 'fr_*': 'fr',
          'pt': 'pt', 'pt_*': 'pt',
          'ru': 'ru', 'ru_*': 'ru',
          'zh': 'zh', 'zh_*': 'zh'
      })
      .preferredLanguage('en')
      .fallbackLanguage(['en', 'de', 'es', 'ru'])
      .determinePreferredLanguage()
      .useSanitizeValueStrategy('escapeParameters')
      .useLocalStorage();

    // Setup defaults for LocalForage
    $localForageProvider.config({
        name: 'FIMEXProductCategory', // name of the database and prefix for your data, it is "lf" by default
        storeName: 'prefProducts', // name of the table
        description: 'Let user to keep their preference on FIMEX product(s) on mobile.'
    });

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
        .state('tab.bookmarks', {
            url: '/bookmarks',
            cache: false,
            views: {
                'tab-bookmarks': {
                    templateUrl: 'templates/tab-bookmarks.html',
                    controller: 'BookmarksCtrl'
                }
            }
        })
        .state('tab.settings', {
            url: '/settings',
            views: {
                'tab-settings': {
                    templateUrl: 'templates/tab-settings.html',
                    controller: 'SettingsCtrl'
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');
}]);