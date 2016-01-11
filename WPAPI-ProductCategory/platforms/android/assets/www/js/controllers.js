angular.module('fimex.controllers', [])

.controller('DashCtrl', function ($scope, Notes, $filter, DataLoader, AppSettings, $ionicLoading) {
    var NotesRS = Notes.all();
    $scope.notesNormal = $filter('filter')(NotesRS, { top: 0 });
    $scope.notesTop = $filter('filter')(NotesRS, { top: 1 });
    $scope.notesCount = NotesRS.length;
    $scope.today = new Date();

    $ionicLoading.show({
        template: $filter('translate')('LOADING_TEXT')
    });

    // Set Categories Object
    DataLoader.get(('products/categories?'), 1000).then(function (response) {
        AppSettings.change('wpCategroies', response.data.product_categories);
        $ionicLoading.hide();
    }, function (response) {
        $log.error('error', response);
        $ionicLoading.hide();
    });
})

.controller('ProductsCtrl', function ($scope, DataLoader, $stateParams, $timeout, $log, $filter, $ionicLoading, $ionicHistory) {
    $ionicLoading.show({
        template: $filter('translate')('LOADING_TEXT')
    });
    $scope.RSempty = false;

    $scope.titleSub = $cookies.get('appFIMEXCategoriesRS');

    /*
    // Get all of our posts [under Params constraint]
    var termQueryString;
    if ($stateParams.tagSlug) {
        termQueryString = '?filter[tag]=' + $stateParams.tagSlug;
        $scope.termQS = { Type: 'TAB_TITLE_TAGS', Term: $stateParams.tagName };
    } else if ($stateParams.categorySlug) {
        termQueryString = '?filter[category_name]=' + $stateParams.categorySlug;
        $scope.termQS = { Type: 'TAB_TITLE_CATEGORIES', Term: $stateParams.categoryName };
    } else {
        //TODO: initial to get all while click original tab of "POSTS"
        termQueryString = '';
    }
    */

    $scope.loadResult = function () {
        DataLoader.get('products?', 0).then(function (response) {
            $scope.products = response.data.products;
            $log.debug($scope.products);
            $ionicLoading.hide();
        }, function(response) {
            $log.error('error', response);
            $ionicLoading.hide();
            $scope.RSempty = true;
        });
    }
    $scope.loadResult();

    // Pull to refresh
    $scope.doRefresh = function() {
        $timeout( function() {
            $ionicLoading.show({
                template: $filter('translate')('LOADING_TEXT')
            });
            $scope.loadResult();
        }, 1000);
    };
})

.controller('ProductDetailCtrl', function ($scope, $stateParams, DataLoader, $sce, $timeout, $log, $filter, $ionicLoading) {
    $ionicLoading.show({
        template: $filter('translate')('LOADING_TEXT')
    });
    $scope.RSempty = false;

    $scope.loadResult = function() {
        DataLoader.get('products/' + $stateParams.productId + '?', 0).then(function (response) {
            $scope.product = response.data.product;
            // Don't strip post html
            $scope.description = $sce.trustAsHtml($scope.product.description);
            $scope.short_description = $sce.trustAsHtml($scope.product.short_description);
            $ionicLoading.hide();
        }, function(response) {
            $log.error('error', response);
            $ionicLoading.hide();
        });
    }
    $scope.loadResult();

    // Pull to refresh
    $scope.doRefresh = function() {
        $timeout( function() {
            $scope.loadResult();
        }, 1000);
    };
})


.controller('SearchCtrl', function ($scope, DataLoader, $timeout, $log, $filter, $ionicLoading) {
    $ionicLoading.show({
        template: $filter('translate')('LOADING_TEXT')
    });
    $scope.RSempty = false;

    $scope.loadResult = function () {
        DataLoader.get('tags', 0).then(function (response) {
            $scope.tags = response.data;
            $ionicLoading.hide();
        }, function (response) {
            $log.error('error', response);
            $ionicLoading.hide();
            $scope.RSempty = true;
        });
    }

    $scope.loadResult();

    // Pull to refresh
    $scope.doRefresh = function () {
        $timeout(function () {
            $scope.loadResult();
        }, 1000);
    };
})


.controller('CategoriesCtrl', function ($ionicHistory, $rootScope, $ionicPlatform, $filter, AppSettings, $cookies, $stateParams, $scope, DataLoader, $timeout, $log, $filter, $ionicLoading) {
    $ionicLoading.show({
        template: $filter('translate')('LOADING_TEXT')
    });
    $scope.RSempty = false;
    
    $scope.RSitemURI = '#/tab/categories/' + (parseInt($stateParams.categoryLevel) + 1);
    $scope.titleSub = $cookies.get('appFIMEXCategoriesRS');

    switch (parseInt($stateParams.categoryLevel)) {
        case 0:
            $scope.loadResult = function () {
                $scope.categories = AppSettings.get('oriCategories');
                $ionicLoading.hide();
            }

            break;
        case 3:
            $scope.loadResult = function () {
                DataLoader.get(('products?filter[category]=' + $stateParams.categorySlug + '&'), 0).then(function (response) {
                    $scope.products = response.data.products;
                    $ionicLoading.hide();
                }, function (response) {
                    $log.error('error', response);
                    $ionicLoading.hide();
                    $scope.RSempty = true;
                });
            }

            break;
        default:
            $scope.loadResult = function () {
                $scope.categories = $filter('filter')(AppSettings.get('wpCategroies'), { parent: parseInt($stateParams.categoryId) }, true);
                $ionicLoading.hide();
            }

            break;
    }
    

    if (parseInt($stateParams.categoryLevel) == 0) {
        $scope.titleSub = '';
        $cookies.put('appFIMEXCategoriesRS', '');
    } else if ($cookies.get('appFIMEXCategoriesBack') == 0) {
        $scope.titleSub = $scope.titleSub + ' >> ' + $stateParams.categoryName;
        $cookies.put('appFIMEXCategoriesRS', $scope.titleSub);
        $log.debug('categoryName : ' + ($stateParams.categoryName) + ', titleSub : ' + ($scope.titleSub));
    } else {
        $cookies.put('appFIMEXCategoriesBack', 0);
    }

    $scope.loadResult();

    // Pull to refresh
    $scope.doRefresh = function () {
        $timeout(function () {
            $scope.loadResult();
        }, 1000);
    };

    // TODO: Modify GoBack Function !!!
    function triggerBackAction() {
        $ionicHistory.goBack();
        var RSstring = $cookies.get('appFIMEXCategoriesRS');
        RSstring = RSstring.substring(0, RSstring.lastIndexOf(" >> "));
        $cookies.put('appFIMEXCategoriesRS', RSstring);
        $cookies.put('appFIMEXCategoriesBack', 1);
    }

    // override soft back
    // framework calls $rootScope.$ionicGoBack when soft back button is pressed
    var oldSoftBack = $rootScope.$ionicGoBack;
    $rootScope.$ionicGoBack = function () {
        triggerBackAction();
    };
    var deregisterSoftBack = function () {
        $rootScope.$ionicGoBack = oldSoftBack;
    };

    // override hard back
    // registerBackButtonAction() returns a function which can be used to deregister it
    var deregisterHardBack = $ionicPlatform.registerBackButtonAction(
        triggerBackAction, 101
    );

    // cancel custom back behaviour
    $scope.$on('$destroy', function () {
        deregisterHardBack();
        deregisterSoftBack();
    });
})


.controller('SettingCtrl', function ($scope, $translate, AppSettings, $ionicHistory, EmailSender, $filter) {
    $scope.forms = {};
    $scope.ctForm = {};
    $scope.settings = {
        enableFriends: true,
        language: $translate.use()
    }

    $scope.$watch('settings.language', function () {
        AppSettings.change('language', $scope.settings.language);
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
    });

    // contact form submitting
  $scope.formSubmit = function() {
      var mailJSON = {
          "key": AppSettings.get('emailserviceKey'),
          "message": {
              "html": $scope.ctForm.ctMessage,
              "text": $scope.ctForm.ctMessage,
              "subject": "Message sent via Mobile APP - " + AppSettings.get('appName') + ", " + $filter('date')(Date.now(), 'yyyy-MM-dd HH:mm:ss Z'),
              "from_email": $scope.ctForm.ctEmail,
              "from_name": $scope.ctForm.ctName,
              "to": [
                  {
                      "email": AppSettings.get('contactForm2Email'),
                      "name": AppSettings.get('contactForm2User'),
                      "type": "to"
                  }
              ],
              "important": false,
              "track_opens": null,
              "track_clicks": null,
              "auto_text": null,
              "auto_html": null,
              "inline_css": null,
              "url_strip_qs": null,
              "preserve_recipients": null,
              "view_content_link": null,
              "tracking_domain": null,
              "signing_domain": null,
              "return_path_domain": null
          },
          "async": false,
          "ip_pool": "Main Pool"
      };
      EmailSender.send(mailJSON);
      alert($filter('translate')('ALERT_MAIL_SENT', { name: $scope.ctForm.ctName }));

      //reset Form
      $scope.ctForm = {};
      $scope.forms.contactForm.$setPristine();
  };
});
