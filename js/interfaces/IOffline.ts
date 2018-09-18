export interface IOfflineState {
    view?: number;
    status?: string;
    progress?: number;
    isCachingObjectData?: boolean;
    isDismissEnabled?: boolean;
    hasInitialized?: boolean;
}

export interface IOfflineProps {
    flowKey: string;
}
