export declare const transferSpheres: {
    fieldMap: any;
    createOnCloud: (actions: any, data: {
        localId: string;
        localData: any;
    }) => any;
    updateOnCloud: (data: {
        localData: any;
        cloudId: any;
    }) => any;
    createLocal: (actions: any, data: {
        localId: string;
        cloudData: any;
    }) => Promise<{}>;
    updateLocal: (actions: any, data: {
        localId: string;
        cloudData: any;
    }) => Promise<{}>;
};
