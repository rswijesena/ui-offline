module.exports = function(gulp, plugins, argv) {
    return function() {
        return gulp.src(['css/*.less'])
            .pipe(plugins.lesshint())
            .pipe(plugins.lesshint.reporter())
            .pipe(plugins.concat('ui-offline.less'))
            .pipe(plugins.less())
            .pipe(gulp.dest((argv.build || 'build') + '/css'));
    }
};