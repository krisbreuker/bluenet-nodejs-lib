import { BleHandler } from "./ble/BleHandler";
import {BluenetSettings} from "./ble/BluenetSettings";


export default class Bluenet {
  ble: BleHandler;
  settings: BluenetSettings;

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

  connect() {

  }

  setupCrownstone() {}

  disconnect() {}

  startScanning() {
    this.ble.startScanning()
  }

  stopScanning() {
    this.ble.stopScanning()
  }
}