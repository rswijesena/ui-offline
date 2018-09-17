export interface IOfflineState {
    view?: number;
    status?: string;
    progress?: number;
    isProgressVisible?: boolean;
    isDismissEnabled?: boolean;
    hasInit?: boolean;
}

export interface IOfflineProps {
    flowKey: string;
}
