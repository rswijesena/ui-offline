module.exports = function(gulp, plugins) {
    var guppy = require('git-guppy')(gulp);

    var tsProject = plugins.typescript.createProject('tsconfig.json', {
        typescript: require('typescript')
    });

    return  guppy.src('pre-commit', function (files) {
        var typescriptFilter = plugins.filter(['js/components/*.tsx', 'js/services/*.ts'], { restore: true });
        var lessFilter = plugins.filter(['css/*.less']);

        return gulp.src(files)
            .pipe(typescriptFilter)
            .pipe(plugins.tslint({
                formatter: 'verbose',
            }))
            .pipe(plugins.tslint.report({
                summarizeFailureOutput: true
            }))
            .pipe(typescriptFilter.restore)
            .pipe(lessFilter)
            .pipe(plugins.lesshint())
            .pipe(plugins.lesshint.reporter())
            .pipe(plugins.lesshint.failOnError());
    });
}