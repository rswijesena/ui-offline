export interface IFlow {
    authenticationToken?: string;
    id?: string;
    objectData?: any;
    requests?: any;
    state: any;
    tenantId: string;
    cacheObjectData?: Function;
    addRequest?: Function;
    getObjectData?: Function;
}

export interface IState {
    currentMapElementId: string;
    id: string;
    token: string;
    values: any;
    getValue?: Function;
    setValue?: Function;
}
