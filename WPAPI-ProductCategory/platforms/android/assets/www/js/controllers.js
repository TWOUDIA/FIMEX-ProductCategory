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

    $scope.loadResult = function () {
        DataLoader.get('products?', 0).then(function (response) {
            $scope.products = response.data.products;
            $log.debug($scope.products);
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

    $scope.loadResult = function () {
        DataLoader.get('products/' + $stateParams.productId + '?', 0).then(function (response) {
            $scope.product = response.data.product;
            // Don't strip post html
            $scope.description = $sce.trustAsHtml($scope.product.description);
            $scope.short_description = $sce.trustAsHtml($scope.product.short_description);
            $ionicLoading.hide();
        }, function (response) {
            $log.error('error', response);
            $ionicLoading.hide();
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


.controller('SearchCtrl', function (PHPJSfunc, $scope, DataLoader, $timeout, $log, $filter, $ionicLoading) {
    $scope.search = {};

    $scope.doSearch = function () {
        if (!$scope.search) return;
        $log.debug("search for " + $scope.search.term);

        $scope.loadResult();
    };

    $scope.loadResult = function () {

        $ionicLoading.show({
            template: $filter('translate')('LOADING_TEXT')
        });
        $scope.RSempty = false;

        DataLoader.get(('products?filter[q]=' + PHPJSfunc.urlencode($scope.search.term) + '&'), 0).then(function (response) {
            if (response.data.products.length == 0) {
                $scope.products = null;
                $scope.RSempty = true;
            } else {
                $scope.products = response.data.products;
            }
            $ionicLoading.hide();
        }, function (response) {
            $log.error('error', response);
            $ionicLoading.hide();
            $scope.RSempty = true;
        });
    }

    // Pull to refresh
    $scope.doRefresh = function () {
        $timeout(function () {
            $scope.loadResult();
        }, 1000);
    };
})


.controller('CategoriesCtrl', function ($ionicHistory, $rootScope, $ionicPlatform, $filter, AppSettings, $stateParams, $scope, DataLoader, $timeout, $log, $filter, $ionicLoading) {
    $ionicLoading.show({
        template: $filter('translate')('LOADING_TEXT')
    });
    $scope.RSempty = false;

    $scope.RSitemURI = '#/tab/categories/' + (parseInt($stateParams.categoryLevel) + 1);
    $scope.titleSub = AppSettings.get('appFIMEXCategoriesRS');
    $scope.showCount = 0;

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
                    if (response.data.products.length == 0) {
                        $scope.products = null;
                        $scope.RSempty = true;
                    } else {
                        $scope.products = response.data.products;
                    }
                    $ionicLoading.hide();
                }, function (response) {
                    $log.error('error', response);
                    $ionicLoading.hide();
                    $scope.RSempty = true;
                });
            }

            break;
        case 2:
            $scope.showCount = 1;

        default:
            $scope.loadResult = function () {
                $scope.categories = $filter('filter')(AppSettings.get('wpCategroies'), { parent: parseInt($stateParams.categoryId) }, true);
                if ($scope.categories.length == 0) {
                    $scope.categories = null;
                    $scope.RSempty = true;
                }
                $ionicLoading.hide();
            }

            break;
    }


    if (parseInt($stateParams.categoryLevel) == 0) {
        $scope.titleSub = '';
        AppSettings.change('appFIMEXCategoriesRS', '');
    } else if (AppSettings.get('appFIMEXCategoriesBack') == 0) {
        $scope.titleSub = $scope.titleSub + ' >> ' + $stateParams.categoryName;
        AppSettings.change('appFIMEXCategoriesRS', $scope.titleSub);
        $log.debug('categoryName : ' + ($stateParams.categoryName) + ', titleSub : ' + ($scope.titleSub));
    } else {
        AppSettings.change('appFIMEXCategoriesBack', 0);
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
        var RSstring = AppSettings.get('appFIMEXCategoriesRS');
        RSstring = RSstring.substring(0, RSstring.lastIndexOf(" >> "));
        AppSettings.change('appFIMEXCategoriesRS', RSstring);
        AppSettings.change('appFIMEXCategoriesBack', 1);
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
    $scope.formSubmit = function () {
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
