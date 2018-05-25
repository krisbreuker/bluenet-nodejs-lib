import { SyncingBase } from "./SyncingBase";
export declare class FirmwareBootloaderSyncer extends SyncingBase {
    userId: string;
    downloadFirmware(): any;
    downloadBootloader(): any;
    sync(store: any): any;
    syncDownFirmware(userInState: any, firmwaresInCloud: any): void;
    syncDownBootloader(userInState: any, bootloadersInCloud: any): void;
}
