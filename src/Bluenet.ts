import { BleHandler } from "./ble/BleHandler";
import {BluenetSettings} from "./ble/BluenetSettings";
import {eventBus} from "./util/EventBus";


export default class Bluenet {
  ble: BleHandler;
  settings: BluenetSettings;

  cache : any

  constructor() {
    this.settings = new BluenetSettings();
    this.ble = new BleHandler(this.settings);
  }


  setSettings(keys, referenceId="BluenetNodeJSLib", encryptionEnabled=true) {
    this.settings.loadKeys(encryptionEnabled, keys.adminKey, keys.memberKey, keys.guestKey, referenceId)
  }

  isReady() {
    return this.ble.isReady()
  }

  connect(connectData, scanDuration) {
    this.ble.connect(connectData, scanDuration)
  }

  setupCrownstone() {}

  disconnect() {}

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