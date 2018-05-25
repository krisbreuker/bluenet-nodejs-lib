import { SyncingBase } from "./SyncingBase";
export declare class UserSyncer extends SyncingBase {
    userId: string;
    download(): any;
    sync(store: any): any;
    syncDown(userInState: any, userInCloud: any): void;
}
