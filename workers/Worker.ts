const ctx: Worker = self as any;

const executeMacro = (macro, metadata) => {

    const state = {
        setDateTimeValue: (value, operation) => {
            const valueObject = getValueByName(value.replace(/[^a-zA-Z ]/g, ''), metadata);
            return { valueId: valueObject.id, newContentValue: operation };
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
            return;
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
            return;
        },
    };

    return Function('"use strict";return (' + macro + ')')()(
        state,
    );
};

const getValueByName = (name: string, metadata: any) => {
    return metadata.valueElements.find(element => element.developerName === name);
};

ctx.onmessage = (e) => {
    console.log('Message received from main thread');
    const parsedResponse = JSON.parse(e.data);
    const macroCode = parsedResponse.macro;
    const metadata = parsedResponse.metadata;
    const macroResult = executeMacro(
        'function(state){return ' + macroCode + '}',
        metadata,
    );

    ctx.postMessage(macroResult);
};
