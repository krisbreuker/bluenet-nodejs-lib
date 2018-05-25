"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudAPI_1 = require("../cloudAPI");
const Log_1 = require("../../logging/Log");
const transferUtil_1 = require("./shared/transferUtil");
let fieldMap = [
    { local: 'label', cloud: 'label' },
    { local: 'time', cloud: 'triggerTimeOnCrownstone' },
    { local: 'scheduleEntryIndex', cloud: 'scheduleEntryIndex' },
    { local: 'switchState', cloud: 'switchState' },
    { local: 'linkedSchedule', cloud: 'linkedSchedule' },
    { local: 'fadeDuration', cloud: 'fadeDuration' },
    { local: 'intervalInMinutes', cloud: 'intervalInMinutes' },
    { local: 'ignoreLocationTriggers', cloud: 'ignoreLocationTriggers' },
    { local: 'repeatMode', cloud: 'repeatMode' },
    { local: 'active', cloud: 'active' },
    {
        local: 'activeDays',
        localFields: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        cloud: 'activeDays',
        cloudFields: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    { local: 'updatedAt', cloud: 'updatedAt' },
    { local: 'cloudId', cloud: 'id', cloudToLocalOnly: true },
];
exports.transferSchedules = {
    fieldMap: fieldMap,
    createOnCloud: function (actions, data) {
        let payload = {};
        transferUtil_1.transferUtil.fillFieldsForCloud(payload, data.localData, fieldMap);
        return cloudAPI_1.CLOUD.forStone(data.cloudStoneId).createSchedule(payload)
            .then((result) => {
            // update cloudId in local database.
            actions.push({
                type: 'UPDATE_SCHEDULE_CLOUD_ID',
                sphereId: data.localSphereId,
                stoneId: data.localStoneId,
                scheduleId: data.localId,
                data: { cloudId: result.id }
            });
        })
            .catch((err) => {
            if (err.status === 422) {
                cloudAPI_1.CLOUD.forStone(data.cloudStoneId).getScheduleWithIndex(data.localData.getScheduleWithIndex)
                    .then((existingSchedules) => {
                    if (existingSchedules && Array.isArray(existingSchedules) && existingSchedules.length > 0 && existingSchedules[0].id) {
                        Log_1.LOGw.cloud("Transfer-Schedule: trying to update existing schedule in the cloud.");
                        let updateData = {
                            localId: data.localId,
                            localData: data.localData,
                            cloudStoneId: data.cloudStoneId,
                            cloudId: existingSchedules[0].id,
                        };
                        return exports.transferSchedules.updateOnCloud(updateData);
                    }
                })
                    .catch((err) => {
                    Log_1.LOG.error("Transfer-Schedule: Could not create/update schedule in cloud", err);
                    throw err;
                });
            }
            else {
                Log_1.LOG.error("Transfer-Schedule: Could not create schedule in cloud", err);
                throw err;
            }
        });
    },
    updateOnCloud: function (data) {
        if (data.cloudId === undefined) {
            return new Promise((resolve, reject) => { reject({ status: 404, message: "Can not update in cloud, no cloudId available" }); });
        }
        let payload = {};
        transferUtil_1.transferUtil.fillFieldsForCloud(payload, data.localData, fieldMap);
        return cloudAPI_1.CLOUD.forStone(data.cloudStoneId).updateSchedule(data.cloudId, payload)
            .then(() => { })
            .catch((err) => {
            Log_1.LOG.error("Transfer-Schedule: Could not update schedule in cloud", err);
            throw err;
        });
    },
    createLocal: function (actions, data) {
        return transferUtil_1.transferUtil._handleLocal(actions, 'ADD_STONE_SCHEDULE', { sphereId: data.localSphereId, stoneId: data.localStoneId, scheduleId: data.localId }, data, fieldMap);
    },
    updateLocal: function (actions, data) {
        return transferUtil_1.transferUtil._handleLocal(actions, 'UPDATE_STONE_SCHEDULE', { sphereId: data.localSphereId, stoneId: data.localStoneId, scheduleId: data.localId }, data, fieldMap);
    },
};
//# sourceMappingURL=transferSchedules.js.map