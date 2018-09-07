/**
 * @description simulating the engines macro getter
 * and setter functions for value properties
 */

import { CONTENT_TYPES } from '../../constants';
import { getProperty, setProperty } from './MacroUtils';

let value = null;

const initPropertyMethods = (val) => {
    value = val;
};

const getPropertyValue = (typeElementPropertyId) => {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.STRING, value);
};

const getPropertyStringValue = (typeElementPropertyId) => {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.STRING, value);
};

const getPropertyContentValue = (typeElementPropertyId) => {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.CONTENT, value);
};

const getPropertyPasswordValue = (typeElementPropertyId) => {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.PASSWORD, value);
};

const getPropertyNumberValue = (typeElementPropertyId) => {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.NUMBER, value);
};

const getPropertyDateTimeValue = (typeElementPropertyId) => {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.DATETIME, value);
};

const getPropertyBooleanValue = (typeElementPropertyId) => {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.BOOLEAN, value);
};

const getPropertyArray = (typeElementPropertyId) => {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.LIST, value);
};

const getPropertyObject = (typeElementPropertyId) => {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.OBJECT, value);
};

const setPropertyStringValue = (typeElementPropertyId, contentValue) => {
    setProperty(typeElementPropertyId, CONTENT_TYPES.STRING, contentValue, value);
};

const setPropertyContentValue = (typeElementPropertyId, contentValue) => {
    setProperty(typeElementPropertyId, CONTENT_TYPES.CONTENT, contentValue, value);
};

const setPropertyPasswordValue = (typeElementPropertyId, contentValue) => {
    setProperty(typeElementPropertyId, CONTENT_TYPES.PASSWORD, contentValue, value);
};

const setPropertyNumberValue = (typeElementPropertyId, contentValue) => {
    setProperty(typeElementPropertyId, CONTENT_TYPES.NUMBER, contentValue, value);
};

const setPropertyDateTimeValue = (typeElementPropertyId, contentValue) => {
    setProperty(typeElementPropertyId, CONTENT_TYPES.DATETIME, contentValue, value);
};

const setPropertyBooleanValue = (typeElementPropertyId, contentValue) => {
    setProperty(typeElementPropertyId, CONTENT_TYPES.BOOLEAN, contentValue, value);
};

const setPropertyArray = (typeElementPropertyId, objectData) => {
    setProperty(typeElementPropertyId, CONTENT_TYPES.LIST, objectData, value);
};

const setPropertyObject = (typeElementPropertyId, objectData) => {
    setProperty(typeElementPropertyId, CONTENT_TYPES.OBJECT, objectData, value);
};

export default {
    initPropertyMethods,
    getPropertyValue,
    getPropertyStringValue,
    getPropertyContentValue,
    getPropertyPasswordValue,
    getPropertyNumberValue,
    getPropertyDateTimeValue,
    getPropertyBooleanValue,
    getPropertyArray,
    getPropertyObject,
    setPropertyStringValue,
    setPropertyContentValue,
    setPropertyPasswordValue,
    setPropertyNumberValue,
    setPropertyDateTimeValue,
    setPropertyBooleanValue,
    setPropertyArray,
    setPropertyObject,
};
