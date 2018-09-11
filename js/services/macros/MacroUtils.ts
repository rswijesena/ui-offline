import { CONTENT_TYPES } from '../../constants';
import { clone } from '../../services/Utils';
import { getMacroState, setMacroState } from './MacroState';

/**
 * @param typeElementPropertyId
 * @param contentType
 * @param value the value from which the object data property is to be extracted from
 * @description extracting a specific properties content value from some objectdata
 */
export const getProperty = (typeElementPropertyId, contentType, value) => {
    if (value.props.objectData && value.props.objectData.length > 0) {
        const objectData = value.props.objectData[0];
        if (objectData.properties || objectData.properties !== null) {
            const specifiedProperty = objectData.properties.find(property => property.typeElementPropertyId === typeElementPropertyId);
            if (specifiedProperty.contentType !== contentType) {
                throw new Error(`${specifiedProperty.developerName} does not have a content type of ${contentType}`);
            }
            return specifiedProperty.contentValue;
        } else {
            throw new Error(`${value.developerName} has no object data properties`);
        }
    }
};

/**
 * @param typeElementPropertyId
 * @param contentType
 * @param newValue the new value to set to the objects property
 * @param value the value metadata that is to be modified
 * @description setting a specific properties content value from some objectdata
 */
export const setProperty = (typeElementPropertyId, contentType, newValue, value) => {
    if (value.objectData && value.objectData.length > 0) {
        const objectData = value.objectData[0];
        if (objectData.properties || objectData.properties !== null) {
            const specifiedProperty = objectData.properties.find(property => property.typeElementPropertyId === typeElementPropertyId);
            if (specifiedProperty.contentType !== contentType) {
                throw new Error(`${specifiedProperty.developerName} does not have a content type of ${contentType}`);
            }

            // This is to account for setPropertyObject and setPropertyArray
            // both of which I am unsure as to how they work
            if (contentType === CONTENT_TYPES.LIST || contentType === CONTENT_TYPES.OBJECT) {
                specifiedProperty.objectData = newValue;
            } else {
                specifiedProperty.contentValue = newValue;
            }

        } else {
            throw new Error(`${value.developerName} has no object data properties`);
        }
    }

};

/**
 * @param name the value name
 * @param metadata the flow snapshot
 */
export const getValueByName = (name: string, metadata: any) => {
    const MacroState = getMacroState();
    const value =  metadata.valueElements.find(element => element.developerName === name);

    if (!value) {
        throw new Error(`A value with name: ${name}, cannot be found in the flow snapshot`);
    }

    // If the values content value has already been modified
    // whilst offline then we want to return this instaed of the default
    // content value found in the metadata object
    if (MacroState.values[value.id]) {
        return { props: MacroState.values[value.id], id: value.id };
    }

    throw new Error(`A value with name: ${name}, has not been set in state`);
};

/**
 * @param typeId
 * @param metadata
 * @description return object data based on type properties
 */
export const generateNewObjectData = (typeId: string, metadata: any) => {
    const typeElement = clone(metadata.typeElements.find(type => type.id === typeId));

    typeElement.properties = typeElement.properties.map((property) => {
        property.typeElementPropertyId = property.id;
        delete property.id;
        return property;
    });

    return {
        objectData: [typeElement],
    };
};

/**
 * @param id the value id
 * @param value the modifed contentValue/object data for the value
 */
export const setStateValue = (id: string, value: any) => {
    const MacroState = getMacroState();
    const clonedMacroState: any = MacroState;
    if (clonedMacroState.values) {
        clonedMacroState.values[id] = cloneStateValue(value);
        setMacroState(clonedMacroState);
    }
};

/**
 * @param object the modifed contentValue/object data for the value
 */
export const cloneStateValue = (object: any) => {
    return object;
};
