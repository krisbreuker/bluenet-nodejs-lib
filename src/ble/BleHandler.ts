import {Validator} from "./Validator";
import {
  CROWNSTONE_PLUG_ADVERTISEMENT_SERVICE_UUID,
  CROWNSTONE_BUILTIN_ADVERTISEMENT_SERVICE_UUID,
  CROWNSTONE_GUIDESTONE_ADVERTISEMENT_SERVICE_UUID
} from "../protocol/Services";
import {BluenetSettings} from "./BluenetSettings";

var noble = require('noble');

export class BleHandler {
  nobleState = 'unknown';
  validator : Validator;
  settings : BluenetSettings;

  constructor(settings) {
    this.settings = settings;
    this.validator = new Validator(settings);

    // <"unknown" | "resetting" | "unsupported" | "unauthorized" | "poweredOff" | "poweredOn">
    noble.on('stateChange', (state) => {
      this.nobleState = state;
      console.log("StateChange",state)
    });
  }


  connect() {

  }

  isReady() {
    return new Promise((resolve, reject) => {
      let interval = setInterval(() => {
        if (this.nobleState === 'poweredOn') {
          clearInterval(interval);
          resolve()
        }
        else if (this.nobleState !== 'unknown') {
          clearInterval(interval);
          reject("Noble State (BLE-handling-lib) is not usable: " + this.nobleState);
        }
      }, 500);
    })
  }

  disconnect() {}

  startScanning() {
    console.log("StartScanning")
    noble.startScanning([CROWNSTONE_PLUG_ADVERTISEMENT_SERVICE_UUID, CROWNSTONE_BUILTIN_ADVERTISEMENT_SERVICE_UUID, CROWNSTONE_GUIDESTONE_ADVERTISEMENT_SERVICE_UUID], true);
  }

  stopScanning() {}

  writeToCharacteristic() {}

  readCharacteristic() {}

  readCharacteristicWithoutEncryption() {}

  getCharacteristic() {}

  setupSingleNotification() {}

  setupNotificationStream() {}
}