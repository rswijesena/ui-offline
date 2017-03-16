/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

const onlineStatus: any = {};

manywho.connection = class Connection {

    static isOnline() {
        const override = manywho.settings.global('offline.isOnline');
        if (override !== undefined)
            return ($.Deferred()).resolve(override);

        return $.ajax({
            url: manywho.settings.global('platform.uri') + '/api/health',
            timeout: 1000
        })
        .then(() => true)
        .fail(() => false);
    }

    static beforeSend(xhr, tenantId, authenticationToken, event, request) {
        xhr.setRequestHeader('ManyWhoTenant', tenantId);

        if (authenticationToken)
            xhr.setRequestHeader('Authorization', authenticationToken);

        if (manywho.settings.event(event + '.beforeSend'))
            manywho.settings.event(event + '.beforeSend').call(this, xhr, request);
    }

    static getOnlineDeferred(event, urlPart, methodType, tenantId, stateId, authenticationToken, request) {
        let json = null;

        if (request != null)
            json = JSON.stringify(request);

        return $.ajax({
                url: manywho.settings.global('platform.uri') + urlPart,
                type: methodType,
                dataType: 'json',
                contentType: 'application/json',
                processData: true,
                data: json,
                beforeSend: xhr => {
                    manywho.connection.beforeSend.call(this, xhr, tenantId, authenticationToken, event, request);

                    if (manywho.utils.isNullOrWhitespace(stateId) === false)
                        xhr.setRequestHeader('ManyWhoState', stateId);
                }
            })
            .done(manywho.settings.event(event + '.done'))
            .fail(manywho.connection.onError)
            .fail(manywho.settings.event(event + '.fail'));
    }

    static getOfflineDeferred(resolveContext, event, urlPart, request) {
        const deferred = jQuery.Deferred();

        manywho.offline.getResponse(request, resolveContext)
            .then(response => {
                deferred.resolveWith(resolveContext, [response]);
            });

        return deferred
            .done(manywho.settings.event(event + '.done'))
            .fail(manywho.connection.onError)
            .fail(manywho.settings.event(event + '.fail'));
    }

    static getDeferred(resolveContext, event, urlPart, methodType, tenantId, stateId, authenticationToken, request) {
        return manywho.connection.isOnline()
            .then(isOnline => {
                return isOnline ?
                    manywho.connection.getOnlineDeferred(event, urlPart, methodType, tenantId, stateId, authenticationToken, request) :
                    manywho.connection.getOfflineDeferred(resolveContext, event, urlPart, request);
            });
    }

};
