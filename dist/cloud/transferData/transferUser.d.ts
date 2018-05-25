export declare const transferUser: {
    fieldMap: any;
    updateOnCloud: (data: {
        localData: any;
        cloudId: string;
    }) => void;
    updateLocal: (actions: any, data: {
        cloudData: any;
    }) => Promise<{}>;
};
