export interface IRequestState {
    isCollapsed: boolean;
    isReplaying: boolean;
    response: any;
}

export interface IRequestProps {
    flowKey: string;
    request: any;
    tenantId: string;
    authenticationToken: string;
    onReplayDone: Function;
    onDelete: Function;
    replayNow: boolean;
    isDisabled: boolean;
}
