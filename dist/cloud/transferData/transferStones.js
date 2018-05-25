"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudAPI_1 = require("../cloudAPI");
const Log_1 = require("../../logging/Log");
const transferUtil_1 = require("./shared/transferUtil");
const PermissionManager_1 = require("../../backgroundProcesses/PermissionManager");
let fieldMap = [
    { local: 'crownstoneId', cloud: 'uid' },
    { local: 'dimmingEnabled', cloud: 'dimmingEnabled' },
    { local: 'firmwareVersion', cloud: 'firmwareVersion' },
    { local: 'bootloaderVersion', cloud: 'bootloaderVersion' },
    { local: 'hardwareVersion', cloud: 'hardwareVersion' },
    { local: 'hidden', cloud: 'hidden' },
    { local: 'icon', cloud: 'icon' },
    { local: 'iBeaconMajor', cloud: 'major' },
    { local: 'iBeaconMinor', cloud: 'minor' },
    { local: 'locked', cloud: 'locked' },
    { local: 'switchCraft', cloud: 'switchCraft' },
    { local: 'macAddress', cloud: 'address' },
    // {local: 'meshNetworkId',      cloud: 'meshNetworkId'},
    { local: 'name', cloud: 'name' },
    { local: 'onlyOnWhenDark', cloud: 'onlyOnWhenDark' },
    { local: 'tapToToggle', cloud: 'touchToToggle' },
    { local: 'tapToToggle', cloud: 'tapToToggle' },
    { local: 'type', cloud: 'type' },
    { local: 'updatedAt', cloud: 'updatedAt' },
    { local: 'json', cloud: 'json', localToCloudOnly: true },
    // this is custom inserted.
    { local: 'applianceId', cloud: 'localApplianceId', cloudToLocalOnly: true },
    { local: 'locationId', cloud: 'localLocationId', cloudToLocalOnly: true },
    { local: 'cloudApplianceId', cloud: 'applianceId', localToCloudOnly: true },
    { local: 'cloudLocationId', cloud: 'locationId', localToCloudOnly: true },
    // used for local config
    { local: 'cloudId', cloud: 'id', cloudToLocalOnly: true },
    { local: 'nearThreshold', cloud: null },
    { local: 'rssi', cloud: null },
    { local: 'disabled', cloud: null },
    { local: 'dfuResetRequired', cloud: null },
    { local: 'handle', cloud: null },
    { local: 'locationId', cloud: null },
];
exports.transferStones = {
    fieldMap: fieldMap,
    createOnCloud: function (actions, data) {
        let payload = {};
        let localConfig = data.localData.config;
        transferUtil_1.transferUtil.fillFieldsForCloud(payload, localConfig, fieldMap);
        if (PermissionManager_1.Permissions.inSphere(data.localSphereId).setBehaviourInCloud && data.localData.behaviour) {
            payload['json'] = JSON.stringify(data.localData.behaviour);
        }
        return cloudAPI_1.CLOUD.forSphere(data.cloudSphereId).createStone(payload)
            .then((result) => {
            // update cloudId in local database.
            actions.push({ type: 'UPDATE_STONE_CLOUD_ID', sphereId: data.localSphereId, stoneId: data.localId, data: { cloudId: result.id } });
        })
            .catch((err) => {
            Log_1.LOG.error("Transfer-Stone: Could not create stone in cloud", err);
            throw err;
        });
    },
    updateOnCloud: function (data) {
        if (data.cloudId === undefined) {
            return new Promise((resolve, reject) => { reject({ status: 404, message: "Can not update in cloud, no cloudId available" }); });
        }
        let payload = {};
        let localConfig = data.localData.config;
        transferUtil_1.transferUtil.fillFieldsForCloud(payload, localConfig, fieldMap);
        if (PermissionManager_1.Permissions.inSphere(data.localSphereId).setBehaviourInCloud) {
            payload['json'] = JSON.stringify(data.localData.behaviour);
        }
        return cloudAPI_1.CLOUD.forSphere(data.cloudSphereId).updateStone(data.cloudId, payload)
            .then(() => {
            // TODO: update location as well.
        })
            .catch((err) => {
            Log_1.LOG.error("Transfer-Stone: Could not update stone in cloud", err);
            throw err;
        });
    },
    createLocal: function (actions, data) {
        this._injectLocationId(data);
        return transferUtil_1.transferUtil._handleLocal(actions, 'ADD_STONE', { sphereId: data.localSphereId, stoneId: data.localId }, data, fieldMap);
    },
    updateLocal: function (actions, data) {
        this._injectLocationId(data);
        return transferUtil_1.transferUtil._handleLocal(actions, 'UPDATE_STONE_CONFIG', { sphereId: data.localSphereId, stoneId: data.localId }, data, fieldMap);
    },
    /**
     * Since the locationId is handled differently in the cloud, we have to inject it manually.
     * @param data
     * @private
     */
    _injectLocationId(data) {
        let locationId = null;
        if (data.cloudData && data.cloudData.locationId !== undefined) {
            // no need for insert
            return;
        }
        if (data.cloudData && data.cloudData.locations && Array.isArray(data.cloudData.locations) && data.cloudData.locations.length > 0) {
            locationId = data.cloudData.locations[0].id;
            data.cloudData['locationId'] = locationId;
        }
    }
    // todo: create new
};
//# sourceMappingURL=transferStones.js.map