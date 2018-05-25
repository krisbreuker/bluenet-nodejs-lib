import { SyncingSphereItemBase } from "./SyncingBase";
export declare class StoneSyncer extends SyncingSphereItemBase {
    download(): any;
    _getLocalData(store: any): any;
    sync(store: any): any;
    syncDown(store: any, stonesInState: any, stonesInCloud: any): object;
    syncChildren(localId: any, store: any, stone_from_cloud: any): void;
    syncUp(stonesInState: any, localStoneIdsSynced: any): void;
    _getCloudIdMap(stonesInState: any): {};
    _searchForLocalMatch(stonesInState: any, stone_in_cloud: any): string;
    syncLocalStoneUp(localStone: any, localStoneId: any, hasSyncedDown?: boolean): void;
    _getLocalApplianceId(cloudId: any): any;
    _getLocalLocationId(cloudId: any): any;
    _getCloudApplianceId(localId: any): any;
    _getCloudLocationId(localId: any): any;
    syncLocalStoneDown(localId: any, stoneInState: any, stone_from_cloud: any, locationLinkId: any): void;
    _copyBehaviourFromCloud(localId: any, stone_from_cloud: any): void;
    uploadDiagnostics(store: any, stonesInState: any, stonesInCloud: any): void;
}
