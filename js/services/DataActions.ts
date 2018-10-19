import ObjectData from './ObjectData';
import { cacheObjectData, getObjectData } from '../models/Flow';
import { getStateValue, setStateValue } from '../models/State';
import { IFlow } from '../interfaces/IModels';
import { clone, guid } from '../services/Utils';

/**
 * Support for executing data actions offline
 */
const DataActions = {

    /**
     * Execute the data action (`Load` or `Save`) and update the local state.
     * `Delete` data actions aren't currently supported.
     * @param action
     * @param flow
     * @param snapshot
     */
    execute: (action: any, flow: IFlow, snapshot: any) => {

        const objectData = getObjectData(
            action.objectDataRequest.objectDataType ?
            action.objectDataRequest.objectDataType.typeElementId :
            action.objectDataRequest.typeElementId,
        );

        switch (action.crudOperationType.toUpperCase()) {
        case 'LOAD':
            const filteredObjectData = ObjectData.filter(objectData, action.objectDataRequest.listFilter, action.objectDataRequest.typeElementId);
            const value = snapshot.getValue(action.valueElementToApplyId);
            setStateValue(action.valueElementToApplyId, value.typeElementId, snapshot, filteredObjectData);
            break;

        case 'SAVE':
            const valueReferenceToSave = snapshot.getValue(action.valueElementToApplyId);
            const typeElementId = valueReferenceToSave.typeElementId;
            const type = typeElementId ? snapshot.metadata.typeElements.find(typeElement => typeElement.id === typeElementId) : null;

            const valueToSave = getStateValue(
                action.valueElementToApplyId,
                typeElementId,
                valueReferenceToSave.contentType,
                null,
            );

            valueToSave.objectData.map((obj) => {

                // TODO: think will actually need to do a diff on all the
                // objectdata properties as just checking the internal id
                // will not support an update scenario
                const existsInCache = objectData.find(
                    existingObj => existingObj.internalId === obj.internalId,
                );

                if (!existsInCache) {
                    const newObject = [{
                        typeElementId,
                        externalId: null,
                        internalId: guid(),
                        developerName: obj.developerName,
                        order: 0,
                        isSelected: false,
                        properties: clone(type.properties).map((property) => {
                            const newProp = obj.properties.filter(
                                prop => prop.typeElementPropertyId === property.id,
                            );
                            if (newProp.length > 0) {
                                property.contentValue = newProp[0].contentValue ? newProp[0].contentValue : null;
                                property.objectData = newProp[0].objectData ? newProp[0].objectData : null;
                                property.typeElementPropertyId = newProp[0].typeElementPropertyId ? newProp[0].typeElementPropertyId : null;
                            }
                            return property;
                        }),
                    }];

                    cacheObjectData(newObject, typeElementId);
                }
            });

            break;

        case 'DELETE':
            // No implementation for a delete as its potential very destructive
            break;
        }

        return flow.state;
    },
};

export default DataActions;
