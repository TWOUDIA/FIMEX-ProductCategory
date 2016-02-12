angular.module('fimex.services', [])

.factory('DataLoader', ["AppSettings", "$http", function (AppSettings, $http) {
    return {
        get: function ($term, $limit) {
            var result = $http({
                method: 'GET',
                url: AppSettings.getURI($term, $limit) + '&consumer_key=' + AppSettings.get('wcAPIKey') + '&consumer_secret=' + AppSettings.get('wcAPISecret'),
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

.factory('EmailSender', ["AppSettings", "$http", "$log", "toaster", "$filter", function (AppSettings, $http, $log, toaster, $filter) {
    return {
        send: function ($mail, $sendername) {
            $http({
                method: 'POST',
                url: AppSettings.get('mgAPIURI'),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
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
                toaster.pop({
                    type: 'info',
                    body: $filter('translate')('ALERT_MAIL_SENT', { name: $sendername }),
                    toasterId: 2
                });
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
    savedData.curCategoriesLv = "";

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
        };
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
            };
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
            };
        },
        getAuthPhrase: function ($name, $key) {
            return btoa($name + ':' + $key);
        }
    };
}])


.service('BookMarks', ["$localForage", "$log", function ($localForage, $log) {
    var lf = $localForage.instance();

    return {
        countos: function () {
            return lf.length().then(function (value) {
                $log.debug(value);
                return value;
            });
        },
        count: function () {
            return lf.length();
        },
        check: function ($id) {
            return lf.getItem($id);
        },
        add: function ($id, $product) {
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
        getall: function () {
            var objArray = [];
            lf.iterate(function (value, key) {
                objArray.push(value);
            }
                ).then(function () { });
            return objArray;
        },
        reset: function () {
            return lf.clear();
        }
    }
}])

.service('ModalHandler_product', ["BookMarks", "$ionicModal", "$filter", "$ionicSlideBoxDelegate", "$ionicScrollDelegate", function (BookMarks, $ionicModal, $filter, $ionicSlideBoxDelegate, $ionicScrollDelegate) {
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
                $ionicSlideBoxDelegate.update();
                $sce.modal.show();
                $ionicScrollDelegate.scrollTop();
            };
            $sce.closeModal = function () {
                $sce.modal.hide();
            };
            $sce.$on('$destroy', function () {
                $sce.modal.remove();
            });

            //Bookmark Processing
            $sce.triggerBookmark = function ($product) {
                BookMarks.check($product.id).then(function (result) {
                    if (angular.isObject(result)) {
                        BookMarks.drop($product.id);
                    } else {
                        BookMarks.add($product.id, $product);
                    };
                });
                $sce.detail.bookmarked = !$sce.detail.bookmarked;
                $sce.closeModal();
            };
        }
    }
}])

.service('ModalHandler_enquiry', ["AppSettings", "BookMarks", "EmailSender", "$ionicModal", "$filter", "$ionicScrollDelegate", function (AppSettings, BookMarks, EmailSender, $ionicModal, $filter, $ionicScrollDelegate) {
    return {
        init: function ($sce) {
            $sce.forms = {};
            $sce.enForm = {};

            $ionicModal.fromTemplateUrl('templates/enquiry-modal.html', {
                scope: $sce,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $sce.modal = modal;
                $sce.modal.show();
                $ionicScrollDelegate.scrollTop();
            });
            $sce.closeModal = function () {
                $sce.modal.hide();
            };
            $sce.$on('$destroy', function () {
                $sce.modal.remove();
            });

            $sce.sendEnquiry = function () {
                // Handling Bookmarks into HTML and TEXT version messages
                var BMCollect_HTML=BMCollect_TEXT='';
                angular.forEach($sce.bookmarks, function (Bookmark) {
                    BMCollect_HTML = BMCollect_HTML + ((BMCollect_HTML) ? '</tr><tr>' : '<tr>');
                    BMCollect_TEXT = BMCollect_TEXT + ((BMCollect_TEXT) ? ' ;' : '');

                    //compose with name, category, path only
                    BMCollect_HTML = BMCollect_HTML +
                        '<td style="border: 1px dashed black; padding: 5px;">name</td><td style="border: 1px dashed black; padding: 5px;">' + Bookmark.name + '</td>' +
                        '<td style="border: 1px dashed black; padding: 5px;">category</td><td style="border: 1px dashed black; padding: 5px;">' + Bookmark.category + '</td>' +
                        '<td style="border: 1px dashed black; padding: 5px;">path</td><td style="border: 1px dashed black; padding: 5px;">' + Bookmark.path + '</td>';
                    BMCollect_TEXT = BMCollect_TEXT +
                        'name:' + Bookmark.name + ' , ' +
                        'category:' + Bookmark.category + ' , ' +
                        'path:' + Bookmark.path + ' ';
                });

                // Compose Mail
                var $mailObj = {
                    'from': $sce.enForm.enName + ' <' + $sce.enForm.enEmail + '>',
                    'to': AppSettings.get('enquiryForm2User') + ' <' + AppSettings.get('enquiryForm2Email') + '>',
                    'cc': '',
                    'bcc': '',
                    'subject': 'Enquiry sent via Mobile APP - ' + AppSettings.get('appName') + ', ' + $filter('date')(Date.now(), 'yyyy-MM-dd HH:mm Z'),
                    'html': '<table style="border: 1px dashed black; border-collapse: collapse;">' + '<caption>' + AppSettings.get('appName') + '</caption>' +
                        '<tfoot style="color: red;"><tr><td style="border: 1px dashed black; padding: 5px;">Time</td><td style="border: 1px dashed black; padding: 5px;">' + $filter('date')(Date.now(), 'yyyy-MM-dd HH:mm Z') + '</td></tr>' +
                        '<tr><td style="border: 1px dashed black; padding: 5px;">SPEC</td><td style="border: 1px dashed black; padding: 5px;">Platform: ' + device.platform + ', Version: ' + device.version + ', Manufacturer: ' + device.manufacturer + ', Model: ' + device.model + ', UUID: ' + device.uuid + '</td></tr></tfoot>' +
                        '<tbody><tr><td style="border: 1px dashed black; padding: 5px;">Name</td>' + '<td style="border: 1px dashed black; padding: 5px;">' + $sce.enForm.enName + '</td></tr>' +
                        '<tr><td style="border: 1px dashed black; padding: 5px;">Email</td>' + '<td style="border: 1px dashed black; padding: 5px;">' + $sce.enForm.enEmail + '</td></tr>' +
                        '<tr><td style="border: 1px dashed black; padding: 5px;">Message</td>' + '<td style="border: 1px dashed black; padding: 5px;">' + $sce.enForm.enMessage + '</td></tr></tbody></table>' +
                        '<br /><table style="border: 1px dashed black; border-collapse: collapse;">' + '<caption>' + AppSettings.get('enquiryCaption') + '</caption>' + BMCollect_HTML + '</tr></table>',
                    'text': 'TEXT VERSION >> Notes: ' + $sce.enForm.enMessage + ', Products: ' + BMCollect_TEXT
                };
                EmailSender.send($mailObj, $sce.enForm.enName);

                //reset Form
                $sce.enForm = {};
                $sce.forms.enquiryForm.$setPristine();
                BookMarks.reset().then(function () {
                    $sce.RSempty = true;
                    $sce.bookmarks = null;
                    $sce.RScount = 0;
                    $sce.closeModal();
                });
            };
        }
    }
}])
;