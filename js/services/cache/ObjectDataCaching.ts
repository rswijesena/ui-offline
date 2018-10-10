import { IFlow } from '../../interfaces/IModels';
import { cacheObjectData } from '../../models/Flow';
import { clone } from '../Utils';
import store from '../../stores/store';
import { cachingProgress } from '../../actions';
import OnCached from './OnCached';

declare const manywho: any;
declare const metaData: any;

let objectDataCachingTimer;

export const onCached = (flow: IFlow) => {
    const flowKey = manywho.utils.getFlowKey(
        flow.tenantId,
        flow.id.id,
        flow.id.versionId,
        flow.state.id,
        'main',
    );
    const pollInterval = manywho.settings.global(
        'offline.cache.objectDataCachingInterval',
        flowKey,
    );

    objectDataCachingTimer = setTimeout(
        () => { ObjectDataCaching(flow); }, pollInterval,
    );
};

/**
 * @param flow
 * @description retrieve object data request responses from the engine
 * and set them in the flow model and insert them update indexdb
 */
const ObjectDataCaching = (flow: IFlow) => {

    clearTimeout(objectDataCachingTimer);

    const initRequests = generateObjectData();

    if (!initRequests || initRequests.length === 0) {
        return false;
    }

    const executeRequest = function (
        req: any,
        reqIndex: number,
        flow: IFlow,
        currentTypeElementId: null) {

        let requests = req;

        if (reqIndex >= requests.length) {
            objectDataCachingTimer = OnCached(flow);
            return;
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
            .then(() => {
                const ind = reqIndex + 1;
                store.dispatch(cachingProgress(Math.round(Math.min((ind / requests.length) * 100, 100))));
                executeRequest(requests, ind, flow, currentTypeElementId);
            })
            .fail((xhr, status, error) => {
                store.dispatch(cachingProgress(100));
                alert('An error caching data has occured, your flow may not work as expected whilst offline');
            });
    };
    executeRequest(initRequests, 0, flow, null);
    return true;
};

/**
 * @description extracting page element object data requests and flow data actions
 * from the snapshot to determine what object data requests to make
 */
export const generateObjectData = () => {
    const objectDataRequests = {};

    // Find page components that use object data e.g a table
    if (metaData.pageElements) {
        metaData.pageElements.forEach((page) => {
            (page.pageComponents || [])
                .filter(component => component.objectDataRequest)
                .forEach(component => objectDataRequests[component.objectDataRequest.typeElementId] = component.objectDataRequest);
        });
    }

    // Find data actions that load data from external resources as object data
    if (metaData.mapElements) {
        metaData.mapElements.forEach((element) => {
            (element.dataActions || [])
                .filter(action => manywho.utils.isEqual(action.crudOperationType, 'load', true) && action.objectDataRequest)
                .forEach(action => objectDataRequests[action.objectDataRequest.typeElementId] = action.objectDataRequest);
        });
    }

    const requests = Object.keys(objectDataRequests)
        .map(key => objectDataRequests[key])
        .map(getObjectDataRequest)
        .map(getChunkedObjectDataRequests);

    return requests.concat.apply([], requests);
};

/**
 * @param request
 * @description Constructs an object data request object
 * based on the generated metadata properties
 */
export const getObjectDataRequest = (request: any) => {
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
};

/**
 * @param request
 * @description Splits a single request into multiple requests if the `limit` on the `listFilter` of the request
 * is higher than the `offline.cache.requests.pageSize` setting
 */
export const getChunkedObjectDataRequests = (request: any) => {
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
};

export default ObjectDataCaching;
