import { clone } from '../../services/Utils';

const currentState: any = {};

export const getMacroState = () => {
    return clone(currentState);
};

export const setMacroState = (state) => {
    for (const key of Object.keys(state)) {
        currentState[key] = state[key];
    }
};
