/// <binding ProjectOpened='vendor-css-combine, vendor-js-combine' />
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
    replaceString: /\bgulp[\-.]/
});
var dest = 'www';

gulp.task("app-js-combine", function () {
    return gulp.src('www/js/*.js')
        .pipe(plugins.replace('/*!', '/*'))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('app.min.js'))
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(dest));
});

gulp.task("vendor-css-combine", function () {
    return gulp.src(['www/lib/ionic/release/css/ionic.css',
        'www/lib/ionic-toast/src/style.css'])
        .pipe(plugins.replace('/*!', '/*'))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('vendor.min.css'))
        .pipe(plugins.minifyCss())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(dest));
});

gulp.task("vendor-js-combine", function () {

    return gulp.src(plugins.mainBowerFiles({
        paths: {
            bowerDirectory: 'www/lib',
            bowerrc: '.bowerrc',
            bowerJson: 'bower.json'
        }
    }))
		.pipe(plugins.filter('*.js'))
        .pipe(plugins.replace('/*!', '/*'))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('vendor.min.js'))
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(dest));
});