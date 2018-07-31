const ctx: Worker = self as any;

const executeMacro = (macro, snapshot) => {
    const state = {
        setDateTimeValue: (value, operation) => {
            const valueObject = snapshot.getValueByName(value.replace(/[^a-zA-Z ]/g, ''));
            return { valueId: valueObject.id, newContentValue: operation };
        },
    };
    return Function('"use strict";return (' + macro + ')')()(
        state,
    );
};

ctx.onmessage = (e) => {
    console.log('Message received from main thread');

    const macroCode = e.data.macro;
    const snapshot = e.data.snapshot;

    const macroResult = executeMacro(
        'function(state){return ' + macroCode + '}',
        snapshot,
    );

    ctx.postMessage(macroResult);
};
