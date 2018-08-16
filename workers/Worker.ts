const ctx: Worker = self as any;

let currentState = null;

const executeMacro = (macro, metadata) => {

    const state = {
        setDateTimeValue: (value, operation) => {
            const valueObject = getValueByName(value.replace(/[^a-zA-Z ]/g, ''), metadata);

            const valueProperties = {
                contentValue: operation,
                objectData: null,
                pageComponentId: null,
            };

            setStateValue(valueObject.id, valueProperties);
        },
        createObject: (type) => {
            return;
        },
        getArray: (value) => {
            const listValue = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
            listValue.defaultObjectData.forEach((value) => {
                const macroFunctions: any = bindFunctions(value);
                for (const key of Object.keys(macroFunctions)) {
                    value[key] = macroFunctions[key];
                }
            });

            return listValue.defaultObjectData;
        },
        getBooleanValue: (value) => {
            const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
            if (valueObj.props) {
                return valueObj.props.contentValue;
            }
            return valueObj.defaultContentValue;
        },
        getContentValue: (value) => {
            const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
            if (valueObj.props) {
                return valueObj.props.contentValue;
            }
            return valueObj.defaultContentValue;
        },
        getDateTimeValue: (value) => {
            const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
            if (valueObj.props) {
                return valueObj.props.contentValue;
            }
            return valueObj.defaultContentValue;
        },
        getNumberValue: (value) => {
            const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
            if (valueObj.props) {
                return valueObj.props.contentValue;
            }
            return valueObj.defaultContentValue;
        },
        getObject: (value) => {
            const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
            if (valueObj.props) {
                return valueObj.props.contentValue;
            }
            return valueObj.defaultContentValue;
        },
        getPasswordValue: (value) => {
            const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
            if (valueObj.props) {
                return valueObj.props.contentValue;
            }
            return valueObj.defaultContentValue;
        },
        getStringValue: (value) => {
            const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
            if (valueObj.props) {
                return valueObj.props.contentValue;
            }
            return valueObj.defaultContentValue;
        },
        getValue: (value) => {
            const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
            if (valueObj.props) {
                return valueObj.props.contentValue;
            }
            return valueObj.defaultContentValue;
        },
        setArray: (value, objectData) => {
            const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

            const valueProperties = {
                objectData,
                contentValue: null,
                pageComponentId: null,
            };

            setStateValue(valueObject.id, valueProperties);
        },
        setBooleanValue: (value, boolean) => {
            const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

            const valueProperties = {
                contentValue: boolean,
                objectData: null,
                pageComponentId: null,
            };

            setStateValue(valueObject.id, valueProperties);
        },
        setContentValue: (value, content) => {
            const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

            const valueProperties = {
                contentValue: content,
                objectData: null,
                pageComponentId: null,
            };

            setStateValue(valueObject.id, valueProperties);
        },
        setNumberValue: (value, number) => {
            const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

            const valueProperties = {
                contentValue: number,
                objectData: null,
                pageComponentId: null,
            };

            setStateValue(valueObject.id, valueProperties);
        },
        setObject: (value, objectData) => {
            const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

            const valueProperties = {
                objectData,
                contentValue: null,
                pageComponentId: null,
            };

            setStateValue(valueObject.id, valueProperties);
        },
        setPasswordValue: (value, password) => {
            const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

            const valueProperties = {
                contentValue: password,
                objectData: null,
                pageComponentId: null,
            };

            setStateValue(valueObject.id, valueProperties);
        },
        setStringValue: (value, string) => {
            const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

            const valueProperties = {
                contentValue: string,
                objectData: null,
                pageComponentId: null,
            };

            setStateValue(valueObject.id, valueProperties);
        },
        setValue: (value, string) => {
            const valueObject = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);

            const valueProperties = {
                contentValue: string,
                objectData: null,
                pageComponentId: null,
            };

            setStateValue(valueObject.id, valueProperties);
        },
    };

    Function('"use strict";return (' + macro + ')')()(
        state,
    );

    return currentState;
};

/**
 * @param value
 * @description macros use a defined set of functions that are called on list value items
 * to perform operations such as extratacting certain item properties.
 */
const bindFunctions = (value) => {
    return {
        getPropertyStringValue: (typeElementPropertyId) => {
            const listItem = value.properties.find(property => property.typeElementPropertyId === typeElementPropertyId);
            return listItem.contentValue;
        },
        getPropertyValue: (typeElementPropertyId) => {},
        getPropertyContentValue: (typeElementPropertyId) => {},
        getPropertyPasswordValue: (typeElementPropertyId) => {},
        getPropertyNumberValue: (typeElementPropertyId) => {},
        getPropertyDateTimeValue: (typeElementPropertyId) => {},
        getPropertyBooleanValue: (typeElementPropertyId) => {},
        getPropertyArray: (typeElementPropertyId) => {},
        getPropertyObject: (typeElementPropertyId) => {},
        setProperty: (typeElementPropertyId, contentValue) => {},
    };
};

const getValueByName = (name: string, metadata: any) => {
    const value =  metadata.valueElements.find(element => element.developerName === name);

    // If the values content value has already been modified
    // whilst offline then we want to return this instaed of the default
    // content value found in the metadata object
    if (currentState.values[value.id]) {
        return { props: currentState.values[value.id], id: value.id };
    }
    return value;
};

const setStateValue = (id: string, value: any) => {
    currentState.values[id] = cloneStateValue(value);
};

const cloneStateValue = (object) => {
    return object;
};

ctx.onmessage = (e) => {
    const parsedResponse = JSON.parse(e.data);

    currentState = parsedResponse.state;

    const macroResult = executeMacro(
        'function(state){ ' + parsedResponse.macro + '}',
        parsedResponse.metadata,
    );
    ctx.postMessage(macroResult);
};
