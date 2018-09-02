import { CONTENT_TYPES } from '../../constants';
import { getMacroState, setMacroState } from './MacroState';

// Extract a specific property value from object data
export const getProperty = (typeElementPropertyId, contentType, value) => {
    if (value.properties || value.properties !== null) {
        const specifiedProperty = value.properties.find(property => property.typeElementPropertyId === typeElementPropertyId);
        if (specifiedProperty.contentType !== contentType) {
            throw new Error(`${specifiedProperty.developerName} does not have a content type of ${contentType}`);
        }
        return specifiedProperty.contentValue;
    } else {
        throw new Error(`${value.developerName} has no object data properties`);
    }
};

// TODO
export const setProperty = (typeElementPropertyId, contentType, contentValue, value) => {
    if (value.properties || value.properties !== null) {
        const specifiedProperty = value.properties.find(property => property.typeElementPropertyId === typeElementPropertyId);
        if (specifiedProperty.contentType !== contentType) {
            throw new Error(`${specifiedProperty.developerName} does not have a content type of ${contentType}`);
        }

        if (contentType === CONTENT_TYPES.LIST || contentType === CONTENT_TYPES.OBJECT) {
            specifiedProperty.objectData = contentValue;
        } else {
            specifiedProperty.contentValue = contentValue;
        }

        const valueProperties = {
            objectData: value,
            contentValue: null,
            pageComponentId: null,
        };

        setStateValue(value.id, valueProperties);

    } else {
        throw new Error(`${value.developerName} has no object data properties`);
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
    return value;
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
