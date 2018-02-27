/// <reference path="../../typings/index.d.ts" />

import Offline from '../services/offline';

declare var manywho: any;

const onlineStatus: any = {};

export const hasNetwork = function() {
    const deferred = jQuery.Deferred();

    $.ajax({
        url: manywho.settings.global('platform.uri') + '/api/health',
        timeout: 1000
    })
    .then(() => deferred.resolve(true))
    .fail(() => deferred.resolve(false));

    return deferred;
};

export const isOnline = function() {
    if (manywho.offline.isOffline)
        return ($.Deferred()).resolve(false);

    return hasNetwork();
};

export const onlineRequest = function(event, urlPart, methodType, tenantId, stateId, authenticationToken, request) {
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
};

export const offlineRequest = function(resolveContext, event, urlPart, request, tenantId, stateId) {
    const deferred = jQuery.Deferred();

    Offline.getResponse(resolveContext, event, urlPart, request, tenantId, stateId)
        .then(response => {
            deferred.resolveWith(resolveContext, [response]);
        });

    return deferred
        .done(manywho.settings.event(event + '.done'))
        .fail(manywho.connection.onError)
        .fail(manywho.settings.event(event + '.fail'));
};

export const request = function(resolveContext, event, urlPart, methodType, tenantId, stateId, authenticationToken, request) {
    return isOnline()
        .then(response => {
            if (response)
                return onlineRequest(event, urlPart, methodType, tenantId, stateId, authenticationToken, request);
            else
                return offlineRequest(resolveContext, event, urlPart, request, tenantId, stateId);
        });
};
