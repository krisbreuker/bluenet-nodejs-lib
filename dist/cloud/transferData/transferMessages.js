"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudAPI_1 = require("../cloudAPI");
const Log_1 = require("../../logging/Log");
const transferUtil_1 = require("./shared/transferUtil");
let fieldMap = [
    { local: 'triggerLocationId', cloud: 'localTriggerLocationId', cloudToLocalOnly: true },
    { local: 'cloudTriggerLocationId', cloud: 'triggerLocationId', localToCloudOnly: true },
    { local: 'triggerEvent', cloud: 'triggerEvent' },
    { local: 'content', cloud: 'content' },
    { local: 'everyoneInSphere', cloud: 'everyoneInSphere' },
    { local: 'everyoneInSphereIncludingOwner', cloud: 'everyoneInSphereIncludingOwner' },
    { local: 'senderId', cloud: 'ownerId' },
    { local: 'updatedAt', cloud: 'updatedAt' },
    { local: 'cloudId', cloud: 'id', cloudToLocalOnly: true },
    { local: 'sendFailed', cloud: null },
    { local: 'sent', cloud: null },
    { local: 'sentAt', cloud: null },
];
exports.transferMessages = {
    fieldMap: fieldMap,
    createOnCloud: function (actions, data) {
        let payload = {};
        payload['sphereId'] = data.cloudSphereId;
        let localConfig = data.localData.config;
        transferUtil_1.transferUtil.fillFieldsForCloud(payload, localConfig, fieldMap);
        return cloudAPI_1.CLOUD.forSphere(data.cloudSphereId).createMessage(payload)
            .then((result) => {
            // update cloudId in local database.
            actions.push({ type: 'UPDATE_MESSAGE_CLOUD_ID', sphereId: data.localSphereId, messageId: data.localId, data: { cloudId: result.id } });
        })
            .catch((err) => {
            Log_1.LOG.error("Transfer-Message: Could not create Message in cloud", err);
            throw err;
        });
    },
    createLocal: function (actions, data) {
        return transferUtil_1.transferUtil._handleLocal(actions, 'ADD_CLOUD_MESSAGE', { sphereId: data.localSphereId, messageId: data.localId }, data, fieldMap);
    },
    updateLocal: function (actions, data) {
        return transferUtil_1.transferUtil._handleLocal(actions, 'APPEND_MESSAGE', { sphereId: data.localSphereId, messageId: data.localId }, data, fieldMap);
    },
};
//# sourceMappingURL=transferMessages.js.map