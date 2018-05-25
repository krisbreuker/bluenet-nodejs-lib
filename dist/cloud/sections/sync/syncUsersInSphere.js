"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = require("../../../logging/Log");
const LocationSyncer_1 = require("./modelSyncs/LocationSyncer");
const MapProvider_1 = require("../../../backgroundProcesses/MapProvider");
const SyncingBase_1 = require("./modelSyncs/SyncingBase");
exports.syncUsersInSphere = {
    /**
     * This method will check if there are any users in rooms in the active sphere. If so, actions will be dispatched to the store.
     * @param store
     */
    syncUsers: function (store) {
        let state = store.getState();
        let activeSphereId = state.app.activeSphere;
        if (!activeSphereId) {
            return;
        }
        let sphere = state.spheres[activeSphereId];
        if (!sphere) {
            return;
        }
        let actions = [];
        let sphereUsers = sphere.users;
        // there's only you in the sphere, no need to check
        if (Object.keys(sphereUsers).length <= 1) {
            return;
        }
        let locationSyncer = new LocationSyncer_1.LocationSyncer(actions, [], activeSphereId, sphere.config.cloudId || activeSphereId, MapProvider_1.MapProvider.cloud2localMap, SyncingBase_1.getGlobalIdMap());
        locationSyncer.sync(store)
            .then(() => {
            if (actions.length > 0) {
                store.batchDispatch(actions);
            }
        })
            .catch((err) => { Log_1.LOG.error("SyncUsersInSphere: Error during background user sync: ", err); });
    }
};
//# sourceMappingURL=syncUsersInSphere.js.map