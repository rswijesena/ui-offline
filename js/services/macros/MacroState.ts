/**
 * Getting and setting state values
 * in the context of a macro execution
 */

let currentState = null;

export const getMacroState = () => {
    return currentState;
};

export const setMacroState = (state) => {
    currentState = state;
};
