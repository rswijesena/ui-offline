var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var argv = require('yargs').argv;
var path = require('path');
var requestPromise = require('request-promise');
var fs = require('fs');

function getTask(task) {
    return require('./gulp-tasks/' + task)(gulp, plugins, argv);
}

// Hooks
gulp.task('pre-commit', getTask('hooks/pre-commit'));   

// Dev
gulp.task('dev-less', getTask('dev/less'));
gulp.task('dev-ts', getTask('dev/ts'));

gulp.task('watch', ['dev-ts', 'dev-less'], function() {
    gulp.watch(['js/**/*.*'], ['dev-ts']);
    gulp.watch(['css/**/*.*'], ['dev-less']);
});

// Dist
gulp.task('dist-less', getTask('dist/less'));
gulp.task('dist-ts', getTask('dist/ts'));

gulp.task('dist', ['dist-less', 'dist-ts']);

gulp.task('offline', function() {
    return gulp.src('package.json')
        .pipe(plugins.prompt.prompt([
            {
                type: 'input',
                name: 'username',
                message: 'What is your ManyWho username?'
            },
            {
                type: 'password',
                name: 'password',
                message: 'And your password?'
            },
            {
                type: 'input',
                name: 'flow',
                message: 'What is the name of the Flow you want to make offline?'
            },
        ], function(res) {
            var authenticationToken = null;
            var tenantId = null;

            requestPromise({
                method: "POST",
                uri: "https://flow.manywho.com/api/draw/1/authentication",
                body: {
                    "loginUrl": "https://flow.manywho.com/plugins/manywho/api/draw/1/authentication",
                    "username": res.username,
                    "password": res.password
                },
                headers: {
                    'ManyWhoTenant': 'da497693-4d02-45db-bc08-8ea16d2ccbdf'
                },
                json: true
            })
            .then(function(token) {
                authenticationToken = decodeURIComponent(token);
                var tokens = authenticationToken.split('&');
                
                for (var i = 0; i < tokens.length; i++) {
                    if (tokens[i].indexOf('ManyWhoTenantId') >= 0) {
                        tenantId = tokens[i].split('=')[1];
                        break;
                    }
                }

                return requestPromise({
                    method: "GET",
                    uri: "https://flow.manywho.com/api/run/1/flow?filter=substringof(developername, '" + res.flow + "')",
                    headers: {
                        'ManyWhoTenant': tenantId
                    },
                    json: true
                });      
            })
            .then(function(flows) {
                return requestPromise({
                    method: "GET",
                    uri: "https://flow.manywho.com/api/draw/1/flow/snap/" + flows[0].id.id + "/" + flows[0].id.versionId,
                    headers: {
                        'Authorization': authenticationToken,
                        'ManyWhoTenant': tenantId
                    },
                    json: true
                })
            })
            .then(function(snapshot) {
                fs.writeFileSync('build/metadata.js', 'manywho.offline.metadata = ' + JSON.stringify(snapshot) + ';');
            })
        }));
})
    
