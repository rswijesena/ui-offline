module.exports = function(gulp, plugins, argv) {
    return function() {
        var tsProject = plugins.typescript.createProject('tsconfig.json', {
            typescript: require('typescript')
        });

        return gulp.src(['js/services/offline.ts', 'js/services/*.ts', 'js/components/*.tsx'], { base: 'js' })
            .pipe(plugins.tslint({
                formatter: 'verbose',
            }))
            .pipe(plugins.tslint.report({
                summarizeFailureOutput: true,
                emitError: false
            }))
            .pipe(plugins.addSrc(['js/lib/*.*']))
            .pipe(plugins.sourcemaps.init())
            .pipe(tsProject())
            .pipe(plugins.sourcemaps.write())
            .pipe(gulp.dest(argv.jsDir || 'build/js'));
    }
};