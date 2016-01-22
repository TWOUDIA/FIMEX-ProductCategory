/// <binding BeforeBuild='beforeBuild' />
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'bower-files', 'del'],
    replaceString: /\bgulp[\-.]/
});

gulp.task('cleanVendor', function () {
    return plugins.del(['www/js/lib', 'www/css/lib', 'www/fonts', 'www/js/*.min.*', 'www/css/*.min.*']);
});

gulp.task("vendor-files", ['cleanVendor'], function () {

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
        .pipe(gulp.dest('www/fonts'))
        .pipe(fontFilter.restore);
});

gulp.task("annoAPPJSs", ['vendor-files'], function () {

    return gulp.src('www/js/*.js')
        .pipe(plugins.ngAnnotate())
        .pipe(gulp.dest('www/js'));
});

gulp.task("minPackage", ['annoAPPJSs'], function () {

    return gulp.src('www/index-gulp.html')
        .pipe(plugins.rename("index.html"))
        .pipe(plugins.useref({}))
        .pipe(plugins.if('*.js', plugins.uglify()))
        .pipe(plugins.if('*.css', plugins.minifyCss({ keepSpecialComments: 0 })))
        .pipe(gulp.dest('www'));
});

gulp.task('beforeBuild', ['minPackage'], function () {
    return plugins.del(['www/js/lib', 'www/css/lib']);
});