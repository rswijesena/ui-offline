import OfflineCore from './OfflineCore';

declare const manywho: any;
declare const jQuery: any;
declare const $: any;

const onlineStatus: any = {};

enum EventTypes {
    invoke = 'invoke',
    join = 'join',
    navigation = 'navigation',
    initialization = 'initialization',
}

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
 * Checking boolean flag to determine
 * whether a request should make it to the engine. 
 */
export const isOnline = () => {
    if (OfflineCore.isOffline) {
        return ($.Deferred()).resolve(false);
    }

    return hasNetwork(); // Ping engine
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
export const onlineRequest = (
    event: EventTypes,
    urlPart: string,
    methodType: string,
    tenantId: string,
    stateId: string,
    authenticationToken: string,
    request: any) => {

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
 * Passing the request back to the offline engine
 * to generate the appropriate response.
 * @param resolveContext
 * @param event
 * @param urlPart
 * @param request
 * @param tenantId
 * @param stateId
 */
export const offlineRequest = (resolveContext: any, event: EventTypes, urlPart: string, request: string, tenantId: string, stateId: string) => {
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
 * Intercepts api requests to the engine
 * as the user interacts with the flow so that we can determine
 * if the requests should be cached or not.
 * @param resolveContext
 * @param event
 * @param urlPart
 * @param methodType
 * @param tenantId
 * @param stateId
 * @param authenticationToken
 * @param request
 */
export const request = (
    resolveContext: any,
    event: EventTypes,
    urlPart: string,
    methodType: string,
    tenantId: string,
    stateId: string,
    authenticationToken: string, request: any) => {
    return isOnline()
        .then((response) => {
            if (response) {

                // Device is connected to the internet
                return onlineRequest(event, urlPart, methodType, tenantId, stateId, authenticationToken, request);
            } 

            // Device is not connected to the internet
            return offlineRequest(resolveContext, event, urlPart, request, tenantId, stateId);
        });
};
