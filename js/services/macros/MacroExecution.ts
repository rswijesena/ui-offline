import { getMacroState, setMacroState } from './MacroState';
import MacroMethods from './MacroMethods';

/**
 * @param macro the stringified macro
 * @param metadata the flow snapshot
 * @param macroState current state values that offline middleware knows about
 * @description evaluates the macro and returns the modified state values.
 */
export const executeMacro = (macro: string, metadata: any, macroState: any) => {

    setMacroState(macroState);
    MacroMethods.initMethods(metadata);

    // The state object has nothing to do with "state"
    // it is just the naming for special macro functions
    // e.g. state.getArray({!["some value"]})
    // which get passed into the evaluation context
    const state = {
        setDateTimeValue: MacroMethods.setDateTimeValue,
        createObject: MacroMethods.createObject,
        getArray: MacroMethods.getArray,
        getBooleanValue: MacroMethods.getBooleanValue,
        getContentValue: MacroMethods.getContentValue,
        getDateTimeValue: MacroMethods.getDateTimeValue,
        getNumberValue: MacroMethods.getNumberValue,
        getObject: MacroMethods.getObject,
        getPasswordValue: MacroMethods.getPasswordValue,
        getStringValue: MacroMethods.getStringValue,
        getValue: MacroMethods.getValue,
        setArray: MacroMethods.setArray,
        setBooleanValue: MacroMethods.setBooleanValue,
        setContentValue: MacroMethods.setContentValue,
        setNumberValue: MacroMethods.setNumberValue,
        setObject: MacroMethods.setObject,
        setPasswordValue: MacroMethods.setPasswordValue,
        setStringValue: MacroMethods.setStringValue,
        setValue: MacroMethods.setValue,
    };

    Function('"use strict";return (' + macro + ')')()(
        state,
    );

    return getMacroState();
};
