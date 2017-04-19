var requestPromise = require('request-promise');
var fsp = require('fs-promise');

module.exports = function(gulp, plugins, argv) {
    return function() {
        var baseUrl = argv.baseUrl || 'https://flow.manywho.com';
        var authenticationToken = null;
        var tenantId = null;
        
        return requestPromise({
            method: "POST",
            uri: baseUrl + "/api/draw/1/authentication",
            body: {
                "loginUrl": baseUrl + "/plugins/manywho/api/draw/1/authentication",
                "username": argv.username,
                "password": argv.password
            },
            headers: {
                'ManyWhoTenant': 'da497693-4d02-45db-bc08-8ea16d2ccbdf'
            },
            json: true
        })
        .then(function(token) {
            authenticationToken = token;
            var tokens = decodeURIComponent(token).split('&');
            
            for (var i = 0; i < tokens.length; i++) {
                if (tokens[i].indexOf('ManyWhoTenantId') >= 0) {
                    tenantId = tokens[i].split('=')[1];
                    break;
                }
            }

            return requestPromise({
                method: "GET",
                uri: baseUrl + "/api/run/1/flow?filter=substringof(developername, '" + argv.flow + "')",
                headers: {
                    'ManyWhoTenant': tenantId
                },
                json: true
            });      
        })
        .then(function(flows) {
            return requestPromise({
                method: "GET",
                uri: baseUrl + "/api/draw/1/flow/snap/" + flows[0].id.id + "/" + flows[0].id.versionId,
                headers: {
                    'authorization': authenticationToken,
                    'ManyWhoTenant': tenantId
                }
            })
        })
        .then(function(snapshot) {
            return fsp.writeFile('js/services/metadata.ts', `manywho.offline.metadata = JSON.parse(\`${snapshot.replace('`', '\`')}\`);\n`);
        });
    }
};