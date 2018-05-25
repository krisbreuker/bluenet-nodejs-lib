"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudAPI_1 = require("../cloudAPI");
const Log_1 = require("../../logging/Log");
const transferUtil_1 = require("./shared/transferUtil");
let fieldMap = [
    { local: 'name', cloud: 'name' },
    { local: 'aiName', cloud: 'aiName' },
    { local: 'aiSex', cloud: 'aiSex' },
    { local: 'exitDelay', cloud: 'exitDelay' },
    { local: 'iBeaconUUID', cloud: 'uuid' },
    { local: 'meshAccessAddress', cloud: 'meshAccessAddress' },
    { local: 'updatedAt', cloud: 'updatedAt' },
    // keys are set elsewhere
    { local: 'adminKey', cloud: null },
    { local: 'memberKey', cloud: null },
    { local: 'guestKey', cloud: null },
    // used for local
    { local: 'cloudId', cloud: 'id', cloudToLocalOnly: true },
];
exports.transferSpheres = {
    fieldMap: fieldMap,
    createOnCloud: function (actions, data) {
        // let payload = {};
        // let localConfig = data.localData.config;
        // transferUtil.fillFieldsForCloud(payload, localConfig, fieldMap);
        return cloudAPI_1.CLOUD.createSphere({}, false)
            .then((result) => {
            // update cloudId in local database.
            actions.push({ type: 'UPDATE_SPHERE_CLOUD_ID', sphereId: data.localId, data: { cloudId: result.id } });
        })
            .catch((err) => {
            Log_1.LOG.error("Transfer-Sphere: Could not create Sphere in cloud", err);
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
        // TODO: fix lat/long
        // {local:'latitude' ,           cloud: 'latitude'},
        // {local:'longitude',           cloud: 'longitude'},
        return cloudAPI_1.CLOUD.updateSphere(data.cloudId, payload)
            .then(() => { })
            .catch((err) => {
            Log_1.LOG.error("Transfer-Sphere: Could not update sphere in cloud", err);
            throw err;
        });
    },
    createLocal: function (actions, data) {
        // TODO: fix lat/long
        return transferUtil_1.transferUtil._handleLocal(actions, 'ADD_SPHERE', { sphereId: data.localId }, data, fieldMap);
    },
    updateLocal: function (actions, data) {
        // TODO: fix lat/long
        return transferUtil_1.transferUtil._handleLocal(actions, 'UPDATE_SPHERE_CONFIG', { sphereId: data.localId }, data, fieldMap);
    },
};
//# sourceMappingURL=transferSpheres.js.map