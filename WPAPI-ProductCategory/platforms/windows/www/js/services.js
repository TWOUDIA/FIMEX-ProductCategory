angular.module('fimex.services', [])

.factory('DataLoader', function ($http, AppSettings) {
    return {
        get: function ($term, $limit) {
            var result = $http({
                method: 'GET',
                url: AppSettings.getURI($term, $limit),
                headers: {
                    'Authorization': 'Basic ' + AppSettings.getAuthPhrase(AppSettings.get('wcAPIKey'), AppSettings.get('wcAPISecret')),
                    key: AppSettings.get('wcAPIKey'),
                    secret: AppSettings.get('wcAPISecret')
                },
                timeout: 5000
            });
            return result;
        }
    }
})

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

.factory('EmailSender', function ($http, $log, AppSettings) {
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
                timeout: 5000 
            }).then(
            function success() {
                $log.debug('successful email send.');
            }, function error() {
                $log.debug('error sending email.');
            });
            return null;
        }
    }
})

.factory('AppSettings', function ($translate, tmhDynamicLocale) {
    var savedData = {
        appName: 'FIMEX PRODUCT CATEGORIES',
        domainURI: 'https://beta.fimex.com.tw/',
        wcAPIURI: 'wc-api/v3/',
        wcAPIKey: 'ck_e3d52fbb954e57758cc7ea5bdadb6d44d9fd8be3',
        wcAPISecret: 'cs_894c2f79bd330af5eba70473c6a921593139f034',
        wcAPIURIsuffix: 'filter[orderby]=id&filter[order]=ASC&filter[limit]=',
        wcAPIRSlimit: 5,
        language: '',
        languageURI: '',
        mgAPIName:'api',
        mgServiceKey: 'key-0c16845e030f782c3acb501cdf07b8a2',
        mgAPIURI: 'https://api.mailgun.net/v3/mg.twoudia.com/messages',
        contactForm2Email: 'yannicklin@twoudia.com',
        contactForm2User: 'Support',
        dataReload: false,
        oriCategories: [{
            "id": 9,
            "name": "Electrical Materials",
            "slug": "electrical-materials",
            "parent": 0,
            "description": "",
            "display": "default",
            "image": "",
            "count": 0,
            "sublevels": 2
        }, {
            "id": 10,
            "name": "Electrical Materials - American Category",
            "slug": "electrical-materials-aa",
            "parent": 0,
            "description": "",
            "display": "default",
            "image": "",
            "count": 0,
            "sublevels": 2
        }, {
            "id": 11,
            "name": "Wiring Devices",
            "slug": "wiring-devices",
            "parent": 0,
            "description": "",
            "display": "default",
            "image": "",
            "count": 0,
            "sublevels": 3
        }],
        wpCategroies: [],
        appFIMEXCategoriesRS: "",
        appFIMEXCategoriesBack: 0
    };

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

    // Set Language and LanguageURI
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
        getAuthPhrase: function (name, key) {
            return btoa(name + ':' + key);
        }
    };
});