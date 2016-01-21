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


.controller('CategoriesCtrl', function ($ionicHistory, $rootScope, $filter, AppSettings, $stateParams, $scope, DataLoader, $log, $ionicLoading, $ionicModal, $ionicSlideBoxDelegate) {
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

    // Modal for Product Detal
    $ionicModal.fromTemplateUrl('templates/product-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
        $scope.detail = null;
        $scope.detailImg = null;
    });
    $scope.openModal = function ($data) {
        $scope.detail = $data;
        $scope.detailImg = $filter('unique')($scope.detail.images, 'src');
        $ionicSlideBoxDelegate.update();
        $scope.modal.show();
    };
    $scope.closeModal = function () {
        $scope.modal.hide();
    };
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
})


.controller('SearchCtrl', function (AppSettings, PHPJSfunc, $scope, DataLoader, $log, $filter, $ionicLoading, $ionicModal, $ionicSlideBoxDelegate) {
    $scope.search = {};
    var nextPage = 1;
    $scope.able2Loadmore = 0;

    // Clean All
    $scope.cleanSearch = function () {
        $scope.search.term = '';
        $scope.products = null;
        $scope.RSempty = false;
    };

    // Start Search
    $scope.doSearch = function () {
        if (!$scope.search.term) return;
        cordova.plugins.Keyboard.close();
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

    // Modal for Product Detal
    $ionicModal.fromTemplateUrl('templates/product-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
        $scope.detail = null;
        $scope.detailImg = null;
    });
    $scope.openModal = function ($data) {
        $scope.detail = $data;
        $scope.detailImg = $filter('unique')($scope.detail.images, 'src');
        $ionicSlideBoxDelegate.update();
        $scope.modal.show();
    };
    $scope.closeModal = function () {
        $scope.modal.hide();
    };
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
})


.controller('SettingCtrl', function ($scope, $translate, AppSettings, $ionicHistory, EmailSender, $filter, toaster) {
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
            'subject': 'Message sent via Mobile APP - ' + AppSettings.get('appName') + ', ' + $filter('date')(Date.now(), 'yyyy-MM-dd HH:mm Z'),
            'html': '<table style="border: 1px dashed black; border-collapse: collapse;">' + '<caption>' + AppSettings.get('appName') + '</caption>' +
                '<tfoot style="color: red;"><tr><td style="border: 1px dashed black; padding: 5px;">Time</td><td style="border: 1px dashed black; padding: 5px;">' + $filter('date')(Date.now(), 'yyyy-MM-dd HH:mm Z') + '</td></tr>' +
                '<tr><td style="border: 1px dashed black; padding: 5px;">SPEC</td><td style="border: 1px dashed black; padding: 5px;">Platform: ' + device.platform + ', Version: ' + device.version + ', Manufacturer: ' + device.manufacturer + ', Model: ' + device.model + ', UUID: ' + device.uuid + '</td></tr></tfoot>' +
                '<tbody><tr><td style="border: 1px dashed black; padding: 5px;">Name</td>' + '<td style="border: 1px dashed black; padding: 5px;">' + $scope.ctForm.ctName + '</td></tr>' +
                '<tr><td style="border: 1px dashed black; padding: 5px;">Email</td>' + '<td style="border: 1px dashed black; padding: 5px;">' + $scope.ctForm.ctEmail + '</td></tr>' +
                '<tr><td style="border: 1px dashed black; padding: 5px;">Message</td>' + '<td style="border: 1px dashed black; padding: 5px;">' + $scope.ctForm.ctMessage + '</td></tr></tbody></table>',
            'text': 'TEXT VERSION: ' + $scope.ctForm.ctMessage
        };
        EmailSender.send(mailObj);
        toaster.pop({
            type: 'info',
            body: $filter('translate')('ALERT_MAIL_SENT', { name: $scope.ctForm.ctName })
        });

        //reset Form
        $scope.ctForm = {};
        $scope.forms.contactForm.$setPristine();
    };
});
