angular.module('fimex.info', [])

.factory('Notes', function () {
    var objNotes = [{
                "id": 0,
                "top": 0,
                "title": 'NOTES_20160107_TITLE',
                "content": 'NOTES_20160107_CONTENT'
            }, {
                "id": 1,
                "top": 0,
                "title": 'NOTES_20160108_TITLE',
                "content": 'NOTES_20160108_CONTENT'
        }, {
                "id": 2,
                "top": 0,
                "title": 'NOTES_20160109_TITLE',
                "content": 'NOTES_20160109_CONTENT'
    }];
    
    return {
        all: function() {
            return objNotes;
        },
        get: function ($noteId) {
            for (var i = 0; i < objNotes.length; i++) {
                if (objNotes[i].id === parseInt($noteId)) {
                    return objNotes[i];
                }
            }
            return null;
        }
    };
});