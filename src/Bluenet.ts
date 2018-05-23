import { BleHandler } from "./ble/BleHandler";
import {BluenetSettings} from "./ble/BluenetSettings";
import {eventBus} from "./util/EventBus";
import {ControlHandler} from "./ble/modules/control/ControlHandler";


export default class Bluenet {
  ble: BleHandler;
  settings: BluenetSettings;
  control : ControlHandler;

  constructor() {
    this.settings = new BluenetSettings();
    this.ble = new BleHandler(this.settings);
    this.control = new ControlHandler(this.ble);
  }


  setSettings(keys, referenceId="BluenetNodeJSLib", encryptionEnabled=true) {
    this.settings.loadKeys(encryptionEnabled, keys.adminKey, keys.memberKey, keys.guestKey, referenceId)
  }

  isReady() {
    return this.ble.isReady()
  }

  connect(connectData, scanDuration) : Promise<void> {
    return this.ble.connect(connectData, scanDuration)
      .then(() => {
        console.log("getting Session Nonce")
        return this.control.getAndSetSessionNonce()
      })
  }

  wait(seconds) {
    return new Promise((resolve, reject) => {
      setTimeout(() => { resolve() }, seconds * 1000);
    })
  }

  setupCrownstone() {}

  disconnect() {
    return this.ble.disconnect()
  }

  quit() {
    this.ble.quit()
  }

  startScanning() {
    return this.ble.startScanning()
  }

  stopScanning() {
    this.ble.stopScanning()
  }

  on(topic, callback) {
    return eventBus.on(topic, callback);
  }
}