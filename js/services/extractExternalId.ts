import { getRequests, getObjectData } from '../models/Flow';

declare const manywho;

interface IassocData {
    offlineId: string;
    valueId: string;
    typeElementId: string;
}

/**
 * @param assocData an object containing a GUID that links requests to objectdata
 * @param externalId the ID assigned to a value that represents a service record
 * @description
 */
const checkForRequestsThatNeedAnExternalId = (assocData: IassocData, externalId: string) => {

    // Find the objectdata in the cache that is associated to the request
    const objectData = getObjectData(assocData.typeElementId);
    const assocObject = objectData.filter(obj => obj.assocData).find(obj => obj.assocData.offlineId === assocData.offlineId);

    // Extract it's internalId
    const assocObjectInternalId = assocObject.objectData.internalId;

    // Then find every request that has a page input response that has specified objectdata
    // where an object has an enternal id of null and has a matching internal id to the object
    const allRequests = getRequests();
    allRequests.forEach((request) => {
        const inputResponses = request.request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses;
        inputResponses.forEach((inputResponse) => {
            if (inputResponse.objectData && inputResponse.objectData.length > 0) {
                inputResponse.objectData.forEach((obj) => {
                    if (obj.externalId === null && obj.internalId === assocObjectInternalId) {

                        // Update the matching object data with the external id
                        obj.externalId = externalId;
                    }
                });
            }
        });
    });
};

/**
 * @param request the request being replayed
 * @param tenantId
 * @param authenticationToken
 * @param stateId
 * @description
 */
const extractExternalId = (request: any, tenantId: string, authenticationToken: string, stateId: string) => {

    if (request.assocData) {
        const valueId = request.assocData.valueId;
        const url = `${manywho.settings.global('platform.uri')}/api/run/1/state/${stateId}/values/${valueId}`;
        const valueRequest = {
            headers: {
                ManyWhoTenant: tenantId,
            },
        };
        if (authenticationToken) {
            valueRequest.headers['Authorization'] = authenticationToken;
        }
        return fetch(url, valueRequest)
            .then((response) => {
                return response.json();
            })
            .then((response) => {

                checkForRequestsThatNeedAnExternalId(
                    request.assocData,
                    response.objectData[0].externalId,
                );
                return response;
            })
            .catch(response => console.error(response));
    }

    return Promise.resolve(request);
};

export default extractExternalId;
