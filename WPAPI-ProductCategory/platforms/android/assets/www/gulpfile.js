/// <binding />
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'bower-files', 'del'],
    replaceString: /\bgulp[\-.]/
});

gulp.task('cleanVendor', function () {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return plugins.del(['www/js/lib/**/*', 'www/css/lib/**/*', 'www/css/fonts/**/*']);
});

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
    return gulp.src('www/css/lib/*.css')
        //.pipe(plugins.replace('/*!', '/*'))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('vendor.min.css'))
        .pipe(plugins.minifyCss())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest('www/css'));
});

gulp.task("vendor-js-combine", function () {

    return gulp.src('www/js/lib/*.js')
        //.pipe(plugins.replace('/*!', '/*'))
        .pipe(plugins.resolveDependencies({
            pattern: /\* @requires [\s-]*(.*\.js)/g
        }))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('vendor.min.js'))
        //.pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest('www/js'));
});

gulp.task("vendor-files-copy", ['cleanVendor'], function () {

    var jsFilter = plugins.filter('*.js', { restore: true }),
     cssFilter = plugins.filter('*.css', { restore: true }),
     fontFilter = plugins.filter('*.+(eot|woff|ttf|svg)', { restore: true });

    return gulp.src(plugins.bowerFiles({ dir: 'lib' })
        .self()
            .dev()
            .ext(['js', 'css', 'eot', 'woff', 'ttf', 'svg'])
            .match('!**/*.min.*')
            .files)

        .pipe(jsFilter)
        .pipe(gulp.dest('www/js/lib'))
        .pipe(jsFilter.restore)

        .pipe(cssFilter)
        .pipe(gulp.dest('www/css/lib'))
        .pipe(cssFilter.restore)

        .pipe(fontFilter)
        .pipe(gulp.dest('www/css/fonts'))
        .pipe(fontFilter.restore);
});