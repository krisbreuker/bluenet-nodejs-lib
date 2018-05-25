"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudAPI_1 = require("../cloudAPI");
const Log_1 = require("../../logging/Log");
const transferUtil_1 = require("./shared/transferUtil");
let fieldMap = [
    { local: 'firstName', cloud: 'firstName' },
    { local: 'lastName', cloud: 'lastName' },
    { local: 'email', cloud: 'email' },
    { local: 'isNew', cloud: 'new' },
    { local: 'pictureId', cloud: 'profilePicId', cloudToLocalOnly: true },
    { local: 'userId', cloud: 'id', cloudToLocalOnly: true },
    { local: 'uploadLocation', cloud: 'uploadLocation' },
    { local: 'uploadSwitchState', cloud: 'uploadSwitchState' },
    { local: 'uploadDeviceDetails', cloud: 'uploadDeviceDetails' },
    { local: 'updatedAt', cloud: 'updatedAt' },
    // these are not handled by this script.
    { local: 'firmwareVersionsAvailable', cloud: null },
    { local: 'bootloaderVersionsAvailable', cloud: null },
    // these are used for local config.
    { local: 'accessToken', cloud: null },
    { local: 'passwordHash', cloud: null },
    { local: 'picture', cloud: null },
    { local: 'betaAccess', cloud: null },
    { local: 'seenTapToToggle', cloud: null },
    { local: 'seenTapToToggleDisabledDuringSetup', cloud: null },
    { local: 'seenRoomFingerprintAlert', cloud: null },
    { local: 'appIdentifier', cloud: null },
    { local: 'developer', cloud: null },
    { local: 'logging', cloud: null },
];
exports.transferUser = {
    fieldMap: fieldMap,
    updateOnCloud: function (data) {
        let payload = {};
        transferUtil_1.transferUtil.fillFieldsForCloud(payload, data.localData, fieldMap);
        cloudAPI_1.CLOUD.forUser(data.cloudId).updateUserData(payload)
            .then(() => { })
            .catch((err) => {
            Log_1.LOG.error("Transfer-User: Could not update user in cloud", err);
            throw err;
        });
    },
    updateLocal: function (actions, data) {
        return transferUtil_1.transferUtil._handleLocal(actions, 'USER_UPDATE', {}, data, fieldMap);
    },
};
//# sourceMappingURL=transferUser.js.map