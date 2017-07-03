var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var argv = require('yargs').argv;

function getTask(task) {
    return require('./gulp-tasks/' + task)(gulp, plugins, argv);
}

// Hooks
gulp.task('pre-commit', getTask('hooks/pre-commit'));   

// Dev
gulp.task('dev-less', getTask('dev/less'));
gulp.task('dev-ts', getTask('dev/ts'));
gulp.task('metadata', getTask('dev/metadata'));

gulp.task('watch', ['dev-ts', 'dev-less'], function() {
    gulp.watch(['js/**/*.*'], ['dev-ts']);
    gulp.watch(['css/**/*.*'], ['dev-less']);
});

// Dist
gulp.task('dist-less', ['dist-clean'], getTask('dist/less'));
gulp.task('dist-ts', getTask('dist/ts'));

gulp.task('dist-bundle', ['dist-ts', 'dist-less'], function() {
    return gulp.src(['css/*.css', 'js/*.js'], { cwd: './dist' })
        .pipe(plugins.filelist('bundle.json'))
        .pipe(plugins.jsonEditor(resources => {
            return {
                'offline': resources.map(resource => '/' + resource)
            }
        }))
        .pipe(gulp.dest('./dist'));  
});

gulp.task('dist-clean', function() {
    return del('./dist/**/*');
})

gulp.task('dist', ['dist-bundle']);
