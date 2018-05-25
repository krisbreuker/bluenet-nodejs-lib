"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudAPI_1 = require("../cloudAPI");
const Log_1 = require("../../logging/Log");
const transferUtil_1 = require("./shared/transferUtil");
const PermissionManager_1 = require("../../backgroundProcesses/PermissionManager");
let fieldMap = [
    { local: 'name', cloud: 'name' },
    { local: 'icon', cloud: 'icon' },
    { local: 'hidden', cloud: 'hidden' },
    { local: 'locked', cloud: 'locked' },
    { local: 'onlyOnWhenDark', cloud: 'onlyOnWhenDark' },
    { local: 'updatedAt', cloud: 'updatedAt' },
    { local: 'json', cloud: 'json', localToCloudOnly: true },
    { local: 'dimmable', cloud: null },
    { local: 'cloudId', cloud: 'id', cloudToLocalOnly: true },
];
exports.transferAppliances = {
    fieldMap: fieldMap,
    createOnCloud: function (actions, data) {
        let payload = {};
        let localConfig = data.localData.config;
        transferUtil_1.transferUtil.fillFieldsForCloud(payload, localConfig, fieldMap);
        if (PermissionManager_1.Permissions.inSphere(data.localSphereId).setBehaviourInCloud && data.localData.behaviour) {
            payload['json'] = JSON.stringify(data.localData.behaviour);
        }
        return cloudAPI_1.CLOUD.forSphere(data.cloudSphereId).createAppliance(payload)
            .then((result) => {
            // update cloudId in local database.
            actions.push({ type: 'UPDATE_APPLIANCE_CLOUD_ID', sphereId: data.localSphereId, applianceId: data.localId, data: { cloudId: result.id } });
            return result.id;
        })
            .catch((err) => {
            Log_1.LOG.error("Transfer-Appliance: Could not create Appliance in cloud", err);
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
        return cloudAPI_1.CLOUD.forSphere(data.cloudSphereId).updateAppliance(data.cloudId, payload)
            .then(() => { })
            .catch((err) => {
            Log_1.LOG.error("Transfer-Appliance: Could not update Appliance in cloud", err);
            throw err;
        });
    },
    createLocal: function (actions, data) {
        return transferUtil_1.transferUtil._handleLocal(actions, 'ADD_APPLIANCE', { sphereId: data.localSphereId, applianceId: data.localId }, data, fieldMap);
    },
    updateLocal: function (actions, data) {
        return transferUtil_1.transferUtil._handleLocal(actions, 'UPDATE_APPLIANCE_CONFIG', { sphereId: data.localSphereId, applianceId: data.localId }, data, fieldMap);
    },
};
//# sourceMappingURL=transferAppliances.js.map