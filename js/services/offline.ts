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
        const page = manywho.utils.clone(request);
        page.listFilter.limit = pageSize;
        page.listFilter.offset = i * pageSize;
        pages.push(page);
    }

    return pages;
}

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
    }
});

manywho.offline = class Offline {

    static metadata: any = null;
    static requests = null;

    static initialize(stateToken) {
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

        return manywho.offline.storage.setState({ token: stateToken })
            .then(manywho.offline.storage.clearRequests);
    }

    static replay(tenantId, stateId, authenticationToken, onFault: Function, onDone, onFail, onProgress, index) {
        const replayRequest = function(requests, index, tenantId, stateId, stateToken, authenticationToken, onDone, onFail, onProgress) {
            const request = requests[index];
            request.stateId = stateId;
            request.stateToken = stateToken;

            return manywho.ajax.invoke(request, tenantId, authenticationToken)
                .then(response => {
                    if (response && response.mapElementInvokeResponses && response.mapElementInvokeResponses[0].rootFaults) {
                        onFault && onFault(response, index);
                        return;
                    }
                    else {
                        index++;
                        if (index < requests.length) {
                            onProgress && onProgress(index, requests.length);
                            replayRequest(requests, index, tenantId, stateId, stateToken, authenticationToken, onDone, onFail, onProgress);
                        }
                        else
                            onDone && onDone();
                    }
                })
                .fail((xhr, status, error) => {
                    onFail && onFail(error, index);
                });
        };

        let state = null;

        manywho.offline.storage.getState()
            .then(response => state = new manywho.offline.state(response))
            .then(manywho.offline.storage.getRequests)
            .then(requests => {
                if (requests && requests.length > 0)
                    replayRequest(requests, index || 0, tenantId, stateId, state.token, authenticationToken, onDone, onFail, onProgress);
                else
                    onDone && onDone();
            });
    }

    static rejoin(flowKey) {
        const tenantId = manywho.utils.extractTenantId(flowKey);
        const flowId = manywho.utils.extractFlowId(flowKey);
        const flowVersionId = manywho.utils.extractFlowVersionId(flowKey);
        const element = manywho.utils.extractElement(flowKey);
        const stateId = manywho.utils.extractStateId(flowKey);
        const authenticationToken = manywho.state.getAuthenticationToken(stateId);

        return manywho.engine.join(tenantId, flowId, flowVersionId, element, stateId, authenticationToken, manywho.settings.flow(null, flowKey));
    }

    static cacheObjectData(stateId, tenantId, authenticationToken, onProgress) {
        if (!manywho.offline.requests || manywho.offline.requests.length === 0)
            return false;

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
        return true;
    }

    static getResponse(request, context) {
        if (request.mapElementInvokeRequest)
            return manywho.offline.getMapElementResponse(request, context);
        else if (request.navigationElementId)
            return manywho.offline.getNavigationResponse(request, context);
        else
            return manywho.offline.getObjectDataResponse(request, context);
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
                if (manywho.utils.isEqual(mapElement.elementType, 'input', true) || manywho.utils.isEqual(mapElement.elementType, 'step', true))
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
            })
            .then(() => manywho.offline.storage.setState(state))
            .then(() => {
                if (nextMapElement.elementType === 'step')
                    pageResponse = manywho.offline.step.generate(nextMapElement);
                else if (nextMapElement.elementType === 'input')
                    pageResponse = manywho.offline.page.generate(request, nextMapElement, state, snapshot);
                else if (!nextMapElement.outcomes || nextMapElement.outcomes.length === 0)
                    pageResponse = {
                        developerName: 'done',
                        mapElementId: nextMapElement.id,
                    };
                else if (nextMapElement.outcomes)
                    return manywho.offline.getResponse({
                        currentMapElementId: nextMapElement.id,
                        mapElementInvokeRequest: {
                            selectedOutcomeId: manywho.offline.rules.getOutcome(nextMapElement.outcomes, state, snapshot).id
                        },
                        invokeType: 'FORWARD'
                    });
            })
            .then(response => {
                if (response)
                    return response;

                state.currentMapElementId = nextMapElement.id;
                manywho.offline.storage.setState(state);

                return {
                    currentMapElementId: nextMapElement.id,
                    invokeType: nextMapElement.outcomes ? 'FORWARD' : 'DONE',
                    mapElementInvokeResponses: [pageResponse],
                    navigationElementReferences: snapshot.getNavigationElementReferences(),
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

    static getNavigationResponse(request, context) {
        if (!manywho.offline.metadata)
            return;

        let state = null;

        return manywho.offline.storage.getState()
            .then(response => state = new manywho.offline.state(response))
            .then(() => {
                const navigation = manywho.offline.metadata.navigationElements[0];
                return {
                    developerName: navigation.developerName,
                    isEnabled: true,
                    isVisible: true,
                    label: navigation.label,
                    navigationItemResponses: navigation.navigationItems,
                    navigationItemDataResponses: manywho.utils.flatten(navigation.navigationItems, null, [], 'navigationItems', null).map(item => {
                        return {
                            navigationItemId: item.id,
                            navigationItemDeveloperName: item.developerName,
                            isActive: false,
                            isCurrent: item.locationMapElementId === state.currentMapElementId,
                            isEnabled: true,
                            isVisible: true,
                            locationMapElementId: item.locationMapElementId
                        };
                    })
                };
            });
    }
};
