angular.module('fimex.services', [])

.factory('DataLoader', ["$http", "AppSettings", function ($http, AppSettings) {
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

.factory('EmailSender', ["$http", "$log", "AppSettings", function ($http, $log, AppSettings) {
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

.factory('AppSettings', ["$translate", "tmhDynamicLocale", "AppConfig", function ($translate, tmhDynamicLocale, AppConfig) {
    var savedData = AppConfig;
    savedData.wpCategroies = [];
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
        getAuthPhrase: function (name, key) {
            return btoa(name + ':' + key);
        }
    };
}]);