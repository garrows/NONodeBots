var gulp = require('gulp'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    mkdirp = require('mkdirp'),
    rename = require('gulp-rename'),
    shell = require('gulp-shell');

var paths = {
    source: 'src',
    distribution: 'dist',
    components: 'bower_components'
}


gulp.task('scripts', ['components'], function () {
    var stream = gulp.src('')
        .pipe(shell([
            './node_modules/.bin/browserify ' + paths.source + '/scripts/index.js --debug --standalone app --outfile ' + paths.distribution + '/index.js'
        ]));

    if (GLOBAL.livereload) stream.pipe(livereload());

    return stream;
});

gulp.task('styles', function () {
    var stream = gulp.src(paths.source + '/styles/index.less')
        .pipe(less())
        .pipe(rename('styles.css'))
        .pipe(gulp.dest(paths.distribution + '/assets/styles'));

    if (GLOBAL.livereload) stream.pipe(livereload());

    return stream;
});

gulp.task('fonts', function () {
    var stream = gulp.src(
            [
                paths.components + '/bootstrap/fonts/*',
                paths.components + '/font-awesome/fonts/*',
            ])
        .pipe(gulp.dest(paths.distribution + '/assets/fonts'));

    if (GLOBAL.livereload) stream.pipe(livereload());

    return stream;
});

gulp.task('markup', function () {
    var stream = gulp.src(paths.source + '/**/*.html', {
            base: paths.source
        })
        .pipe(gulp.dest(paths.distribution));

    if (GLOBAL.livereload) stream.pipe(livereload());

    return stream;
});

gulp.task('assets', function () {
    var stream = gulp.src(paths.source + '/assets/**/*.*', {
            base: paths.source
        })
        .pipe(gulp.dest(paths.distribution));

    if (GLOBAL.livereload) stream.pipe(livereload());

    return stream;
});

gulp.task('copy-configs', function () {
    return gulp.src(
            [
                paths.source + '/manifest.json',
                paths.source + '/manifest.mobile.json',
                paths.source + '/background.js'
            ])
        .pipe(gulp.dest(paths.distribution));

});

gulp.task('server', function () {
    var stream = gulp.src('')
        .pipe(shell([
            'node server/bin/www'
        ]));

    if (GLOBAL.livereload) stream.pipe(livereload());

    return stream;
});

gulp.task('components', function () {
    return gulp.src([
            paths.components + '/angular/angular.js',
            paths.components + '/angular-route/angular-route.js',
            paths.components + '/jquery/dist/jquery.js',
            paths.components + '/blueimp-canvas-to-blob/js/canvas-to-blob.js',
            paths.components + '/tracking.js/build/tracking.js',
            paths.components + '/tracking.js/build/data/face-min.js',
            paths.components + '/tracking.js/build/data/eye-min.js',
            paths.components + '/tracking.js/build/data/mouth-min.js',
            paths.components + '/underscore/underscore.js'
        ])
        .pipe(concat('components.js', {
            newLine: ';'
        }))
        .pipe(gulp.dest(paths.distribution));
});

gulp.task('watch', function () {
    if (!GLOBAL.livereload) GLOBAL.livereload = require('gulp-livereload');
    livereload.listen();
    // livereload.listen({
    // 
    //     key: 'server/ssl/localhost-key.pem',
    //     cert: 'server/ssl/localhost-cert.pem'
    // 
    // });

    gulp.watch([paths.source + '/scripts/**/*'], ['scripts']);
    gulp.watch([paths.source + '/styles/**/*'], ['styles']);
    gulp.watch([paths.source + '/**/*.html'], ['markup']);
    gulp.watch([paths.source + '/assets/**/*'], ['assets']);

});

gulp.task('build', ['components', 'fonts', 'styles', 'scripts', 'markup', 'assets', 'copy-configs']);
gulp.task('run', ['build', 'server', 'watch']);
gulp.task('default', ['build']);