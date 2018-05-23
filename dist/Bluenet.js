"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BleHandler_1 = require("./ble/BleHandler");
const BluenetSettings_1 = require("./ble/BluenetSettings");
const EventBus_1 = require("./util/EventBus");
const ControlHandler_1 = require("./ble/modules/control/ControlHandler");
class Bluenet {
    constructor() {
        this.settings = new BluenetSettings_1.BluenetSettings();
        this.ble = new BleHandler_1.BleHandler(this.settings);
        this.control = new ControlHandler_1.ControlHandler(this.ble);
    }
    setSettings(keys, referenceId = "BluenetNodeJSLib", encryptionEnabled = true) {
        this.settings.loadKeys(encryptionEnabled, keys.adminKey, keys.memberKey, keys.guestKey, referenceId);
    }
    isReady() {
        return this.ble.isReady();
    }
    connect(connectData, scanDuration) {
        return this.ble.connect(connectData, scanDuration)
            .then(() => {
            console.log("getting Session Nonce");
            return this.control.getAndSetSessionNonce();
        });
    }
    wait(seconds) {
        return new Promise((resolve, reject) => {
            setTimeout(() => { resolve(); }, seconds * 1000);
        });
    }
    setupCrownstone() { }
    disconnect() {
        return this.ble.disconnect();
    }
    quit() {
        this.ble.quit();
    }
    startScanning() {
        return this.ble.startScanning();
    }
    stopScanning() {
        this.ble.stopScanning();
    }
    on(topic, callback) {
        return EventBus_1.eventBus.on(topic, callback);
    }
}
exports.default = Bluenet;
//# sourceMappingURL=Bluenet.js.map