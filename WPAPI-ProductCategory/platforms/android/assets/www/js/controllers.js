angular.module('fimex.controllers', [])

.controller('DashCtrl', function ($scope) {})

.controller('ProductsCtrl', function ($scope, DataLoader, $stateParams, $timeout, $log, $filter, $ionicLoading, $ionicHistory) {
    $ionicLoading.show({
        template: $filter('translate')('LOADING_TEXT')
    });
    $scope.RSempty = false;

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
        DataLoader.get('products' + '?filter[limit]=20&filter[orderby]=id&filter[order]=ASC').then(function (response) {
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
        DataLoader.get('products/' + $stateParams.productId).then(function (response) {
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

    $scope.loadTags = function () {
        DataLoader.get('tags').then(function (response) {
            $scope.tags = response.data;
            $ionicLoading.hide();
        }, function (response) {
            $log.error('error', response);
            $ionicLoading.hide();
            $scope.RSempty = true;
        });
    }

    $scope.loadTags();

    // Pull to refresh
    $scope.doRefresh = function () {
        $timeout(function () {
            $scope.loadTags();
        }, 1000);
    };
})


.controller('CategoriesCtrl', function ($cookies, $stateParams, $scope, DataLoader, $timeout, $log, $filter, $ionicLoading) {
    $ionicLoading.show({
        template: $filter('translate')('LOADING_TEXT')
    });
    $scope.RSempty = false;

    if (!$stateParams) {
        var currentCategories = $cookies.get('appFIMEXCategoriesRS');
        $scope.updateCategories = function ($newterm) {
            currentCategories = currentCategories + ' - ' + $newterm;
            $cookies.put('appFIMEXCategoriesRS', currentCategories);
        }
    } else {
        $cookies.remove('appFIMEXCategoriesRS');
    }

    $scope.loadCategories = function () {
        DataLoader.get('products/categories' + '?filter[limit]=20&filter[orderby]=id&filter[order]=ASC').then(function (response) {
            $scope.categories = response.data.categories;
            $ionicLoading.hide();
        }, function (response) {
            $log.error('error', response);
            $ionicLoading.hide();
            $scope.RSempty = true;
        });
    }

    $scope.loadCategories();

    // Pull to refresh
    $scope.doRefresh = function () {
        $timeout(function () {
            $scope.loadCategories();
        }, 1000);
    };
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
