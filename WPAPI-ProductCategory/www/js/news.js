angular.module('fimex.news', [])
.factory('News', function ($log) {
    var objNews = [{
                "id": 0,
                "top": 0,
                "title": "NEWS_20160107_TITLE",
                "content": "NEWS_20160107_CONTENT"
            }, {
                "id": 1,
                "top": 0,
                "title": "NEWS_20160108_TITLE",
                "content": "NEWS_20160108_CONTENT"
        }, {
                "id": 2,
                "top": 0,
                "title": "NEWS_20160109_TITLE",
                "content": "NEWS_20160109_CONTENT"
    }];
    
    return {
        all: function() {
            return objNews;
        },
        get: function($newsId) {
            for (var i = 0; i < objNews.length; i++) {
                if (objNews[i].id === parseInt($newsId)) {
                return objNews[i];
                }
            }
            return null;
        }
    };
});