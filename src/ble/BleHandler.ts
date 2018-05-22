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
  connect(connectData, scanDuration) {
    this._connect(connectData, scanDuration)
      .then(() => {

      })
  }

  _connect(connectData, scanDuration) {
    let connectedPeripheral = null;
    return new Promise((resolve, reject) => {
      if (typeof connectData === 'object' && connectData.connect !== undefined) {
        // connect to this.
        resolve(connectData);
      }
      else {
        // this is an UUID.
        console.log("Trying to get Peripheral...")
        return this.scanner.getPeripheral(connectData, scanDuration)
          .then((peripheral) => {
            console.log("Peripheral obtained...")
            resolve(peripheral)
          })
          .catch((err) => {
            console.log("ERROR WHILE CONNECT", err);
          })
      }
    })
      .then((peripheral : any) => {
        // connecting run
        peripheral.once('servicesDiscover', (x) => { console.log('servicesDiscovered', x)});
        peripheral.once('disconnect', (x) => { console.log('disconnect', x)});
        peripheral.once('connect', (x) => { console.log('connect', x)});

        connectedPeripheral = peripheral;
        return new Promise((resolve, reject) => {
          if (peripheral.connect) {
            peripheral.once('connect', () => {
              resolve();
            })
            console.log("CONNECTING here")
            peripheral.connect((err) => { console.log("THRE WAS AN ERROR", err)});
          }
          else {
            reject("Invalid peripheral to connect to.")
          }
        })
      })
      .then(() => {
        console.log("CONNECTED!")
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

  writeToCharacteristic(serviceId, characteristicId, data, encryptionEnabled = true) {

  }

  readCharacteristic() {}

  readCharacteristicWithoutEncryption() {}

  getService(serviceId) {}
  getCharacteristic(serviceId, characteristicId) {}

  setupSingleNotification() {}

  setupNotificationStream() {}
}