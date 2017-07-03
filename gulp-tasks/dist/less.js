module.exports = function(gulp, plugins, argv) {
    return function() {
        return gulp.src('css/*.less')
            .pipe(plugins.lesshint())
            .pipe(plugins.lesshint.reporter())
            .pipe(plugins.concat('ui-offline.less'))
            .pipe(plugins.less())
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.cleanCss({
                advanced: true,
                keepSpecialComments: 0,
                processImportFrom: ['!fonts.googleapis.com']
            }))
            .pipe(plugins.rev())
            .pipe(plugins.sourcemaps.write('.'))
            .pipe(gulp.dest(argv.cssDir || './dist/css'));
    }
}