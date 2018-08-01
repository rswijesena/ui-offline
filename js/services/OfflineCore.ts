import { addRequest, FlowInit, getObjectData, cacheObjectData } from '../models/Flow';
import DataActions from './DataActions';
import ObjectData from './ObjectData';
import { executeOperation, invokeMacroWorker } from './Operation';
import { getPageContainers, flattenContainers, generatePage } from './Page';
import Rules from './Rules';
import Snapshot from './Snapshot';
import Step from './Step';
import { StateUpdate } from '../models/State';
import { getOfflineData, removeOfflineData, setOfflineData } from './Storage';
import { IFlow } from '../interfaces/IModels';
import { clone, flatten, guid } from '../services/Utils';

declare const manywho: any;
declare const metaData: any;
declare const localforage: any;
declare const $: any;

enum EventTypes {
    invoke = 'invoke',
    join = 'join',
    navigation = 'navigation',
    initialization = 'initialization',
}

const OfflineCore = {

    requests: null,
    isOffline: false,

    /**
     * Called when the flow is toggled to offline mode.
     * Metadata elements are iterated over to generate an array of request objects (objectDataRequests).
     * We finish by instantiating a flow object.
     * @param tenantId
     * @param stateId
     * @param stateToken
     * @param authenticationToken
     */
    initialize(tenantId: string, stateId: string, stateToken: string, authenticationToken: string) {
        if (!metaData) {
            return;
        }

        const objectDataRequests = {};

        if (metaData.pageElements) {
            metaData.pageElements.forEach((page) => {
                (page.pageComponents || [])
                    .filter(component => component.objectDataRequest)
                    .forEach(component => objectDataRequests[component.objectDataRequest.typeElementId] = component.objectDataRequest);
            });
        }

        if (metaData.mapElements) {
            metaData.mapElements.forEach((element) => {
                (element.dataActions || [])
                    .filter(action => manywho.utils.isEqual(action.crudOperationType, 'load', true) && action.objectDataRequest)
                    .forEach(action => objectDataRequests[action.objectDataRequest.typeElementId] = action.objectDataRequest);
            });
        }

        const requests = Object.keys(objectDataRequests)
            .map(key => objectDataRequests[key])
            .map(this.getObjectDataRequest)
            .map(this.getChunkedObjectDataRequests);

        this.requests = requests.concat.apply([], requests);

        const flow = {
            authenticationToken,
            tenantId,
            state: {
                id: stateId,
                token: stateToken,
            },
            id: metaData.id,
        };

        return removeOfflineData(stateId)
            .then(() => setOfflineData(flow))
            .then(() => FlowInit(flow));
    },

    /**
     * Returns an object data request object during initilisation,
     * based on the generated metadata properties
     * @param request
     */
    getObjectDataRequest(request: any) {
        const objectDataRequest: any = {
            authorization: null,
            configurationValues: null,
            command: null,
            culture: {
                id: null,
                developerName: null,
                developerSummary: null,
                brand: null,
                language: 'EN',
                country: 'USA',
                variant: null,
            },
            stateId: '00000000-0000-0000-0000-000000000000',
            token: null,
            listFilter: request.listFilter || {},
        };

        objectDataRequest.listFilter.limit = manywho.settings.global('offline.cache.requests.limit', null, 250);

        const typeElement = metaData.typeElements.find(element => element.id === request.typeElementId);

        objectDataRequest.typeElementBindingId = typeElement.bindings[0].id;
        objectDataRequest.objectDataType = {
            typeElementId: typeElement.id,
            developerName: typeElement.developerName,
            properties: typeElement.properties.map((property) => {
                return {
                    developerName: property.developerName,
                };
            }),
        };

        return objectDataRequest;
    },

    /**
     * Splits a single request into multiple requests if the `limit` on the `listFilter` of the request
     * is higher than the `offline.cache.requests.pageSize` setting
     * @param request
     */
    getChunkedObjectDataRequests(request: any) {
        const pageSize = manywho.settings.global('offline.cache.requests.pageSize', null, 10);
        const iterations = Math.ceil(request.listFilter.limit / pageSize);
        const pages = [];

        for (let i = 0; i < iterations; i += 1) {
            const page = clone(request);
            page.listFilter.limit = pageSize;
            page.listFilter.offset = i * pageSize;
            pages.push(page);
        }

        return pages;
    },

    /**
     * Invoking the flow once the user has come back online
     * @param flowKey
     */
    rejoin(flowKey: string) {
        const tenantId = manywho.utils.extractTenantId(flowKey);
        const flowId = manywho.utils.extractFlowId(flowKey);
        const flowVersionId = manywho.utils.extractFlowVersionId(flowKey);
        const element = manywho.utils.extractElement(flowKey);
        const stateId = manywho.utils.extractStateId(flowKey);
        const authenticationToken = manywho.state.getAuthenticationToken(flowKey);

        return manywho.engine.join(tenantId, flowId, flowVersionId, element, stateId, authenticationToken, manywho.settings.flow(null, flowKey));
    },

    /**
     * Execute every data load in the flow and cache the responses locally
     * @param flow
     * @param onProgress
     * @param onDone
     */
    cacheObjectData(flow: IFlow, onProgress, onDone) {
        if (!this.requests || this.requests.length === 0) {
            return false;
        }

        const executeRequest = function (
            req: any,
            reqIndex: number,
            flow: IFlow,
            currentTypeElementId: null,
            onProgress: Function,
            onDone: Function) {

            let requests = req;

            if (reqIndex >= requests.length) {
                return setOfflineData(flow)
                    .then(onDone);
            }

            const request = requests[reqIndex];
            request.stateId = flow.state.id;

            return manywho.ajax.dispatchObjectDataRequest(request, flow.tenantId, flow.state.id, flow.authenticationToken, request.listFilter.limit)
                .then((response) => {
                    if (response.objectData) {
                        cacheObjectData(response.objectData, request.objectDataType.typeElementId);
                    } else {
                        requests = requests.filter(item => !item.objectDataType.typeElementId === currentTypeElementId);
                    }

                    return response;
                })
                .then((response) => {
                    const indy = reqIndex + 1;
                    onProgress(indy, requests.length);
                    executeRequest(requests, indy, flow, currentTypeElementId, onProgress, onDone);
                });
        };
        executeRequest(this.requests, 0, flow, null, onProgress, onDone);
        return true;
    },

    /**
     * Determine how to handle api request to engine
     * based on the type of event is defined
     * @param context
     * @param event
     * @param urlPart
     * @param request
     * @param tenantId
     * @param stateId
     */
    getResponse(context: any, event: EventTypes, urlPart: string, request: any, tenantId: string, stateId: string) {

        // When running a flow in debug mode, calls to the
        // logging endpoint are being intercepted, this handles that.
        if (manywho.utils.isEqual(event, 'log')) {
            return Promise.resolve();
        }

        let flowStateId = stateId;
        if (request && request.stateId) {
            flowStateId = request.stateId;
        } else if (manywho.utils.isEqual(event, 'join', true)) {
            flowStateId = urlPart.substr(urlPart.lastIndexOf('/') + 1);
        } else if (manywho.utils.isEqual(event, 'initialization', true)) {
            flowStateId = '00000000-0000-0000-0000-000000000000';
        }

        return getOfflineData(flowStateId)
            .then((response) => {
                if (manywho.utils.isEqual(event, 'initialization')) {
                    const flow = FlowInit({
                        tenantId,
                        state: {
                            currentMapElementId: metaData.mapElements.find(element => element.elementType === 'START').id,
                            id: stateId,
                            token: guid(),
                        },
                    });

                    return setOfflineData(flow)
                        .then(() => flow);
                }
                return FlowInit(response);
            })
            .then((flow) => {
                if (manywho.utils.isEqual(event, 'join', true)) {
                    return this.getMapElementResponse(
                        {
                            invokeType: 'JOIN',
                            currentMapElementId: flow.state.currentMapElementId,
                        },
                        flow,
                        context,
                    );
                }
                if (manywho.utils.isEqual(event, 'initialization', true)) {
                    return this.getInitializationResponse(request, flow, context);
                }
                if (request.mapElementInvokeRequest) {
                    return this.getMapElementResponse(request, flow, context);
                }
                if (request.navigationElementId) {
                    return this.getNavigationResponse(request, flow, context);
                }
                return this.getObjectDataResponse(request, flow, context);
            });
    },

    /**
     * @param request
     * @param flow
     * @param context
     */
    getInitializationResponse(request: any, flow: IFlow, context: any) {
        const snapshot: any = Snapshot(metaData);

        return {
            currentMapElementId: metaData.mapElements.find(element => element.elementType === 'START').id,
            currentStreamId: null,
            navigationElementReferences : snapshot.getNavigationElementReferences(),
            stateId: flow.state.id,
            stateToken: flow.state.token,
            statusCode: '200',
        };
    },

    /**
     * Handling map element requests by imitating the expected response
     * the UI would get when online.
     * @param request
     * @param flow
     * @param context
     */
    getMapElementResponse(request: any, flow: IFlow, context: any) {
        if (!metaData) {
            return;
        }

        const deferred = $.Deferred();

        const mapElement: any = request.currentMapElementId ?
            metaData.mapElements.find(element => element.id === request.currentMapElementId) :
            metaData.mapElements.find(element => element.elementType === 'START');
        let nextMapElement = null;

        switch (request.invokeType.toUpperCase()) {
        case 'FORWARD':
            let nextMapElementId = null;
            let outcome = null;

            if (request.mapElementInvokeRequest.selectedOutcomeId) {
                outcome = mapElement.outcomes.find(item => item.id === request.mapElementInvokeRequest.selectedOutcomeId);
            } else if (request.selectedMapElementId) {
                nextMapElementId = request.selectedMapElementId;
            } else {
                outcome = mapElement.outcomes[0];
            }

            if (outcome) {
                nextMapElementId = outcome.nextMapElementId;
            }

            nextMapElement = metaData.mapElements.find(element => element.id === nextMapElementId);
            break;

        case 'NAVIGATE':
            const navigation = metaData.navigationElements.find(element => element.id === request.navigationElementId);
            const navigationItem = navigation.navigationItems.find(item => item.id === request.selectedNavigationItemId);
            nextMapElement = metaData.mapElements.find(element => element.id === navigationItem.locationMapElementId);
            break;

        case 'JOIN':
            nextMapElement = mapElement;
            break;

        case 'SYNC':
            nextMapElement = mapElement;
            break;
        }

        const snapshot: any = Snapshot(metaData);

        if (manywho.utils.isEqual(mapElement.elementType, 'input', true) || manywho.utils.isEqual(mapElement.elementType, 'step', true)) {
            addRequest(request, snapshot);
        }

        if (mapElement.elementType === 'input'
            && request.mapElementInvokeRequest
            && request.mapElementInvokeRequest.pageRequest
            && request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses) {
            StateUpdate(request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses, mapElement, snapshot);
        }

        if (nextMapElement.dataActions) {
            nextMapElement.dataActions
                .filter(action => !action.disabled)
                .sort((a, b) => a.order - b.order)
                .forEach((action) => {
                    DataActions.execute(action, flow, snapshot);
                });
        }

        const asyncOperations = [];

        if (nextMapElement.operations) {
            nextMapElement.operations
                .sort((a, b) => a.order - b.order)
                .forEach((operation) => {
                    if (operation.macroElementToExecuteId) {
                        asyncOperations.push(
                            invokeMacroWorker(operation, snapshot),
                        );
                    } else {
                        asyncOperations.push(
                            executeOperation(operation, flow.state, snapshot),
                        );
                    }
                });

            return Promise.all(asyncOperations).then(() => {
                return this.constructResponse(
                    nextMapElement,
                    request,
                    snapshot,
                    flow,
                    context,
                );
            });
        }
        return this.constructResponse(
            nextMapElement,
            request,
            snapshot,
            flow,
            context,
        );
    },

    constructResponse(nextMapElement, request, snapshot, flow, context) {
        let pageResponse = null;
        if (nextMapElement.elementType === 'step') {
            pageResponse = Step.generate(nextMapElement, snapshot);
        } else if (nextMapElement.elementType === 'input') {
            pageResponse = generatePage(request, nextMapElement, flow.state, snapshot, flow.tenantId);
        } else if (!nextMapElement.outcomes || nextMapElement.outcomes.length === 0) {
            pageResponse = {
                developerName: 'done',
                mapElementId: nextMapElement.id,
            };
        }

        if (nextMapElement.outcomes && !pageResponse) {
            return setOfflineData(flow)
                .then(() => {
                    return OfflineCore.getResponse(
                        context, null, null,
                        {
                            currentMapElementId: nextMapElement.id,
                            mapElementInvokeRequest: {
                                selectedOutcomeId: Rules.getOutcome(nextMapElement.outcomes, flow.state, snapshot).id,
                            },
                            invokeType: 'FORWARD',
                            stateId: request.stateId,
                        },
                        request.tenantId,
                        request.stateId,
                    );
                });
        }

        flow.state.currentMapElementId = nextMapElement.id;
        setOfflineData(flow);

        return {
            currentMapElementId: nextMapElement.id,
            invokeType: nextMapElement.outcomes ? 'FORWARD' : 'DONE',
            mapElementInvokeResponses: [pageResponse],
            navigationElementReferences: snapshot.getNavigationElementReferences(),
            stateId: request.stateId,
            stateToken: request.stateToken,
            statusCode: '200',
        };
    },

    /**
     * @param request
     * @param flow
     * @param context
     */
    getObjectDataResponse(request: any, flow: IFlow, context: any) {
        return ObjectData.filter(
            getObjectData(request.objectDataType ? request.objectDataType.typeElementId : request.typeElementId),
            request.listFilter,
        );
    },

    /**
     * @param request
     * @param flow
     * @param context
     */
    getNavigationResponse(request: any, flow: IFlow, context: any) {
        if (!metaData) {
            return;
        }

        const navigation = metaData.navigationElements[0];
        return {
            developerName: navigation.developerName,
            isEnabled: true,
            isVisible: true,
            label: navigation.label,
            navigationItemResponses: navigation.navigationItems,
            navigationItemDataResponses: flatten(navigation.navigationItems, null, [], 'navigationItems', null).map((item) => {
                return {
                    navigationItemId: item.id,
                    navigationItemDeveloperName: item.developerName,
                    isActive: false,
                    isCurrent: item.locationMapElementId === flow.state.currentMapElementId,
                    isEnabled: true,
                    isVisible: true,
                    locationMapElementId: item.locationMapElementId,
                };
            }),
        };
    },
};

export default OfflineCore;

manywho.settings.initialize({
    offline: {
        cache: {
            requests: {
                limit: 250,
                pageSize: 10,
            },
        },
    },
});
