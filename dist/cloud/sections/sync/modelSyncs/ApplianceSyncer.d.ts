import { SyncingSphereItemBase } from "./SyncingBase";
export declare class ApplianceSyncer extends SyncingSphereItemBase {
    userId: string;
    download(): any;
    _getLocalData(store: any): any;
    sync(store: any): any;
    syncDown(appliancesInState: any, appliancesInCloud: any): object;
    syncUp(store: any, appliancesInState: any, localApplianceIdsSynced: any): void;
    syncLocalApplianceUp(store: any, localAppliance: any, localApplianceId: any, hasSyncedDown?: boolean): void;
    propagateRemoval(store: any, localApplianceId: any): void;
    syncLocalApplianceDown(localId: any, applianceInState: any, appliance_from_cloud: any): void;
    _getCloudIdMap(appliancesInState: any): {};
    _searchForLocalMatch(appliancesInState: any, applianceInCloud: any): string;
    _copyBehaviourFromCloud(localId: any, appliance_from_cloud: any): void;
}
