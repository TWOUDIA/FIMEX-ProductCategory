angular.module('fimex.controllers', [])

.controller('DashCtrl', function ($scope, Notes, $filter, DataLoader, AppSettings, $ionicLoading, $log) {
    var NotesRS = Notes.all();
    $scope.notesNormal = $filter('filter')(NotesRS, { top: 0 });
    $scope.notesTop = $filter('filter')(NotesRS, { top: 1 });
    $scope.notesCount = NotesRS.length;
    $scope.today = new Date();

    $ionicLoading.show({
        template: $filter('translate')('LOADING_TEXT')
    });

    /* TODO: Response with Network Unaccessable ? */
    // Set Categories Object
    if (AppSettings.get('wpCategroies').length == 0) {
        DataLoader.get(('products/categories?'), 1000).then(function (response) {
            AppSettings.change('wpCategroies', response.data.product_categories);
            $ionicLoading.hide();
        }, function (response) {
            $log.error('error', response);
            $ionicLoading.hide();
        });
    }
})


/* TODO: Change to Modal, rather than current View ? */
.controller('ProductDetailCtrl', function ($ionicSlideBoxDelegate, $scope, $stateParams, DataLoader, $sce, $timeout, $log, $filter, $ionicLoading) {
    $ionicLoading.show({
        template: $filter('translate')('LOADING_TEXT')
    });
    $scope.RSempty = false;
    
    $scope.loadResult = function () {
        DataLoader.get('products/' + $stateParams.productId + '?', 0).then(function (response) {
            $scope.product = response.data.product;
            $scope.productImg = $filter('unique')($scope.product.images, 'src');
            $ionicSlideBoxDelegate.update();
            $ionicLoading.hide();
        }, function (response) {
            $log.error('error', response);
            $ionicLoading.hide();
        });
    }
    $scope.loadResult();
})


.controller('CategoriesCtrl', function ($ionicHistory, $rootScope, $ionicPlatform, $filter, AppSettings, $stateParams, $scope, DataLoader, $timeout, $log, $filter, $ionicLoading) {
    $ionicLoading.show({
        template: $filter('translate')('LOADING_TEXT')
    });
    $scope.RSempty = false;
    var nextPage = 1;
    $scope.able2Loadmore = 0;

    $scope.RSitemURI = '#/tab/categories/' + (parseInt($stateParams.categoryLevel) + 1);
    $scope.titleSub = AppSettings.get('appFIMEXCategoriesRS');
    $scope.showCount = 0;

    switch (parseInt($stateParams.categoryLevel)) {
        case 0: // Main Categories
            $scope.loadResult = function () {
                $scope.categories = AppSettings.get('oriCategories');
                $ionicLoading.hide();
            }

            break;
        case 3: // Products List
            $scope.loadResult = function () {
                DataLoader.get(('products?filter[category]=' + $stateParams.categorySlug + '&'), 0).then(function (response) {
                    if (response.data.products.length == 0) {
                        $scope.products = null;
                        $scope.RSempty = true;
                    } else {
                        $scope.products = response.data.products;
                        if (response.data.products.length == AppSettings.get('wcAPIRSlimit')) {
                            nextPage++;
                            $scope.able2Loadmore = 1;
                        }
                    }
                    $ionicLoading.hide();
                }, function (response) {
                    $log.error('error', response);
                    $ionicLoading.hide();
                    $scope.RSempty = true;
                });
            }

            break;
        case 2: // The bottom subcategories, which has direct product counts, would execute the "default section" also
            $scope.showCount = 1;

        default: // Subcategories
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
        $scope.titleSub = ($scope.titleSub == '') ? $filter('unescapeHTML')($stateParams.categoryName) : ($scope.titleSub + ' >> ' + $filter('unescapeHTML')($stateParams.categoryName));
        AppSettings.change('appFIMEXCategoriesRS', $scope.titleSub);
        $log.debug('categoryName : ' + ($stateParams.categoryName) + ', titleSub : ' + ($scope.titleSub));
    } else {
        AppSettings.change('appFIMEXCategoriesBack', 0);
    }

    $scope.loadResult();

    $scope.loadMore = function () {
        $ionicLoading.show({
            template: $filter('translate')('LOADING_MORE_TEXT')
        });
        $scope.able2Loadmore = 0;

        DataLoader.get(('products?filter[category]=' + $stateParams.categorySlug + '&page=' + nextPage), 0).then(function (response) {
            if (response.data.products.length > 0) {
                $scope.products = $scope.products.concat(response.data.products);
                if (response.data.products.length == AppSettings.get('wcAPIRSlimit')) {
                    nextPage++;
                    $scope.able2Loadmore = 1;
                }
            }
            $ionicLoading.hide();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function (response) {
            $log.error('error', response);
            $ionicLoading.hide();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    // Override Soft Back 
    function triggerBackAction() {
        $ionicHistory.goBack();
        var RSstring = AppSettings.get('appFIMEXCategoriesRS');
        RSstring = RSstring.substring(0, RSstring.lastIndexOf(" >> "));
        AppSettings.change('appFIMEXCategoriesRS', RSstring);
        AppSettings.change('appFIMEXCategoriesBack', 1);
    }
    // framework calls $rootScope.$ionicGoBack when soft back button is pressed
    var oldSoftBack = $rootScope.$ionicGoBack;
    $rootScope.$ionicGoBack = function () {
        triggerBackAction();
    };
    var deregisterSoftBack = function () {
        $rootScope.$ionicGoBack = oldSoftBack;
    };
    // cancel custom back behaviour
    $scope.$on('$destroy', function () {
        deregisterSoftBack();
    });
})


.controller('SearchCtrl', function (AppSettings, PHPJSfunc, $scope, DataLoader, $timeout, $log, $filter, $ionicLoading) {
    $scope.search = {};
    var nextPage = 1;
    $scope.able2Loadmore = 0;

    $scope.doSearch = function () {
        if (!$scope.search) return;
        cordova.plugins.Keyboard.close();
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
                if (response.data.products.length == AppSettings.get('wcAPIRSlimit')) {
                    nextPage++;
                    $scope.able2Loadmore = 1;
                }
            }
            $ionicLoading.hide();
        }, function (response) {
            $log.error('error', response);
            $ionicLoading.hide();
            $scope.RSempty = true;
        });
    }

    $scope.loadMore = function () {
        $ionicLoading.show({
            template: $filter('translate')('LOADING_MORE_TEXT')
        });
        $scope.able2Loadmore = 0;

        DataLoader.get(('products?filter[q]=' + PHPJSfunc.urlencode($scope.search.term) + '&page=' + nextPage), 0).then(function (response) {
            if (response.data.products.length > 0) {
                $scope.products = $scope.products.concat(response.data.products);
                if (response.data.products.length == AppSettings.get('wcAPIRSlimit')) {
                    nextPage++;
                    $scope.able2Loadmore = 1;
                }
            }
            $ionicLoading.hide();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function (response) {
            $log.error('error', response);
            $ionicLoading.hide();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
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
        AppSettings.change('wpCategroies', []);
    });

    // contact form submitting
    $scope.formSubmit = function () {
        var mailObj = {
            'from': $scope.ctForm.ctName + ' <' + $scope.ctForm.ctEmail + '>',
            'to': AppSettings.get('contactForm2User') + ' <' + AppSettings.get('contactForm2Email') + '>',
            'cc': '',
            'bcc': '',
            'subject': "Message sent via Mobile APP - " + AppSettings.get('appName') + ", " + $filter('date')(Date.now(), 'yyyy-MM-dd HH:mm:ss Z'),
            "html": "<table style='border: 1px solid black;'>" + "<caption>" + AppSettings.get('appName')+ "</caption>" +
                "<tr><td>Name</td>" + "<td>" + $scope.ctForm.ctName + "</td></tr>" +
                "<tr><td>Email</td>" + "<td>" + $scope.ctForm.ctEmail + "</td></tr>" +
                "<tr><td>Message</td>" + "<td>" + $scope.ctForm.ctMessage + "</td></tr></table>",
            "text": 'TEXT VERSION: ' + $scope.ctForm.ctMessage
        };
        EmailSender.send(mailObj);
        alert($filter('translate')('ALERT_MAIL_SENT', { name: $scope.ctForm.ctName }));

        //reset Form
        $scope.ctForm = {};
        $scope.forms.contactForm.$setPristine();
    };
});
