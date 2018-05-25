"use strict";
/**
 *
 * Sync the user from the cloud to the database.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cloudAPI_1 = require("../../../cloudAPI");
const SyncingBase_1 = require("./SyncingBase");
class KeySyncer extends SyncingBase_1.SyncingBase {
    download() {
        return cloudAPI_1.CLOUD.getKeys();
    }
    sync() {
        return this.download()
            .then((keysInCloud) => {
            this.syncDown(keysInCloud);
            return Promise.all(this.transferPromises);
        })
            .then(() => { return this.actions; });
    }
    syncDown(keysInCloud) {
        keysInCloud.forEach((keySet) => {
            let localSphereId = this.globalCloudIdMap.spheres[keySet.sphereId];
            this.actions.push({ type: 'SET_SPHERE_KEYS', sphereId: localSphereId, data: {
                    adminKey: keySet.keys.owner || keySet.keys.admin || null,
                    memberKey: keySet.keys.member || null,
                    guestKey: keySet.keys.guest || null
                } });
        });
    }
}
exports.KeySyncer = KeySyncer;
//# sourceMappingURL=KeySyncer.js.map