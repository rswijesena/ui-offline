import { foo } from './StateCaching';
import OfflineCore from './OfflineCore';

declare const manywho: any;
declare const metaData: any;
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
 * Check network availability by pinging the platform's health endpoint `/api/health`
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
 * Check `isOffline` flag first, if that is false then check via `hasNetwork`
 */
export const isOnline = () => {
    if (OfflineCore.isOffline) {
        return ($.Deferred()).resolve(false);
    }

    return hasNetwork(); // Ping engine
};

/**
 * Perform a request to the API in a normal online environment
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

    // We want to cache page component values
    // as the user moves through the flow
    if (stateId && event === 'invoke') {
        const flowKey = manywho.utils.getFlowKey(
            tenantId,
            metaData.id.id,
            metaData.id.versionId,
            stateId,
            'main',
        );
        foo(stateId, flowKey);
    }

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

                if (stateId && authenticationToken) {
                    const url = `${manywho.settings.global('platform.uri')}/api/admin/1/states/${stateId}`;
                    const request = {
                        headers: {
                            Authorization: authenticationToken,
                        },
                    };
                    return fetch(url, request)
                        .then((response) => {
                            console.log(response);
                        });
                }

                // Device is connected to the internet
                return onlineRequest(event, urlPart, methodType, tenantId, stateId, authenticationToken, request);
            }

            // Device is not connected to the internet
            return offlineRequest(resolveContext, event, urlPart, request, tenantId, stateId);
        });
};
