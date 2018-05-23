import {
  CROWNSTONE_PLUG_ADVERTISEMENT_SERVICE_UUID,
  CROWNSTONE_BUILTIN_ADVERTISEMENT_SERVICE_UUID,
  CROWNSTONE_GUIDESTONE_ADVERTISEMENT_SERVICE_UUID
} from "../protocol/Services";
import {BluenetSettings} from "./BluenetSettings";
import {Scanner} from "./Scanner";
import {EncryptionHandler} from "../util/EncryptionHandler";


export class BleHandler {
  scanner : Scanner;
  settings : BluenetSettings;

  connectedPeripheral = null;

  constructor(settings) {
    this.settings = settings;
    this.scanner = new Scanner(settings);
  }


  /**
   * Connect is either a handle or a peripheral object
   * @param connectData
   */
  connect(connectData, scanDuration) {
    return this._connect(connectData, scanDuration)
      .then((peripheral) => {
        console.log("Getting Services...")
        return this._getServices(peripheral);
      })
      .then((services) => {
        console.log("Getting Characteristics...")
        return this._getCharacteristics(services);
      })
      .then(() => {
        console.log("Done")
      })
      .catch((err) => { console.log(err); throw err;})
  }

  _connect(connectData, scanDuration) {
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
            console.log("Failed to get peripheral", err);
          })
      }
    })
      .then((peripheral : any) => {
        // connecting run
        return new Promise((resolve, reject) => {
          // if this has the connect method implemented....
          if (peripheral.connect) {
            peripheral.connect((err) => {
              if (err) {
                reject(err);
              }
              else {
                console.log("Connected successfully!")
                this._setConnectedPeriphral(peripheral)
                resolve(peripheral);
              }
            });
          }
          else {
            reject("Invalid peripheral to connect to.")
          }
        })
      })
  }

  _getServices(peripheral) {
    return new Promise((resolve, reject) => {
      peripheral.discoverServices([], (err, services) => {
        if (err) { return reject(err) };

        services.forEach((service) => {
          this.connectedPeripheral.services[service.uuid] = service;
        })
        resolve(services);
      })
    })
  }

  _getCharacteristics(services) {
    return new Promise((resolve, reject) => {
      let promises = [];
      services.forEach((service) => {
        promises.push(this._getCharacteristicsFromService(service));
      })

      Promise.all(promises)
        .then(() => {
          resolve();
        })
        .catch((err) => { reject(err); })
    })
  }

  _getCharacteristicsFromService(service) {
    return new Promise((resolve, reject) => {
      service.discoverCharacteristics([], (err, characteristics) => {
        if (err) { return reject(err) };

        characteristics.forEach((characteristic) => {
          if (this.connectedPeripheral.characteristics[service.uuid] === undefined) {
            this.connectedPeripheral.characteristics[service.uuid] = {};
          }

          this.connectedPeripheral.characteristics[service.uuid][characteristic.uuid] = characteristic;
        })
        resolve(characteristics);
      })
    })
  }

  _setConnectedPeriphral(peripheral) {
    peripheral.once("disconnect", () => {
      console.log("Disconnected from Device, cleaning up...");
      this.connectedPeripheral = null;
    })

    this.connectedPeripheral = {peripheral: peripheral, services: {}, characteristics: {}};
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

  disconnect() {
    return new Promise((resolve, reject) => {
      if (this.connectedPeripheral) {
        this.connectedPeripheral.peripheral.disconnect((err) => {
          if (err) { return reject(err); }

          resolve();
        })
      }
      else {
        resolve();
      }
    })
  }

  writeToCharacteristic(serviceId, characteristicId, data, encryptionEnabled = true) : Promise<void> {
    return new Promise((resolve, reject) => {

      let dataToUse = data;
      if (encryptionEnabled) {
        dataToUse = EncryptionHandler.encrypt(data, this.settings)
      }

      this.getCharacteristic(serviceId, characteristicId)
        .then((characteristic) => {
          characteristic.write(
            dataToUse,
            false,
            (err) => {
              if (err) { return reject(err); }
              resolve();
            }
          )
        })
        .catch((err) => { reject(err) })
    })
  }

  readCharacteristic(serviceId, characteristicId, encryptionEnabled = true) : Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.getCharacteristic(serviceId, characteristicId)
        .then((characteristic) => {
          characteristic.read((err, data) => {
            if (err) { return reject(err); }
            resolve(data);
          })
        })
        .catch((err) => { reject(err) })
    });
  }

  readCharacteristicWithoutEncryption(serviceId, characteristicId) {
    return this.readCharacteristic(serviceId, characteristicId, false);
  }

  quit() {
    this.scanner.quit()
  }

  getService(serviceId) {
  }


  getCharacteristic(serviceId, characteristicId) : Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.connectedPeripheral) {
        return reject("NOT CONNECTED");
      }

      let serviceList = this.connectedPeripheral.characteristics[serviceId];

      if (!serviceList) {
        return reject("Service Unknown:" + serviceId + " in list:" + JSON.stringify(Object.keys(this.connectedPeripheral.characteristics)));
      }

      let characteristic = serviceList[characteristicId];

      if (!characteristic) {
        return reject("Characteristic Unknown:" + characteristicId + " in list:" + JSON.stringify(Object.keys(serviceList)));
      }

      resolve(characteristic);
    });
  }

  setupSingleNotification() {}

  setupNotificationStream() {}
}