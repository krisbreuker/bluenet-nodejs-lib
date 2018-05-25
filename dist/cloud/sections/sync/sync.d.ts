/**
 * We claim the cloud is leading for the availability of items.
 * @param store
 * @returns {Promise.<TResult>|*}
 */
export declare const sync: {
    __currentlySyncing: boolean;
    sync: (store: any, background?: boolean) => Promise<{}> | Promise<void>;
};
