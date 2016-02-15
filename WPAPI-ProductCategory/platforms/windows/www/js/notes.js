angular.module('fimex.notes', [])

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
            "top": 1,
            "title": 'NOTES_20160109_TITLE',
            "content": 'NOTES_20160109_CONTENT'
        }, {
            "id": 3,
            "top": 0,
            "title": 'NOTES_20160211_TITLE',
            "content": 'NOTES_20160211_CONTENT'
        }
    ];
    
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