/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;
declare var localforage: LocalForage;

function getObjectDataRequest(request) {
    const objectDataRequest: any = {
        authorization: null,
        configurationValues: null,
        command: null,
        culture: {
            'id': null,
            'developerName': null,
            'developerSummary': null,
            'brand': null,
            'language': 'EN',
            'country': 'USA',
            'variant': null
        },
        stateId: '00000000-0000-0000-0000-000000000000',
        token: null,
        listFilter: request.listFilter || {}
    };

    objectDataRequest.listFilter.limit = manywho.settings.global('offline.cache.requests.limit', null, 250);

    const typeElement = manywho.offline.metadata.typeElements.find(element => element.id === request.typeElementId);

    objectDataRequest.typeElementBindingId = typeElement.bindings[0].id;
    objectDataRequest.objectDataType = {
        typeElementId: typeElement.id,
        developerName: typeElement.developerName,
        properties: typeElement.properties.map(property => {
            return {
                developerName: property.developerName
            };
        })
    };

    return objectDataRequest;
}

function getChunkedObjectDataRequests(request) {
    const pageSize = manywho.settings.global('offline.cache.requests.pageSize', null, 10);
    const iterations = Math.ceil(request.listFilter.limit / pageSize);
    const pages = [];

    for (let i = 0; i < iterations; i++) {
        const page = JSON.parse(JSON.stringify(request));
        page.listFilter.limit = pageSize;
        page.listFilter.offset = i * pageSize;
        pages.push(page);
    }

    return pages;
}

const Queue = function () {
    let previous: any = $.Deferred().resolve();

    return function (fn, fail) {
        return previous = previous.then(fn, fail || fn);
    };
};

manywho.settings.initialize({
    offline: {
        isEnabled: true,
        cache: {
            requests: {
                limit: 250,
                pageSize: 10
            }
        },
        storage: {
            drivers: ['asyncStorage', 'webSQLStorage']
        }
    },
    platform: {
        uri: 'https://flow.manywho.com'
    }
});

manywho.offline = class Offline {

    static metadata: any = null;
    static requests = null;

    static initialize() {
        if (!manywho.offline.metadata)
            return;

        let objectDataRequests = {};

        if (manywho.offline.metadata.pageElements)
            manywho.offline.metadata.pageElements.forEach(page => {
                (page.pageComponents || [])
                    .filter(component => component.objectDataRequest)
                    .forEach(component => objectDataRequests[component.objectDataRequest.typeElementId] = component.objectDataRequest);
            });

        if (manywho.offline.metadata.mapElements)
            manywho.offline.metadata.mapElements.forEach(element => {
                (element.dataActions || [])
                    .filter(action => manywho.utils.isEqual(action.crudOperationType, 'load', true) && action.objectDataRequest)
                    .forEach(action => objectDataRequests[action.objectDataRequest.typeElementId] = action.objectDataRequest);
            });

        manywho.offline.requests = Object.keys(objectDataRequests)
            .map(key => objectDataRequests[key])
            .map(getObjectDataRequest)
            .map(getChunkedObjectDataRequests);

        manywho.offline.requests = manywho.offline.requests.concat.apply([], manywho.offline.requests);

        manywho.offline.storage.setState({});
    }

    static replay(tenantId, stateId, authenticationToken, onDone, onFail, onProgress) {
        const replayRequest = function(requests, index, tenantId, stateId, authenticationToken, onDone, onFail, onProgress) {
            const request = requests[index];
            request.stateId = stateId;
            return manywho.ajax.invoke(request, tenantId, authenticationToken)
                .then(response => {
                    index++;
                    if (index < requests.length) {
                        onProgress && onProgress(index, requests.length);
                        replayRequest(requests, index, tenantId, stateId, authenticationToken, onDone, onFail, onProgress);
                    }
                    else
                        onDone && onDone();
                })
                .fail(onFail);
        };

        manywho.offline.storage.getRequests()
            .then(requests => {
                replayRequest(requests, 0, tenantId, stateId, authenticationToken, onDone, onFail, onProgress);
            });
    }

    static cacheObjectData(stateId, tenantId, authenticationToken, onProgress) {
        if (!manywho.offline.requests)
            return;

        const executeRequest = function(requests, index, tenantId, authenticationToken, onProgress, currentTypeElementId) {
            if (index >= requests.length) {
                onProgress(1, 0);
                return;
            }

            let request = requests[index];
            request.stateId = stateId;

            let clear = null;
            if (currentTypeElementId !== request.objectDataType.typeElementId) {
                currentTypeElementId = request.objectDataType.typeElementId;
                clear = manywho.offline.storage.clearObjectData(request.objectDataType.typeElementId);
            }
            else
                clear = $.Deferred().resolve();

            clear.then(() => manywho.ajax.dispatchObjectDataRequest(request, tenantId, authenticationToken, request.listFilter.limit))
                .then(response => {
                    if (response.objectData)
                        return manywho.offline.storage.appendObjectData(response.objectData, request.objectDataType.typeElementId);
                    else {
                        requests = requests.filter(item => !item.objectDataType.typeElementId === currentTypeElementId);
                        const deferred = $.Deferred();
                        return deferred.resolve(response);
                    }
                })
                .then(response => {
                    index++;
                    onProgress(index, requests.length);
                    executeRequest(requests, index, tenantId, authenticationToken, onProgress, currentTypeElementId);
                });
        };

        executeRequest(manywho.offline.requests, 0, tenantId, authenticationToken, onProgress, null);
    }

    static getResponse(request, context) {
        return request.mapElementInvokeRequest ?
            manywho.offline.getMapElementResponse(request, context) :
            manywho.offline.getObjectDataResponse(request, context);
    }

    static getMapElementResponse(request, context) {
        if (!manywho.offline.metadata)
            return;

        const deferred = $.Deferred();

        if (!request.invokeType)
            return deferred.resolveWith(context, [{
                currentMapElementId: manywho.offline.metadata.mapElements.filter(element => element.elementType === 'START').id,
                stateId: '00000000-0000-0000-0000-000000000000'
            }]);

        let mapElement = request.currentMapElementId ?
            manywho.offline.metadata.mapElements.find(element => element.id === request.currentMapElementId) :
            manywho.offline.metadata.mapElements.find(element => element.elementType === 'START');
        let nextMapElement = null;

        switch (request.invokeType.toUpperCase()) {
            case 'FORWARD':
                let outcome = request.mapElementInvokeRequest.selectedOutcomeId ?
                    mapElement.outcomes.find(item => item.id === request.mapElementInvokeRequest.selectedOutcomeId) :
                    mapElement.outcomes[0];

                nextMapElement = manywho.offline.metadata.mapElements.find(element => element.id === outcome.nextMapElementId);
                break;

            case 'NAVIGATE':
                const navigation = manywho.offline.metadata.navigationElements.find(element => element.id === request.navigationElementId);
                const navigationItem = navigation.navigationItems.find(item => item.id === request.selectedNavigationItemId);
                nextMapElement = manywho.offline.metadata.mapElements.find(element => element.id === navigationItem.locationMapElementId);
                break;
        }

        let snapshot = new manywho.offline.snapshot(manywho.offline.metadata);
        let state = null;
        let pageResponse = null;

        return manywho.offline.storage.getState()
            .then(response => state = new manywho.offline.state(response))
            .then(() => {
                if (manywho.utils.isEqual(request.invokeType, 'FORWARD', true) || manywho.utils.isEqual(request.invokeType, 'NAVIGATE', true))
                    return manywho.offline.storage.saveRequest(request);
            })
            .then(() => {
                if (request.mapElementInvokeRequest && request.mapElementInvokeRequest.pageRequest)
                    state.update(request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses, mapElement, snapshot);

                if (nextMapElement.dataActions)
                    nextMapElement.dataActions
                        .sort((a, b) => a.order - b.order)
                        .filter(action => !action.disabled)
                        .forEach(action => {
                            state = manywho.offline.dataActions.execute(action, state, snapshot);
                        });

                if (nextMapElement.operations)
                    nextMapElement.operations
                        .sort((a, b) => a.order - b.order)
                        .forEach(operation => {
                            state = manywho.offline.operation.execute(operation, state, snapshot);
                        });

                if (nextMapElement.elementType === 'step')
                    pageResponse = manywho.offline.step.generate(nextMapElement);
                else if (nextMapElement.elementType === 'input')
                    pageResponse = manywho.offline.page.generate(request, nextMapElement, state, snapshot);
                else if (nextMapElement.outcomes)
                    return manywho.offline.getResponse({
                        currentMapElementId: nextMapElement.id,
                        mapElementInvokeRequest: {
                            selectedOutcomeId: manywho.offline.rules.getOutcome(nextMapElement.outcomes, state, snapshot)
                        }
                    });
                else if (!nextMapElement.outcomes || nextMapElement.outcomes.length === 0)
                    pageResponse = {
                        developerName: 'done',
                        mapElementId: nextMapElement.id,
                    };
            })
            .then(() => manywho.offline.storage.setState(state.values))
            .then(() => {
                return {
                    currentMapElementId: nextMapElement.id,
                    invokeType: nextMapElement.outcomes ? 'FORWARD' : 'DONE',
                    mapElementInvokeResponses: [pageResponse],
                    stateId: request.stateId,
                    stateToken: request.stateToken,
                    statusCode: '200'
                };
            });
    }

    static getObjectDataResponse(request, context) {
        return manywho.offline.storage.getObjectData(request.typeElementId)
            .then(objectData => manywho.offline.objectdata.filter(objectData, request.listFilter));
    }
};
