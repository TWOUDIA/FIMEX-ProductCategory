angular.module('fimex.services', [])

.factory('DataLoader', ["AppSettings", "$http", function (AppSettings, $http) {
    return {
        get: function ($term, $limit) {
            var result = $http({
                method: 'GET',
                url: AppSettings.getURI($term, $limit) + '&consumer_key='+ AppSettings.get('wcAPIKey')+ '&consumer_secret=' + AppSettings.get('wcAPISecret'),
                timeout: AppSettings.get('wcConnectTimeout')
            });
            return result;
        }
    }
}])

.factory('PHPJSfunc', function () {
    return {
        urlencode: function ($uri) {
            $uri = ($uri + '').toString();

            var result = encodeURIComponent($uri)
              .replace(/!/g, '%21')
              .replace(/'/g, '%27')
              .replace(/\(/g, '%28')
              .replace(/\)/g, '%29')
              .replace(/\*/g, '%2A')
              .replace(/%20/g, '+');

            return result;
        }
    }
})

.service('BookMarks', ["$localForage", "$log", function ($localForage, $log) {
    var lf = $localForage.instance();

    return {
        countos: function(){
            return lf.length().then(function (value) {
                $log.debug(value);
                return value;
            });
        },
        count: function () {
            return lf.length();
        },
        check: function($id){
            return lf.getItem($id);
        },
        add: function($id, $product){
            lf.setItem($id, {
                name: $product.title,
                id: $product.id,
                thumbnail: $product.featured_src,
                category: $product.categories[0],
                path: $product.permalink
            }).then(function () {
                $log.debug('LocalForage Add #:' + $id);
            });
        },
        drop: function ($id) {
            lf.removeItem($id).then(function () {
                $log.debug('LocalForage Remove #:' + $id);
            });
        },
        getall: function(){
            var objArray = [];
            lf.iterate(function (value, key) {
                objArray.push(value);}
                ).then(function () { });
            return objArray;
        }
    }
}])

.service('ModalHandler_product', ["BookMarks", "$ionicModal", "$filter", "$ionicSlideBoxDelegate", "$localForage", function (BookMarks, $ionicModal, $filter, $ionicSlideBoxDelegate, $localForage) {
    return {
        init: function ($sce) {
            $ionicModal.fromTemplateUrl('templates/product-modal.html', {
                scope: $sce,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $sce.modal = modal;
                $sce.detail = null;
                $sce.detailImg = null;
            });

            $sce.openModal = function ($data) {
                $sce.detail = $data;
                $sce.detailImg = $filter('unique')($sce.detail.images, 'src');
                BookMarks.check($data.id).then(function (result) {
                    $sce.detail.bookmarked = (angular.isObject(result)) ? true : false;
                });
                $sce.detail.bookmarked = (BookMarks.check($data.id)) ? true : false;
                $ionicSlideBoxDelegate.update();
                $sce.modal.show();
            };
            $sce.closeModal = function () {
                $sce.modal.hide();
            };
            $sce.$on('$destroy', function () {
                $sce.modal.remove();
            });

            //Bookmark Processing
            $sce.triggerBookmark = function ($product) {
                BookMarks.check($product.id).then(function(result) {
                    if (angular.isObject(result)) {
                        BookMarks.drop($product.id);
                    }else{
                        BookMarks.add($product.id, $product);
                    }
                });
                $sce.detail.bookmarked = !$sce.detail.bookmarked;    
            };
        }
    }
}])

.factory('EmailSender', ["AppSettings", "$http", "$log", function (AppSettings, $http, $log) {
    return {
        send: function ($mail) {
            $http({
                method: 'POST',
                url: AppSettings.get('mgAPIURI'),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'Authorization': 'Basic ' + AppSettings.getAuthPhrase(AppSettings.get('mgAPIName'), AppSettings.get('mgServiceKey')),
                },
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj) {
                        if (obj[p].length > 0) { str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p])); }
                    }
                    return str.join('&');
                },
                data: $mail,
                timeout: AppSettings.get('mgConnectTimeout')
            }).then(
            function success() {
                $log.debug('successful email send.');
            }, function error() {
                $log.debug('error sending email.');
            });
            return null;
        }
    }
}])

.factory('AppSettings', ["AppConfig", "$translate", "tmhDynamicLocale", function (AppConfig, $translate, tmhDynamicLocale) {
    var savedData = AppConfig;
    savedData.wcCategories = [];
    savedData.appFIMEXCategoriesRS = "";

    function setLanguageURI(value) {
        switch (value) {
            case 'en':
                savedData.languageURI = '';
                break;
            case 'zh':
                savedData.languageURI = 'zh-hant/';
                break;
            default:
                savedData.languageURI = value + '/';
        }
    }

    // Initial Language and LanguageURI
    savedData.language = $translate.use();
    setLanguageURI(savedData.language);

    return {
        change: function ($item, value) {
            savedData[$item] = value;
            if ($item == 'language') {
                // Set Language URI
                setLanguageURI(value);
                // Apply Translate
                $translate.use(value);
                tmhDynamicLocale.set(value);
            }
        },
        get: function ($item) {
            return savedData[$item];
        },
        getURI: function ($term, $limit) {
            //TODO: set languageURI fixed to null, for the only ENGLISH language for products & categories. 10 JAN 16
            savedData.languageURI = '';

            ($limit == 0) ? ($limit = savedData.wcAPIRSlimit) : ($limit = $limit);
            if (!$term) {
                return savedData.domainURI + savedData.languageURI + savedData.wcAPIURI + '?' + savedData.wcAPIURIsuffix + $limit;
            } else {
                return savedData.domainURI + savedData.languageURI + savedData.wcAPIURI + $term + savedData.wcAPIURIsuffix + $limit;
            }
        },
        getAuthPhrase: function ($name, $key) {
            return btoa($name + ':' + $key);
        }
    };
}]);