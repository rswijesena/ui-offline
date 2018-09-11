/**
 * @description simulating the engines macro getter
 * and setter functions for value properties
 */

import { CONTENT_TYPES } from '../../constants';
import { getProperty, setProperty } from './MacroUtils';

function getPropertyValue(typeElementPropertyId) {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.STRING, this);
}

function getPropertyStringValue(typeElementPropertyId) {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.STRING, this);
}

function getPropertyContentValue(typeElementPropertyId) {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.CONTENT, this);
}

function getPropertyPasswordValue(typeElementPropertyId) {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.PASSWORD, this);
}

function getPropertyNumberValue(typeElementPropertyId) {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.NUMBER, this);
}

function getPropertyDateTimeValue(typeElementPropertyId) {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.DATETIME, this);
}

function getPropertyBooleanValue(typeElementPropertyId) {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.BOOLEAN, this);
}

function getPropertyArray(typeElementPropertyId) {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.LIST, this);
}

function getPropertyObject(typeElementPropertyId) {
    return getProperty(typeElementPropertyId, CONTENT_TYPES.OBJECT, this);
}

function setPropertyValue(typeElementPropertyId, contentValue) {
    setProperty(typeElementPropertyId, CONTENT_TYPES.STRING, contentValue, this);
}

function setPropertyStringValue(typeElementPropertyId, contentValue) {
    setProperty(typeElementPropertyId, CONTENT_TYPES.STRING, contentValue, this);
}

function setPropertyContentValue(typeElementPropertyId, contentValue) {
    setProperty(typeElementPropertyId, CONTENT_TYPES.CONTENT, contentValue, this);
}

function setPropertyPasswordValue(typeElementPropertyId, contentValue) {
    setProperty(typeElementPropertyId, CONTENT_TYPES.PASSWORD, contentValue, this);
}

function setPropertyNumberValue(typeElementPropertyId, contentValue) {
    setProperty(typeElementPropertyId, CONTENT_TYPES.NUMBER, contentValue, this);
}

function setPropertyDateTimeValue(typeElementPropertyId, contentValue) {
    setProperty(typeElementPropertyId, CONTENT_TYPES.DATETIME, contentValue, this);
}

function setPropertyBooleanValue(typeElementPropertyId, contentValue) {
    setProperty(typeElementPropertyId, CONTENT_TYPES.BOOLEAN, contentValue, this);
}

function setPropertyArray(typeElementPropertyId, objectData) {
    setProperty(typeElementPropertyId, CONTENT_TYPES.LIST, objectData, this);
}

function setPropertyObject(typeElementPropertyId, objectData) {
    setProperty(typeElementPropertyId, CONTENT_TYPES.OBJECT, objectData, this);
}

export default {
    getPropertyValue,
    getPropertyStringValue,
    getPropertyContentValue,
    getPropertyPasswordValue,
    getPropertyNumberValue,
    getPropertyDateTimeValue,
    getPropertyBooleanValue,
    getPropertyArray,
    getPropertyObject,
    setPropertyValue,
    setPropertyStringValue,
    setPropertyContentValue,
    setPropertyPasswordValue,
    setPropertyNumberValue,
    setPropertyDateTimeValue,
    setPropertyBooleanValue,
    setPropertyArray,
    setPropertyObject,
};
