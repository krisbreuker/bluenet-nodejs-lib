import { SyncingSphereItemBase } from "./SyncingBase";
export declare class LocationSyncer extends SyncingSphereItemBase {
    userId: string;
    download(): any;
    _getLocalData(store: any): any;
    sync(store: any): any;
    syncDown(locationsInState: any, locationsInCloud: any): object;
    syncChildren(localId: any, localLocation: any, location_from_cloud: any): void;
    syncUsersInLocation(localLocationId: any, localLocation: any, location_from_cloud: any): void;
    syncUp(store: any, locationsInState: any, localLocationIdsSynced: any): void;
    syncLocalLocationUp(store: any, localLocation: any, localLocationId: any, hasSyncedDown?: boolean): void;
    propagateRemoval(store: any, locationId: any): void;
    _downloadLocationImage(localId: any, cloudId: any, imageId: any): void;
    syncLocalLocationDown(localId: any, locationInState: any, location_from_cloud: any): void;
    _getCloudIdMap(locationsInState: any): {};
    _searchForLocalMatch(locationsInState: any, locationInCloud: any): string;
}
