import {
  CROWNSTONE_PLUG_ADVERTISEMENT_SERVICE_UUID,
  CROWNSTONE_BUILTIN_ADVERTISEMENT_SERVICE_UUID,
  CROWNSTONE_GUIDESTONE_ADVERTISEMENT_SERVICE_UUID
} from "../protocol/Services";
import {BluenetSettings} from "./BluenetSettings";
import {Scanner} from "./Scanner";


export class BleHandler {
  scanner : Scanner;
  settings : BluenetSettings;

  constructor(settings) {
    this.settings = settings;
    this.scanner = new Scanner(settings);
  }


  /**
   * Connect is either a handle or a peripheral object
   * @param connectData
   */
  connect(connectData) {
    let connectedPeripheral = null;
    return new Promise((resolve, reject) => {
      if (typeof connectData === 'object' && connectData.connect !== undefined) {
        // connect to this.
        resolve(connectData);
      }
      else {
        // this is an UUID.
        console.log("Trying to get Peripheral...")
        return this.scanner.getPeripheral(connectData)
          .then((peripheral) => {
            resolve(peripheral)
          })
          .catch((err) => {
            console.log("ERROR WHILE CONNECT", err);
          })
      }
    })
    .then((peripheral : any) => {
      // connecting run
      console.log("GOT PERIPHERAL")
      connectedPeripheral = peripheral;
      return new Promise((resolve, reject) => {
        if (peripheral.connect) {
          peripheral.once('connect', () => {
            resolve();
          })
          peripheral.connect();
        }
        else {
          reject("Invalid peripheral to connect to.")
        }
      })
    })
    .then(() => {
      console.log("CONNETED!")
    })
  }

  startScanning() {
    return this.scanner.start();
  }

  stopScanning() {
    this.scanner.stop();
  }

  isReady() {
    return this.scanner.isReady();
  }

  disconnect() {}

  writeToCharacteristic() {}

  readCharacteristic() {}

  readCharacteristicWithoutEncryption() {}

  getCharacteristic() {}

  setupSingleNotification() {}

  setupNotificationStream() {}
}