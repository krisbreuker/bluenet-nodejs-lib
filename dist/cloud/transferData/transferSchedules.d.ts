export declare const transferSchedules: {
    fieldMap: any;
    createOnCloud: (actions: any, data: {
        localId: string;
        localData: any;
        localSphereId: string;
        localStoneId: string;
        cloudStoneId: string;
    }) => any;
    updateOnCloud: (data: {
        localId: string;
        localData: any;
        cloudStoneId: string;
        cloudId: string;
    }) => any;
    createLocal: (actions: any, data: {
        localId: string;
        localSphereId: string;
        localStoneId: string;
        cloudData: any;
    }) => Promise<{}>;
    updateLocal: (actions: any, data: {
        localId: string;
        localSphereId: string;
        localStoneId: string;
        cloudData: any;
    }) => Promise<{}>;
};
