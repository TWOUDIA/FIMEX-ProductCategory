angular.module('fimex.filters', [])

.filter('partRemove', ["$sce", function ($sce) {
    return function (original, tag) {
        var htmlObject = document.createElement('div');
        htmlObject.innerHTML = original;

        var parts = htmlObject.getElementsByTagName(tag);
        for (var i = parts.length; i > 0 ; i--) {
            parts[i - 1].parentNode.removeChild(parts[i - 1]);
        };

        return $sce.trustAsHtml(htmlObject.outerHTML);
    }
}])

.filter('unicode', ["$sce", function ($sce) {
    return function (x) {
        return $sce.trustAsHtml(x);
    }
}])

.filter('WPthumbnailURI', ["$sce", function ($sce) {
    return function (origin) {
        if (!origin || !origin.length) { return; }
        var index = origin.lastIndexOf('.');
        var wpThumbnail_150 = '-150x150.'
        return $sce.trustAsResourceUrl(origin.substring(0, index) + wpThumbnail_150 + origin.substring(index + 1));
    }
}])

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
        });
        return str;
    }
});