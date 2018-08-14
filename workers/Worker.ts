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
            return;
        },
        getBooleanValue: (value) => {
            return;
        },
        getContentValue: (value) => {
            return;
        },
        getDateTimeValue: (value) => {
            return;
        },
        getNumberValue: (value) => {
            return;
        },
        getObject: (value) => {
            return;
        },
        getPasswordValue: (value) => {
            return;
        },
        getStringValue: (value) => {
            return;
        },
        getValue: (value) => {
            const valueObj = getValueByName(value.replace(/[^a-zA-Z0-9 ]/g, ''), metadata);
            if (valueObj.props) {
                return valueObj.props.contentValue;
            }
            return valueObj.defaultContentValue;
        },
        setArray: (value, objectData) => {
            return;
        },
        setBooleanValue: (value, boolean) => {
            return;
        },
        setContentValue: (value, content) => {
            return;
        },
        setNumberValue: (value, number) => {
            return;
        },
        setObject: (value, objectData) => {
            return;
        },
        setPasswordValue: (value, password) => {
            return;
        },
        setStringValue: (value, string) => {
            return;
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
