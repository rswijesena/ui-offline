import { getValueByName, setStateValue, generateNewObjectData, toEngineUTCStringFormat } from './MacroUtils';
import MacroPropertyMethods from './MacroPropertyMethods';

let metadata = null;

/**
 * @param snapshot the flow metadata
 * @description defines the flow metatdat object into module scope
 */
const initMethods = (snapshot: any) => {
    metadata = snapshot;
};

/**
 * @param value the value name tag
 * @param dateValue a date time object
 * @description sets a new UTC datetime for a datatime value
 */
const setDateTimeValue = (value: string, dateValue) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z ]/g, ''), metadata);

    const valueProperties = {
        contentValue: toEngineUTCStringFormat(dateValue),
        objectData: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

/**
 * @param type type element ID
 * @description returns a single object based on a type
 */
const createObject = (type: string) => {
    const result = generateNewObjectData(type, metadata);

    function generateResponse() {}

    // Enables calling value property methods on the object data returned
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

/**
 * @param value the value name tag
 * @description returns a list values array of object data
 */
const getArray = (value: string) => {
    const listValue = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    const list = listValue.props.objectData;
    const objectData = [];
    list.forEach((obj) => {
        function generateResponse() {}

        // Enables calling value property methods on the object data returned
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

/**
 * @param value the value name tag
 * @description returns a boolean values content value
 */
const getBooleanValue = (value: string) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    return valueObj.props.contentValue;
};

/**
 * @param value the value name tag
 * @description returns a content values content value
 */
const getContentValue = (value: string) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    return valueObj.props.contentValue;
};

/**
 * @param value the value name tag
 * @description returns a datetime values content value in UTC format
 */
const getDateTimeValue = (value: string) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    return toEngineUTCStringFormat(new Date(valueObj.props.contentValue));
};

/**
 * @param value the value name tag
 * @description returns a number values content value as an integer
 */
const getNumberValue = (value: string) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    return parseInt(valueObj.props.contentValue, 10);
};

/**
 * @param value the value name tag
 * @description returns an object values object data
 */
const getObject = (value: string) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    const objectData = valueObj.props.objectData[0];

    function generateResponse() {}

    // Enables calling value property methods on the object data returned
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

/**
 * @param value the value name tag
 * @description returns a password values content value
 */
const getPasswordValue = (value: string) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    return valueObj.props.contentValue;
};

/**
 * @param value the value name tag
 * @description returns a string values content value
 */
const getStringValue = (value: string) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    return valueObj.props.contentValue;
};

/**
 * @param value the value name tag
 * @description returns any values content value
 */
const getValue = (value: string) => {
    const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
    return valueObj.props.contentValue;
};

/**
 * @param value the value name tag
 * @param objectData object data to set in state
 * @description sets an array of object data to a list value
 */
const setArray = (value: string, objectData: object) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        objectData,
        contentValue: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

/**
 * @param value the value name tag
 * @param boolean true/false
 * @description sets a boolean to a boolean values content value
 */
const setBooleanValue = (value: string, boolean: string | boolean) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        contentValue: boolean,
        objectData: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

/**
 * @param value the value name tag
 * @param content text content
 * @description sets a string to a content values content value
 */
const setContentValue = (value: string, content: string) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        contentValue: content,
        objectData: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

/**
 * @param value the value name tag
 * @param number
 * @description sets a number to a number values content value
 */
const setNumberValue = (value: string, number: string | number) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        contentValue: number,
        objectData: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

/**
 * @param value the value name tag
 * @param objectData
 * @description sets an array of object data to an object value
 */
const setObject = (value: string, objectData: object) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        objectData: [objectData],
        contentValue: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

/**
 * @param value the value name tag
 * @param password
 * @description sets a string to a password values content value
 */
const setPasswordValue = (value: string, password: string) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        contentValue: password,
        objectData: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

/**
 * @param value the value name tag
 * @param string
 * @description sets a string to a string values content value
 */
const setStringValue = (value: string, string: string) => {
    const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

    const valueProperties = {
        contentValue: string,
        objectData: null,
        pageComponentId: null,
    };

    setStateValue(valueObject.id, valueProperties);
};

/**
 * @param value the value name tag
 * @param string
 * @description sets a string to any values content value
 */
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
 * @description returns an object where the key values are value property methods
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
