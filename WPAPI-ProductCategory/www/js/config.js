angular.module('fimex.config', [])

.constant('AppConfig', {
    appName: 'FIMEX PRODUCT CATEGORIES',
    domainURI: 'https://beta.fimex.com.tw/',
    wcAPIURI: 'wc-api/v3/',
    wcAPIKey: 'ck_e3d52fbb954e57758cc7ea5bdadb6d44d9fd8be3',
    wcAPISecret: 'cs_894c2f79bd330af5eba70473c6a921593139f034',
    wcAPIURIsuffix: 'filter[orderby]=id&filter[order]=ASC&filter[limit]=',
    wcAPIRSlimit: 5,
    mgAPIName: 'api',
    mgServiceKey: 'key-0c16845e030f782c3acb501cdf07b8a2',
    mgAPIURI: 'https://api.mailgun.net/v3/mg.fimex.com.tw/messages',
    contactForm2Email: 'yannicklin@twoudia.com',
    contactForm2User: 'Support',
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
    }]
});