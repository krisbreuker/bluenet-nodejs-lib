import { SyncingSphereItemBase } from "./SyncingBase";
export declare class SphereUserSyncer extends SyncingSphereItemBase {
    userId: string;
    userPicture: string;
    downloadPendingInvites(): any;
    download(): any;
    _getLocalData(store: any): any;
    sync(store: any): any;
    syncUp(localSphereUserIdsSynced: any, sphereUsersInState: any): void;
    syncPendingInvites(localSphereUserIdsSynced: any, pendingInvites: any, sphereUsersInState: any): void;
    syncUserTypeDown(localSphereUserIdsSynced: any, sphereUsersInState: any, sphereUsersInCloud: any, type: any): void;
    syncDown(sphereUsersInState: any, sphereUsersInCloud: any): object;
}
