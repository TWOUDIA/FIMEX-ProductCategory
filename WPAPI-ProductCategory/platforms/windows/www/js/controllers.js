﻿angular.module('fimex.controllers', [])

.controller('DashCtrl', ["$scope", "Notes", "$filter", "$log", "DataLoader", "AppSettings", "$ionicLoading", function ($scope, Notes, $filter, $log, DataLoader, AppSettings, $ionicLoading) {
    var NotesRS = Notes.all();
    $scope.notesNormal = $filter('filter')(NotesRS, { top: 0 });
    $scope.notesTop = $filter('filter')(NotesRS, { top: 1 });
    $scope.notesCount = NotesRS.length;
    $scope.today = new Date();

    // Get Categories Object
    if (AppSettings.get('wcCategories').length == 0) {
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
}])


.controller('CategoriesCtrl', ["$ionicHistory", "$rootScope", "$filter", "AppSettings", "$stateParams", "$scope", "DataLoader", "$log", "$ionicLoading", "$ionicModal", "$ionicSlideBoxDelegate", function ($ionicHistory, $rootScope, $filter, AppSettings, $stateParams, $scope, DataLoader, $log, $ionicLoading, $ionicModal, $ionicSlideBoxDelegate) {
    $ionicLoading.show({
        template: '<ion-spinner icon="lines" class="spinner-energized"></ion-spinner>' + $filter('translate')('LOADING_TEXT')
    });
    $scope.RSempty = false;
    var nextPage = 1;
    $scope.able2Loadmore = 0;

    var CategoriesSplitTerm = ' >> ';
    $scope.RSitemURI = '#/tab/categories/' + (parseInt($stateParams.categoryLevel) + 1);
    var PretitleSub = AppSettings.get('appFIMEXCategoriesRS');
    var arrPrevtitleSub = PretitleSub.split(CategoriesSplitTerm, 2);
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
            PretitleSub = arrPrevtitleSub[0] + CategoriesSplitTerm + arrPrevtitleSub[1];

            break;
        case 2: // The bottom subcategories, which has direct product counts, would execute the "default section" also
            $scope.showCount = 1;
        default: // Subcategories
            $scope.loadResult = function () {
                $scope.categories = $filter('filter')(AppSettings.get('wcCategories'), { parent: parseInt($stateParams.categoryId) }, true);
                if ($scope.categories.length == 0) {
                    $scope.categories = null;
                    $scope.RSempty = true;
                }
                $ionicLoading.hide();
            }
            PretitleSub = (parseInt($stateParams.categoryLevel) > 1) ? arrPrevtitleSub[0] : '';

            break;
    }

    if (parseInt($stateParams.categoryLevel) == 0) {
        $scope.titleSub = '';
        AppSettings.change('appFIMEXCategoriesRS', '');
    } else {
        $scope.titleSub = (PretitleSub == '') ? $filter('unescapeHTML')($stateParams.categoryName) : (PretitleSub + CategoriesSplitTerm + $filter('unescapeHTML')($stateParams.categoryName));
        AppSettings.change('appFIMEXCategoriesRS', $scope.titleSub);
    }
    $scope.loadResult();

    $scope.loadMore = function () {
        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="spinner-energized"></ion-spinner>' + $filter('translate')('LOADING_MORE_TEXT')
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
}])


.controller('SearchCtrl', ["AppSettings", "PHPJSfunc", "$scope", "DataLoader", "$log", "$filter", "$ionicLoading", "$ionicModal", "$ionicSlideBoxDelegate", function (AppSettings, PHPJSfunc, $scope, DataLoader, $log, $filter, $ionicLoading, $ionicModal, $ionicSlideBoxDelegate) {
    $scope.search = {};
    var nextPage = 1;
    $scope.able2Loadmore = 0;

    $scope.cleanResult = function () {
        $scope.products = null;
        $scope.RSempty = false;
    }

    // Clean All
    $scope.cleanSearch = function () {
        $scope.search.term = '';
        $scope.cleanResult();
    };

    // Start Search
    $scope.doSearch = function () {
        if (!$scope.search.term) return;
        cordova.plugins.Keyboard.close();
        $scope.loadResult();
    };

    $scope.loadResult = function () {
        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="spinner-energized"></ion-spinner>' + $filter('translate')('LOADING_TEXT')
        });
        $scope.cleanResult();

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
            template: '<ion-spinner icon="lines" class="spinner-energized"></ion-spinner>' + $filter('translate')('LOADING_MORE_TEXT')
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
}])


.controller('SettingCtrl', ["$state", "$scope", "$translate", "AppSettings", "$ionicHistory", "EmailSender", "$filter", "toaster", "$timeout", function ($state, $scope, $translate, AppSettings, $ionicHistory, EmailSender, $filter, toaster, $timeout) {
    $scope.forms = {};
    $scope.ctForm = {};
    $scope.settings = {
        language: $translate.use()
    }

    // Change Lanuage and auto redirect to dash tab
    $scope.$watch('settings.language', function () {
        if ($scope.settings.language != AppSettings.get('language')) {
            AppSettings.change('language', $scope.settings.language);
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();

            AppSettings.change('wcCategories', []);
            $timeout(function () {
                $state.go('tab.dash', { reload: true });
            }, 50);
        }
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
}]);
