"use strict";
/**
 *
 * Sync the spheres from the cloud to the database.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
const syncUtil_1 = require("../shared/syncUtil");
const cloudAPI_1 = require("../../../cloudAPI");
const Util_1 = require("../../../../util/Util");
const SyncingBase_1 = require("./SyncingBase");
const transferSpheres_1 = require("../../../transferData/transferSpheres");
const SphereUserSyncer_1 = require("./SphereUserSyncer");
const LocationSyncer_1 = require("./LocationSyncer");
const ApplianceSyncer_1 = require("./ApplianceSyncer");
const StoneSyncer_1 = require("./StoneSyncer");
const MessageSyncer_1 = require("./MessageSyncer");
const Log_1 = require("../../../../logging/Log");
const PermissionManager_1 = require("../../../../backgroundProcesses/PermissionManager");
class SphereSyncer extends SyncingBase_1.SyncingBase {
    constructor(actions, transferPromises, globalCloudIdMap, globalSphereMap) {
        super(actions, transferPromises, globalCloudIdMap);
        this.globalSphereMap = globalSphereMap;
    }
    download() {
        return cloudAPI_1.CLOUD.getSpheres();
    }
    sync(store) {
        return this.download()
            .then((spheresInCloud) => {
            let state = store.getState();
            let spheresInState = state.spheres;
            let localSphereIdsSynced = this.syncDown(store, spheresInState, spheresInCloud);
            this.syncUp(spheresInState, localSphereIdsSynced);
            return Promise.all(this.transferPromises);
        })
            .then(() => { return this.actions; });
    }
    syncDown(store, spheresInState, spheresInCloud) {
        let localSphereIdsSynced = {};
        let cloudIdMap = this._getCloudIdMap(spheresInState);
        // go through all spheres in the cloud.
        spheresInCloud.forEach((sphere_from_cloud) => {
            let localId = cloudIdMap[sphere_from_cloud.id];
            // if we do not have a sphere with exactly this cloudId, verify that we do not have the same sphere on our device already.
            if (localId === undefined) {
                localId = this._searchForLocalMatch(spheresInState, sphere_from_cloud);
            }
            if (localId) {
                localSphereIdsSynced[localId] = true;
                this.syncLocalSphereDown(localId, spheresInState[localId], sphere_from_cloud);
            }
            else {
                // the sphere does not exist locally but it does exist in the cloud.
                // we create it locally.
                localId = Util_1.Util.getUUID();
                cloudIdMap[sphere_from_cloud.id] = localId;
                this.transferPromises.push(transferSpheres_1.transferSpheres.createLocal(this.actions, {
                    localId: localId,
                    cloudData: sphere_from_cloud
                })
                    .catch(() => { }));
            }
            this.syncChildren(store, localId, localId ? spheresInState[localId] : null, sphere_from_cloud);
        });
        this.globalCloudIdMap.spheres = cloudIdMap;
        return localSphereIdsSynced;
    }
    syncChildren(store, localId, localSphere, sphere_from_cloud) {
        this.globalSphereMap[localId] = SyncingBase_1.getGlobalIdMap();
        let sphereUserSyncer = new SphereUserSyncer_1.SphereUserSyncer(this.actions, [], localId, sphere_from_cloud.id, this.globalCloudIdMap, this.globalSphereMap[localId]);
        let locationSyncer = new LocationSyncer_1.LocationSyncer(this.actions, [], localId, sphere_from_cloud.id, this.globalCloudIdMap, this.globalSphereMap[localId]);
        let applianceSyncer = new ApplianceSyncer_1.ApplianceSyncer(this.actions, [], localId, sphere_from_cloud.id, this.globalCloudIdMap, this.globalSphereMap[localId]);
        let stoneSyncer = new StoneSyncer_1.StoneSyncer(this.actions, [], localId, sphere_from_cloud.id, this.globalCloudIdMap, this.globalSphereMap[localId]);
        let messageSyncer = new MessageSyncer_1.MessageSyncer(this.actions, [], localId, sphere_from_cloud.id, this.globalCloudIdMap, this.globalSphereMap[localId]);
        // sync sphere users
        Log_1.LOG.info("SphereSync ", localId, ": START sphereUserSyncer sync.");
        this.transferPromises.push(sphereUserSyncer.sync(store)
            .then(() => {
            Log_1.LOG.info("SphereSync ", localId, ": DONE sphereUserSyncer sync.");
            Log_1.LOG.info("SphereSync ", localId, ": START locationSyncer sync.");
            // sync locations
            return locationSyncer.sync(store);
        })
            .then(() => {
            Log_1.LOG.info("SphereSync ", localId, ": DONE locationSyncer sync.");
            Log_1.LOG.info("SphereSync ", localId, ": START applianceSyncer sync.");
            // sync appliances
            return applianceSyncer.sync(store);
        })
            .then(() => {
            Log_1.LOG.info("SphereSync ", localId, ": DONE applianceSyncer sync.");
            Log_1.LOG.info("SphereSync ", localId, ": START stoneSyncer sync.");
            // sync stones
            return stoneSyncer.sync(store);
        })
            .then(() => {
            Log_1.LOG.info("SphereSync ", localId, ": DONE stoneSyncer sync.");
            Log_1.LOG.info("SphereSync ", localId, ": START messageSyncer sync.");
            // sync messages
            return messageSyncer.sync(store);
        })
            .then(() => {
            Log_1.LOG.info("SphereSync ", localId, ": DONE messageSyncer sync.");
        }));
    }
    syncUp(spheresInState, localSphereIdsSynced) {
        let localSphereIds = Object.keys(spheresInState);
        localSphereIds.forEach((sphereId) => {
            let sphere = spheresInState[sphereId];
            this.syncLocalSphereUp(sphere, sphereId, localSphereIdsSynced[sphereId] === true);
        });
    }
    syncLocalSphereUp(localSphere, localSphereId, hasSyncedDown = false) {
        // if the object does not have a cloudId, it does not exist in the cloud but we have it locally.
        if (!hasSyncedDown) {
            if (localSphere.config.cloudId) {
                this.actions.push({ type: 'REMOVE_SPHERE', sphereId: localSphereId });
            }
            else {
                this.transferPromises.push(transferSpheres_1.transferSpheres.createOnCloud(this.actions, { localId: localSphereId, localData: localSphere }));
            }
        }
    }
    syncLocalSphereDown(localId, sphereInState, sphere_from_cloud) {
        if (syncUtil_1.shouldUpdateInCloud(sphereInState.config, sphere_from_cloud)) {
            if (!PermissionManager_1.Permissions.inSphere(localId).canUploadSpheres) {
                return;
            }
            this.transferPromises.push(transferSpheres_1.transferSpheres.updateOnCloud({
                localData: sphereInState,
                cloudId: sphere_from_cloud.id,
            })
                .catch(() => { }));
        }
        else if (syncUtil_1.shouldUpdateLocally(sphereInState.config, sphere_from_cloud)) {
            this.transferPromises.push(transferSpheres_1.transferSpheres.updateLocal(this.actions, {
                localId: localId,
                cloudData: sphere_from_cloud
            }).catch(() => { }));
        }
        if (!sphereInState.config.cloudId) {
            this.actions.push({ type: 'UPDATE_SPHERE_CLOUD_ID', sphereId: localId, data: { cloudId: sphere_from_cloud.id } });
        }
    }
    ;
    _getCloudIdMap(spheresInState) {
        let cloudIdMap = {};
        let sphereIds = Object.keys(spheresInState);
        sphereIds.forEach((sphereId) => {
            let sphere = spheresInState[sphereId];
            if (sphere.config.cloudId) {
                cloudIdMap[sphere.config.cloudId] = sphereId;
            }
        });
        return cloudIdMap;
    }
    _searchForLocalMatch(spheresInState, sphereInCloud) {
        let sphereIds = Object.keys(spheresInState);
        for (let i = 0; i < sphereIds.length; i++) {
            let sphere = spheresInState[sphereIds[i]];
            if (sphere.config.iBeaconUUID === sphereInCloud.uuid) {
                return sphereIds[i];
            }
        }
        return null;
    }
}
exports.SphereSyncer = SphereSyncer;
//# sourceMappingURL=SphereSyncer.js.map