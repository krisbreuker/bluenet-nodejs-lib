import { SyncingSphereItemBase } from "./SyncingBase";
export declare class MessageSyncer extends SyncingSphereItemBase {
    userId: string;
    download(): any;
    _getLocalData(store: any): any;
    sync(store: any): any;
    syncDown(messagesInState: any, messagesInCloud: any): object;
    _getLocalLocationId(cloudId: any): any;
    syncLocalMessageDown(localId: any, messageInState: any, message_from_cloud: any): void;
    _getCloudIdMap(messagesInState: any): {};
}
