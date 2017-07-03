module.exports = function(gulp, plugins, argv) {
    return function() {
        var tsProject = plugins.typescript.createProject('tsconfig.json', {
            typescript: require('typescript')
        });

        return gulp.src(['js/services/offline.ts', 'js/services/*.ts'], { base: 'js' })
            .pipe(plugins.sourcemaps.init())
            .pipe(tsProject())
            .pipe(plugins.uglify({
                preserveComments: 'license'
            }).on('error', plugins.util.log))
            .pipe(plugins.rev())
            .pipe(plugins.sourcemaps.write('.'))
            .pipe(gulp.dest(argv.jsDir || './dist/js'));   
    }
}