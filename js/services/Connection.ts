import OfflineCore from './OfflineCore';

declare const manywho: any;
declare const jQuery: any;
declare const $: any;

const onlineStatus: any = {};

/**
 * Check network availability by pinging the platform
 */
export const hasNetwork = () => {
    const deferred = jQuery.Deferred();

    $.ajax({
        url: manywho.settings.global('platform.uri') + '/api/health',
        timeout: 1000,
    })
    .then(() => deferred.resolve(true))
    .fail(() => deferred.resolve(false));

    return deferred;
};

/**
 * Checking if device is online
 */
export const isOnline = () => {
    if (OfflineCore.isOffline) {
        return ($.Deferred()).resolve(false);
    }

    return hasNetwork();
};

/**
 * Making an ajax call to the engine for
 * when the device is online
 * @param event
 * @param urlPart
 * @param methodType
 * @param tenantId
 * @param stateId
 * @param authenticationToken
 * @param request
 */
export const onlineRequest = (event, urlPart, methodType, tenantId, stateId, authenticationToken, request) => {
    let json = null;

    if (request != null) {
        json = JSON.stringify(request);
    }

    return $.ajax({
        url: manywho.settings.global('platform.uri') + urlPart,
        type: methodType,
        dataType: 'json',
        contentType: 'application/json',
        processData: true,
        data: json,
        beforeSend: (xhr) => {
            manywho.connection.beforeSend.call(this, xhr, tenantId, authenticationToken, event, request);
            if (manywho.utils.isNullOrWhitespace(stateId) === false) {
                xhr.setRequestHeader('ManyWhoState', stateId);
            }
        },
    })
        .done(manywho.settings.event(event + '.done'))
        .fail(manywho.connection.onError)
        .fail(manywho.settings.event(event + '.fail'));
};

/**
 * @param resolveContext
 * @param event
 * @param urlPart
 * @param request
 * @param tenantId
 * @param stateId
 */
export const offlineRequest = (resolveContext, event, urlPart, request, tenantId, stateId) => {
    const deferred = jQuery.Deferred();

    OfflineCore.getResponse(resolveContext, event, urlPart, request, tenantId, stateId)
        .then((response) => {
            deferred.resolveWith(resolveContext, [response]);
        });

    return deferred
        .done(manywho.settings.event(event + '.done'))
        .fail(manywho.connection.onError)
        .fail(manywho.settings.event(event + '.fail'));
};

/**
 * Overides the default request function inside ui-core
 * @param resolveContext
 * @param event
 * @param urlPart
 * @param methodType
 * @param tenantId
 * @param stateId
 * @param authenticationToken
 * @param request
 */
export const request = (resolveContext, event, urlPart, methodType, tenantId, stateId, authenticationToken, request) => {
    return isOnline()
        .then((response) => {
            if (response) {
                return onlineRequest(event, urlPart, methodType, tenantId, stateId, authenticationToken, request);
            } 
            return offlineRequest(resolveContext, event, urlPart, request, tenantId, stateId);
        });
};
