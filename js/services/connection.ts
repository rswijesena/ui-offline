declare var manywho: any;

const onlineStatus: any = {};

export const hasNetwork = () => {
    const deferred = jQuery.Deferred();

    $.ajax({
        url: manywho.settings.global('platform.uri') + '/api/health',
        timeout: 1000
    })
    .then(() => deferred.resolve(true))
    .fail(() => deferred.resolve(false));

    return deferred;
};

export const isOnline = () => {
    if (manywho.offline.isOffline)
        return ($.Deferred()).resolve(false);

    return manywho.connection.hasNetwork();
};

export const onlineRequest = (event, urlPart, methodType, tenantId, stateId, authenticationToken, request) => {
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

export const offlineRequest = (resolveContext, event, urlPart, request, tenantId, stateId) => {
    const deferred = jQuery.Deferred();

    manywho.offline.getResponse(resolveContext, event, urlPart, request, tenantId, stateId)
        .then(response => {
            deferred.resolveWith(resolveContext, [response]);
        });

    return deferred
        .done(manywho.settings.event(event + '.done'))
        .fail(manywho.connection.onError)
        .fail(manywho.settings.event(event + '.fail'));
};

export const request = (resolveContext, event, urlPart, methodType, tenantId, stateId, authenticationToken, request) => {
    return manywho.connection.isOnline()
        .then(response => {
            if (response)
                return manywho.connection.onlineRequest(event, urlPart, methodType, tenantId, stateId, authenticationToken, request);
            else
                return manywho.connection.offlineRequest(resolveContext, event, urlPart, request, tenantId, stateId);
        });
};
