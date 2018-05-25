import { SyncingBase } from "./SyncingBase";
export declare class KeySyncer extends SyncingBase {
    userId: string;
    download(): any;
    sync(): any;
    syncDown(keysInCloud: any): void;
}
