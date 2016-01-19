angular.module('fimex.filters', [])

.filter('linkremove', function ($sce) {
    return function (text) {
        var htmlObject = document.createElement('div');
        htmlObject.innerHTML = text;

        var links = htmlObject.getElementsByTagName('a');
        for (var i = links.length; i > 0 ; i--) {
            links[i-1].parentNode.removeChild(links[i-1]);
        }

        return $sce.trustAsHtml(htmlObject.outerHTML);
    }
})

.filter('unicode', function ($sce) {
    return function (x) {
        return $sce.trustAsHtml(x);
    }
})

.filter('unescapeHTML', function () {
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    return function (str) {
        angular.forEach(entityMap, function (value, key) {
            str = String(str).replace(new RegExp(value, 'gi'), key);
        })
        return str;
    }
});