/**
 * @description Simulating the engines macro
 * functions for getting and setting values
 */

import { getValueByName, setStateValue, generateNewObjectData, toEngineIsoStringFormat } from './MacroUtils';
import MacroPropertyMethods from './MacroPropertyMethods';

let metadata = null;

// Setting flow snapshot to module scope
const initMethods = (snapshot) => {
    metadata = snapshot;
};

const setDateTimeValue = (value, dateValue) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z ]/g, ''), metadata);

    const valueProperties = {
        contentValue: toEngineIsoStringFormat(dateValue),
        objectData: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

const createObject = (type) => {
    const result = generateNewObjectData(type, metadata);

    function generateResponse() {}

    const macroFunctions: any = bindValuePropertyFunctions();
    for (const key of Object.keys(macroFunctions)) {
        generateResponse.prototype[key] = macroFunctions[key];
    }

    const response = new generateResponse();
    for (const key of Object.keys(result)) {
        response[key] = result[key];
    }
    return response;
};

const getArray = (value) => {
    const listValue = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    const list = listValue.props.objectData;
    const objectData = [];
    list.forEach((obj) => {
        function generateResponse() {}
        const macroFunctions: any = bindValuePropertyFunctions();
        for (const key of Object.keys(macroFunctions)) {
            generateResponse.prototype[key] = macroFunctions[key];
        }
        const response = new generateResponse();
        for (const key of Object.keys(obj)) {
            response[key] = obj[key];
        }
        objectData.push(response);
    });
    return objectData;
};

const getBooleanValue = (value) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    return valueObj.props.contentValue;
};

const getContentValue = (value) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    return valueObj.props.contentValue;
};

const getDateTimeValue = (value) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    return toEngineIsoStringFormat(new Date(valueObj.props.contentValue));
};

const getNumberValue = (value) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    return parseInt(valueObj.props.contentValue, 10);
};

const getObject = (value) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    const objectData = valueObj.props.objectData[0];

    function generateResponse() {}

    const macroFunctions: any = bindValuePropertyFunctions();
    for (const key of Object.keys(macroFunctions)) {
        generateResponse.prototype[key] = macroFunctions[key];
    }

    const response = new generateResponse();
    for (const key of Object.keys(objectData)) {
        response[key] = objectData[key];
    }
    return response;
};

const getPasswordValue = (value) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    return valueObj.props.contentValue;
};

const getStringValue = (value) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    return valueObj.props.contentValue;
};

const getValue = (value) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    return valueObj.props.contentValue;
};

const setArray = (value, objectData) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        objectData,
        contentValue: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

const setBooleanValue = (value, boolean) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        contentValue: boolean,
        objectData: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

const setContentValue = (value, content) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        contentValue: content,
        objectData: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

const setNumberValue = (value, number) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        contentValue: number,
        objectData: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

const setObject = (value, objectData) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        objectData: [objectData],
        contentValue: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

const setPasswordValue = (value, password) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        contentValue: password,
        objectData: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

const setStringValue = (value, string) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        contentValue: string,
        objectData: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

const setValue = (value, string) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        contentValue: string,
        objectData: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

export default {
    initMethods,
    setDateTimeValue,
    createObject,
    getArray,
    getBooleanValue,
    getContentValue,
    getDateTimeValue,
    getNumberValue,
    getObject,
    getPasswordValue,
    getStringValue,
    getValue,
    setArray,
    setBooleanValue,
    setContentValue,
    setNumberValue,
    setObject,
    setPasswordValue,
    setStringValue,
    setValue,
};

/**
 * @param value
 * @description macros use a defined set of functions that are called on list value items
 * to perform operations such as extgetPropertyStringValueratacting certain item properties.
 */
export const bindValuePropertyFunctions = () => {

    return {
        getPropertyValue: MacroPropertyMethods.getPropertyValue,
        getPropertyStringValue: MacroPropertyMethods.getPropertyStringValue,
        getPropertyContentValue: MacroPropertyMethods.getPropertyContentValue,
        getPropertyPasswordValue: MacroPropertyMethods.getPropertyPasswordValue,
        getPropertyNumberValue: MacroPropertyMethods.getPropertyNumberValue,
        getPropertyDateTimeValue: MacroPropertyMethods.getPropertyDateTimeValue,
        getPropertyBooleanValue: MacroPropertyMethods.getPropertyBooleanValue,
        getPropertyArray: MacroPropertyMethods.getPropertyArray,
        getPropertyObject: MacroPropertyMethods.getPropertyObject,
        setPropertyValue: MacroPropertyMethods.setPropertyValue,
        setPropertyStringValue: MacroPropertyMethods.setPropertyStringValue,
        setPropertyContentValue: MacroPropertyMethods.setPropertyContentValue,
        setPropertyPasswordValue: MacroPropertyMethods.setPropertyPasswordValue,
        setPropertyNumberValue: MacroPropertyMethods.setPropertyNumberValue,
        setPropertyDateTimeValue: MacroPropertyMethods.setPropertyDateTimeValue,
        setPropertyBooleanValue: MacroPropertyMethods.setPropertyBooleanValue,
        setPropertyArray: MacroPropertyMethods.setPropertyArray,
        setPropertyObject: MacroPropertyMethods.setPropertyObject,
    };
};
