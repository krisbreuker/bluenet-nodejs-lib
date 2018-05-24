import { BleHandler }      from "./ble/BleHandler";
import { BluenetSettings } from "./ble/BluenetSettings";
import { eventBus }        from "./util/EventBus";
import { ControlHandler }  from "./ble/modules/ControlHandler";
import { CloudHandler }    from "./ble/modules/CloudHandler";

export default class Bluenet {
  ble: BleHandler;
  settings: BluenetSettings;
  control : ControlHandler;
  cloud : CloudHandler;

  constructor() {
    this.settings = new BluenetSettings();
    this.ble = new BleHandler(this.settings);
    this.control = new ControlHandler(this.ble);
    this.cloud = new CloudHandler();
  }


  setSettings(keys, referenceId="BluenetNodeJSLib", encryptionEnabled=true) {
    this.settings.loadKeys(encryptionEnabled, keys.adminKey, keys.memberKey, keys.guestKey, referenceId)
  }

  isReady() {
    return this.ble.isReady();
  }

  linkCloud(userData) {
    if (userData.adminKey !== undefined && userData.guestKey !== undefined) {
      return new Promise((resolve, reject) => {
        console.log("Keys found in userData, no need to link Cloud.");
        this.settings.loadKeys(true, userData.adminKey, userData.memberKey, userData.guestKey, "UserData")
        resolve();
      })
    }
    else {
      return this.cloud.login(userData)
        .then(() => {
          return this.cloud.getKeys(userData.sphereCloudId)
        })
        .then((keys : any) => {
          this.settings.loadKeys(true, keys.admin, keys.member, keys.guest, "CloudData")
        })
    }
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