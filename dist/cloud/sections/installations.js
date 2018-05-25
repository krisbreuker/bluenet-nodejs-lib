"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ExternalConfig_1 = require("../../ExternalConfig");
exports.installations = {
    getInstallations: function (options = {}) {
        return this._setupRequest('GET', '/Devices/{id}/installations', options);
    },
    createInstallation: function (data, background = true) {
        return this._setupRequest('POST', '/Devices/{id}/installations?appName=' + ExternalConfig_1.APP_NAME, { data: data, background: background }, 'body');
    },
    updateInstallation: function (installationId, data, background = true) {
        return this._setupRequest('PUT', '/AppInstallations/' + installationId, { data: data, background: background }, 'body');
    },
    getInstallation: function (installationId, background = true) {
        return this._setupRequest('GET', '/AppInstallations/' + installationId, { background: background });
    },
    deleteInstallation: function (installationId) {
        return this._setupRequest('DELETE', '/Devices/{id}/devices/' + installationId);
    }
};
//# sourceMappingURL=installations.js.map