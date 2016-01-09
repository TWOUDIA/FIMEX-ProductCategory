angular.module('fimex.services', [])

.factory('DataLoader', function ($http, $log, AppSettings) {
    return {
        get: function ($term) {
            $log.debug(AppSettings.getURI($term));
            var result = $http({
                method: 'GET',
                url: (AppSettings.getURI($term)),
                headers: {
                    'Authorization': 'Basic ' + AppSettings.getAuthPhrase(),
                    key: AppSettings.get('wcAPIKey'),
                    secret: AppSettings.get('wcAPISecret')
                },
                timeout: 5000 });
            return result;
        }
    }
})

.factory('EmailSender', function ($http, $log, AppSettings) {
    return {
        send: function ($mail) {
            $http.post(AppSettings.get('emailAPI'), $mail).
            success(function () {
                $log.debug('successful email send.');
            }).error(function () {
                $log.debug('error sending email.');
            });
            return null;
        }
    }
})

.factory('AppSettings', function ($translate, tmhDynamicLocale, $log) {
    var savedData = {
        appName: 'APP - FIMEX CATEGORIES',
        domainURI: 'https://beta.fimex.com.tw/',
        wcAPIURI: 'wc-api/v3/',
        wcAPIKey: 'ck_e3d52fbb954e57758cc7ea5bdadb6d44d9fd8be3',
        wcAPISecret: 'cs_894c2f79bd330af5eba70473c6a921593139f034',
        wcAPIURIsuffix: 'filter[orderby]=id&filter[order]=ASC',
        wcAPIURIRSlimit: '&filter[limit]=20',
        language: '',
        languageURI: '',
        emailserviceKey: 'e8yCnUcg1OaKz0dWIhIH7w',
        emailAPI: 'https://mandrillapp.com/api/1.0/messages/send.json',
        contactForm2Email: 'it@beta.fimex.com.tw',
        contactForm2User: 'Support',
        dataReload: false,
        oriCategories:[{
                "id": 9,
                "name": "Electrical Materials",
                "slug": "electrical-materials",
                "parent": 0,
                "description": "",
                "display": "default",
                "image": "",
                "count": 0
            }, {
                "id": 10,
                "name": "Electrical Materials - American Category",
                "slug": "electrical-materials-aa",
                "parent": 0,
                "description": "",
                "display": "default",
                "image": "",
                "count": 0
        }, {
                "id": 11,
                "name": "Wiring Devices",
                "slug": "wiring-devices",
                "parent": 0,
                "description": "",
                "display": "default",
                "image": "",
                "count": 0
        }]
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
            $log.debug($item + ' : ' + value);
        },
        get: function ($item) {
            return savedData[$item];
        },
        getURI: function ($term) {
            if (!$term){
                return savedData.domainURI + savedData.languageURI + savedData.wcAPIURI  + '?' + savedData.wcAPIURIRSlimit;
            }else{
                return savedData.domainURI + savedData.languageURI + savedData.wcAPIURI + $term + savedData.wcAPIURIsuffix + savedData.wcAPIURIRSlimit;
            }
        },
        getAuthPhrase: function(){
            return btoa(savedData.wcAPIKey + ':' + savedData.wcAPISecret);
        }
    };
});