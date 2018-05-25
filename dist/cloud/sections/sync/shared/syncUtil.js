"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeDifference = function (localVersion, cloudVersion) {
    if (typeof localVersion === 'object' && typeof cloudVersion === 'object') {
        return new Date(localVersion.updatedAt).valueOf() - new Date(cloudVersion.updatedAt).valueOf();
    }
    else {
        return new Date(localVersion).valueOf() - new Date(cloudVersion).valueOf();
    }
};
exports.shouldUpdateInCloud = function (localVersion, cloudVersion) {
    // local version is newer than the cloud version --> update cloud
    return exports.getTimeDifference(localVersion, cloudVersion) > 0;
};
exports.shouldUpdateLocally = function (localVersion, cloudVersion) {
    // cloud version is newer than the local version --> update local
    return exports.getTimeDifference(localVersion, cloudVersion) < 0;
};
//# sourceMappingURL=syncUtil.js.map