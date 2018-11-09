import { getRequests, getObjectData } from '../models/Flow';

declare const manywho;

/**
 * @param offlineId the GUID that links cached requests to objectdata
 * @param externalId the ID assigned to a value that represents a service record
 * @description
 */
const checkForRequestsThatNeedAnExternalId = (offlineId: string, externalId: string) => {

    // Find the objectdata in the cache that is associated to the request
    const objectData = getObjectData('3523c7ce-15ee-4b6a-9976-ff0f099c4ba4'); // TODO get the type element id from somewhere
    const assocObject = objectData.find(obj => obj.offlineId === offlineId);

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

    if (request.offlineId) { // TODO get the value id in url from somewhere
        const url = `${manywho.settings.global('platform.uri')}/api/run/1/state/${stateId}/values/2cdb838d-24e7-4687-8a31-e24f7985d535`;
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
                    request.offlineId,
                    response.objectData[0].externalId,
                );
                return response;
            })
            .catch(response => console.error(response));
    }

    return Promise.resolve(request);
};

export default extractExternalId;
