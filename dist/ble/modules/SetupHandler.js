"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Characteristics_1 = require("../../protocol/Characteristics");
const Services_1 = require("../../protocol/Services");
const BluenetError_1 = require("../../BluenetError");
class SetupHandler {
    constructor(ble) {
        this.ble = ble;
    }
    setup(crownstoneId, meshAccessAddress, ibeaconUUID, ibeaconMajor, ibeaconMinor) {
        return new Promise((resolve, reject) => {
            if (this.ble.connectedPeripheral.characteristics[Services_1.CSServices.SetupService][Characteristics_1.SetupCharacteristics.SetupControl]) {
            }
            else {
                reject(new BluenetError_1.BluenetError(BluenetError_1.BluenetErrorType.INCOMPATIBLE_FIRMWARE, "This Crownstone has an old firmware and is not compatible with this lib."));
            }
        });
    }
    handleSetupPhaseEncryption() {
        return new Promise((resolve, reject) => {
            this.ble.settings.disableEncryptionTemporarily();
            this.getSessionKey()
                .then((key) => {
                this.ble.settings.loadSetupKey(key);
                return this.getSessionNonce();
            })
                .then((nonce) => {
                this.ble.settings.setSessionNonce(nonce);
                this.ble.settings.restoreEncryption();
                resolve();
            })
                .catch((err) => {
                this.ble.settings.restoreEncryption();
                reject(err);
            });
        });
    }
    getSessionKey() {
        return this.ble.readCharacteristicWithoutEncryption(Services_1.CSServices.SetupService, Characteristics_1.SetupCharacteristics.SessionKey);
    }
    getSessionNonce() {
        return this.ble.readCharacteristicWithoutEncryption(Services_1.CSServices.SetupService, Characteristics_1.SetupCharacteristics.SessionNonce);
    }
}
exports.SetupHandler = SetupHandler;
//# sourceMappingURL=SetupHandler.js.map