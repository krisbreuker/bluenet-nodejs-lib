import { BleHandler }      from "./ble/BleHandler";
import { BluenetSettings } from "./ble/BluenetSettings";
import { eventBus }        from "./util/EventBus";
import { ControlHandler }  from "./ble/modules/ControlHandler";
import { CloudHandler }    from "./ble/modules/CloudHandler";
import { Topics }          from "./topics/Topics";
import { SetupHandler }    from "./ble/modules/SetupHandler";

export default class Bluenet {
  ble: BleHandler;
  settings: BluenetSettings;
  control : ControlHandler;
  setup : SetupHandler;
  cloud : CloudHandler;

  constructor() {
    this.settings = new BluenetSettings();
    this.ble      = new BleHandler(this.settings);
    this.control  = new ControlHandler(this.ble);
    this.setup    = new SetupHandler(this.ble);
    this.cloud    = new CloudHandler();
  }

  /**
   *
   * @param keys
   * @param {string} referenceId
   * @param {boolean} encryptionEnabled
   */
  setSettings(keys, referenceId="BluenetNodeJSLib", encryptionEnabled=true) {
    this.settings.loadKeys(encryptionEnabled, keys.adminKey, keys.memberKey, keys.guestKey, referenceId)
  }


  /**
   *
   * @returns {Promise<any>}
   */
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
          return this.cloud.getKeys(userData.sphereId)
        })
        .then((keys : any) => {
          this.settings.loadKeys(true, keys.admin, keys.member, keys.guest, "CloudData")
        })
    }
  }

  connect(connectData, scanDuration = 5) : Promise<void> {
    return this.ble.connect(connectData, scanDuration)
      .then(() => {
        console.log("Getting Session Nonce...")
        return this.control.getAndSetSessionNonce()
      })
      .then(() => {
        console.log("Session Nonce Processed.")
      })
  }

  wait(seconds) {
    return new Promise((resolve, reject) => {
      setTimeout(() => { resolve() }, seconds * 1000);
    })
  }

  setupCrownstone(handle, crownstoneId, meshAccessAddress, ibeaconUUID, ibeaconMajor, ibeaconMinor) {
    return this.connect(handle)
      .then(() => {
        return this.setup.setup(crownstoneId, meshAccessAddress, ibeaconUUID, ibeaconMajor, ibeaconMinor)
      })
  }

  disconnect() {
    return this.ble.disconnect()
  }

  cleanUp() {
    this.ble.cleanUp()
  }

  quit() {
    this.ble.cleanUp()

    // this is a hard quit. Your program will end here.
    process.exit(1);
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


  getNearestCrownstone(rssiAtLeast=-100, scanDuration=5, returnFirstAcceptable=false, addressesToExclude=[]) {
    return this._getNearest(false, false, rssiAtLeast, scanDuration, returnFirstAcceptable, addressesToExclude);
  }

  getNearestValidatedCrownstone(rssiAtLeast=-100, scanDuration=5,returnFirstAcceptable=false, addressesToExclude=[]) {
    return this._getNearest(false, true, rssiAtLeast, scanDuration, returnFirstAcceptable, addressesToExclude);
  }

  getNearestSetupStone(rssiAtLeast=-100, scanDuration=5,returnFirstAcceptable=false, addressesToExclude=[]) {
    return this._getNearest(true, true, rssiAtLeast, scanDuration, returnFirstAcceptable, addressesToExclude);
  }

  _getNearest(setupMode, verifiedOnly, rssiAtLeast=-100, scanDuration=5, returnFirstAcceptable=false, addressesToExclude=[]) {
    return new Promise((resolve, reject) => {
      let fallbackTimeout = null;
      let unsubscribe = null;

      let results = [];

      let finalize = () => {
        clearTimeout(fallbackTimeout);
        unsubscribe();
        this.stopScanning();

        if (results.length > 0) {
          results.sort((a,b) => { return a.rssi - b.rssi });
          resolve(results[0]);
        }
        else {
          reject("Timeout: No stones found");
        }
      }

      fallbackTimeout = setTimeout(() => { finalize()}, scanDuration * 1000);

      let checkResults = (data) => {
        if (addressesToExclude.indexOf(data.handle) !== -1 && addressesToExclude.indexOf(data.address) !== -1) {
          return;
        }
        if (data.rssi >= rssiAtLeast) {
          results.push(data);
          if (returnFirstAcceptable) {
            finalize();
          }
        }
      }

      if (verifiedOnly || setupMode) {
        unsubscribe = this.on(Topics.verifiedAdvertisement, (data) => {
          checkResults(data);
        })
      }
      else {
        unsubscribe = this.on(Topics.advertisement, (data) => {
          checkResults(data);
        })
      }

      this.startScanning()
    })
  }
}