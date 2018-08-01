const ctx: Worker = self as any;

const executeMacro = (macro, metadata) => {
    const state = {
        setDateTimeValue: (value, operation) => {
            const valueObject = getValueByName(value.replace(/[^a-zA-Z ]/g, ''), metadata);
            return { valueId: valueObject.id, newContentValue: operation };
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
