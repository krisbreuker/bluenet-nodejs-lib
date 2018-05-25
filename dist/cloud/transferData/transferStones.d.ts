export declare const transferStones: {
    fieldMap: any;
    createOnCloud: (actions: any, data: any) => any;
    updateOnCloud: (data: any) => any;
    createLocal: (actions: any, data: any) => Promise<{}>;
    updateLocal: (actions: any, data: any) => Promise<{}>;
    _injectLocationId(data: any): void;
};
