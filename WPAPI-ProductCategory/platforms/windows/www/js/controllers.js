angular.module('fimex.controllers', [])

.controller('DashCtrl', ["Notes", "$scope", "$filter", function (Notes, $scope, $filter) {
    var NotesRS = Notes.all();
    $scope.notesNormal = $filter('filter')(NotesRS, { top: 0 });
    $scope.notesTop = $filter('filter')(NotesRS, { top: 1 });
    $scope.notesCount = NotesRS.length;
    $scope.today = new Date();
}])


.controller('CategoriesCtrl', ["AppSettings", "DataLoader", "ImagesCaching", "ModalHandler_product", "$scope", "$stateParams", "$log", "$filter", "$ionicLoading", function (AppSettings, DataLoader, ImagesCaching, ModalHandler_product, $scope, $stateParams, $log, $filter, $ionicLoading) {
    $ionicLoading.show({
        template: '<ion-spinner icon="lines" class="spinner-energized"></ion-spinner>' + $filter('translate')('LOADING_TEXT')
    });
    $scope.RSempty = false;
    var nextPage = 1;
    $scope.able2Loadmore = 0;

    var CategoriesSplitTerm = ' >> ';
    $scope.RSitemURI = '#/tab/categories/' + (parseInt($stateParams.categoryLevel) + 1);
    var PretitleSub = AppSettings.get('curCategoriesLv');
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
                        };
                        //Caching Images
                        ImagesCaching.Store($scope.products, 'featured_src', 'WPthumbnailURI');
                    };
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
                };
                $ionicLoading.hide();
            }
            PretitleSub = (parseInt($stateParams.categoryLevel) > 1) ? arrPrevtitleSub[0] : '';

            break;
    }

    if (parseInt($stateParams.categoryLevel) == 0) {
        $scope.titleSub = '';
        AppSettings.change('curCategoriesLv', '');
    } else {
        $scope.titleSub = (PretitleSub == '') ? $filter('unescapeHTML')($stateParams.categoryName) : (PretitleSub + CategoriesSplitTerm + $filter('unescapeHTML')($stateParams.categoryName));
        AppSettings.change('curCategoriesLv', $scope.titleSub);
    };
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
                };
                //Caching Images
                ImagesCaching.Store($scope.products, 'featured_src', 'WPthumbnailURI');
            };
            $ionicLoading.hide();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function (response) {
            $log.error('error', response);
            $ionicLoading.hide();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    // Modal for Product Detal
    ModalHandler_product.init($scope);
}])


.controller('SearchCtrl', ["AppSettings", "ModalHandler_product", "PHPJSfunc", "DataLoader", "ImagesCaching", "$scope", "$log", "$filter", "$ionicLoading", function (AppSettings, ModalHandler_product, PHPJSfunc, DataLoader, ImagesCaching, $scope, $log, $filter, $ionicLoading) {
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
                };
                //Caching Images
                ImagesCaching.Store($scope.products, 'featured_src', 'WPthumbnailURI');
            };
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
                };
                //Caching Images
                ImagesCaching.Store($scope.products, 'featured_src', 'WPthumbnailURI');
            };
            $ionicLoading.hide();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function (response) {
            $log.error('error', response);
            $ionicLoading.hide();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    // Modal for Product Detal
    ModalHandler_product.init($scope);
}])


.controller('BookmarksCtrl', ["BookMarks", "ModalHandler_enquiry", "$scope", "$state", "$ionicPopup", "$filter", function (BookMarks, ModalHandler_enquiry, $scope, $state, $ionicPopup, $filter) {
    $scope.RSempty = false;
    $scope.bookmarks = null;
    $scope.RScount = 0;

    BookMarks.count().then(function (value) {
        if (value > 0) {
            $scope.RScount = value;
            $scope.bookmarks = BookMarks.getall();
        } else {
            $scope.RSempty = true;
        };
    });

    $scope.gotoSearch = function () {
        $state.go('tab.search');
    };

    $scope.openEnquiry = function () {
        // Modal for Enquiry
        ModalHandler_enquiry.init($scope);
    };

    $scope.dropBookmark = function ($target) {
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('POPUP_DROPBOOKMARK_CONFIRM_TITLE'),
            template: $filter('translate')('POPUP_DROPBOOKMARK_CONFIRM_TEMPLATE'),
            cancelType: 'button-light',
            okType: 'button-assertive'
        });
        confirmPopup.then(function (res) {
            if (res) {
                BookMarks.drop($target.id);
                $scope.RScount--;
                $scope.bookmarks = BookMarks.getall();
            };
        });
    };
}])


.controller('SettingsCtrl', ["AppSettings", "EmailSender", "$scope", "$ionicHistory", "$translate", "$filter", function (AppSettings, EmailSender, $scope, $ionicHistory, $translate, $filter) {
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
        };
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
        EmailSender.send(mailObj, $scope.ctForm.ctName);

        //reset Form
        $scope.ctForm = {};
        $scope.forms.contactForm.$setPristine();
    };
}]);
