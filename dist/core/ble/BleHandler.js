"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Scanner_1 = require("./Scanner");
const EncryptionHandler_1 = require("../../util/EncryptionHandler");
const NotificationMerger_1 = require("../../util/NotificationMerger");
const BluenetTypes_1 = require("../../protocol/BluenetTypes");
const BluenetError_1 = require("../../BluenetError");
const Util_1 = require("../../util/Util");
class BleHandler {
    constructor(settings) {
        this.connectedPeripheral = null;
        this.connectionSessionId = null;
        this.connectionPending = false;
        this.settings = settings;
        this.scanner = new Scanner_1.Scanner(settings);
    }
    /**
     * Connect is either a handle or a peripheral object
     * @param connectData
     */
    connect(connectData, scanDuration) {
        return this._connect(connectData, scanDuration)
            .then((peripheral) => {
            console.log("Getting Services...");
            return this._getServices(peripheral);
        })
            .then((services) => {
            console.log("Getting Characteristics...");
            return this._getCharacteristics(services);
        })
            .then(() => {
            console.log("Connection process complete.");
        })
            .catch((err) => { console.log(err); throw err; });
    }
    _connect(connectData, scanDuration) {
        return new Promise((resolve, reject) => {
            if (typeof connectData === 'object' && connectData.connect !== undefined) {
                // connect to this.
                resolve(connectData);
            }
            else {
                if (typeof connectData === 'object' && connectData.handle !== undefined) {
                    connectData = connectData.handle;
                }
                else if (typeof connectData === 'object' && connectData.address !== undefined) {
                    connectData = connectData.address;
                }
                // this is an UUID.
                console.log("Trying to get Peripheral...");
                return this.scanner.getPeripheral(connectData, scanDuration)
                    .then((peripheral) => {
                    console.log("Peripheral obtained...");
                    resolve(peripheral);
                })
                    .catch((err) => {
                    console.log("Failed to get peripheral", err);
                    reject(err);
                });
            }
        })
            .then((peripheral) => {
            if (this.connectedPeripheral !== null) {
                if (peripheral.uuid === this.connectedPeripheral.peripheral.uuid) {
                    return peripheral;
                }
                throw new BluenetError_1.BluenetError(BluenetError_1.BluenetErrorType.ALREADY_CONNECTED_TO_SOMETHING_ELSE, "Bluenet is already connected to another Crownstone.");
            }
            // connecting run
            return new Promise((resolve, reject) => {
                // if this has the connect method implemented....
                if (peripheral.connect) {
                    this.connectionPending = true;
                    peripheral.connect((err, connectedPeripheral) => {
                        if (err) {
                            this.connectionPending = false;
                            reject(err);
                        }
                        else {
                            console.log("Connected successfully!");
                            this.connectionPending = false;
                            this._setConnectedPeripheral(connectedPeripheral);
                            resolve(connectedPeripheral);
                        }
                    });
                }
                else {
                    reject(new BluenetError_1.BluenetError(BluenetError_1.BluenetErrorType.INVALID_PERIPHERAL, "Invalid peripheral to connect to."));
                }
            });
        });
    }
    _getServices(peripheral) {
        return new Promise((resolve, reject) => {
            peripheral.discoverServices([], (err, services) => {
                if (err) {
                    return reject(err);
                }
                services.forEach((service) => {
                    this.connectedPeripheral.services[service.uuid] = service;
                });
                resolve(services);
            });
        });
    }
    _getCharacteristics(services) {
        return new Promise((resolve, reject) => {
            let promises = [];
            services.forEach((service) => {
                promises.push(this._getCharacteristicsFromService(service));
            });
            Promise.all(promises)
                .then(() => {
                resolve();
            })
                .catch((err) => { reject(err); });
        });
    }
    _getCharacteristicsFromService(service) {
        return new Promise((resolve, reject) => {
            service.discoverCharacteristics([], (err, characteristics) => {
                if (err) {
                    return reject(err);
                }
                characteristics.forEach((characteristic) => {
                    if (this.connectedPeripheral.characteristics[service.uuid] === undefined) {
                        this.connectedPeripheral.characteristics[service.uuid] = {};
                    }
                    this.connectedPeripheral.characteristics[service.uuid][characteristic.uuid] = characteristic;
                });
                resolve(characteristics);
            });
        });
    }
    _setConnectedPeripheral(peripheral) {
        peripheral.once("disconnect", () => {
            console.log("Disconnected from Device, cleaning up...");
            this.connectedPeripheral = null;
        });
        this.connectionSessionId = Util_1.Util.getUUID();
        this.connectedPeripheral = { peripheral: peripheral, services: {}, characteristics: {} };
    }
    startScanning() {
        return this.scanner.start();
    }
    stopScanning() {
        return this.scanner.stop();
    }
    isReady() {
        return this.scanner.isReady();
    }
    disconnect() {
        console.log("BleHandler: starting disconnect.....");
        return new Promise((resolve, reject) => {
            if (this.connectedPeripheral !== null) {
                console.log("BleHandler: Disconnecting from peripheral.....");
                this.connectedPeripheral.peripheral.disconnect((err) => {
                    if (err) {
                        console.log("BleHandler: Disconnecting Failed...");
                        return reject(err);
                    }
                    console.log("BleHandler: Disconnected successfully.");
                    this.connectionPending = false;
                    this.connectedPeripheral = null;
                    resolve();
                });
            }
            else {
                console.log("BleHandler: Not connected in the first place. Success!");
                resolve();
            }
        });
    }
    waitForPeripheralToDisconnect(timeoutInSeconds) {
        return new Promise((resolve, reject) => {
            if (this.connectedPeripheral) {
                let timeoutPassed = false;
                let timeout = setTimeout(() => { timeoutPassed = true; reject(); }, timeoutInSeconds * 1000);
                this.connectedPeripheral.peripheral.once("disconnect", () => {
                    if (timeoutPassed === false) {
                        clearTimeout(timeout);
                        resolve();
                    }
                });
            }
            else {
                resolve();
            }
        });
    }
    errorDisconnect() {
        return this.disconnect()
            .catch((err) => { });
    }
    writeToCharacteristic(serviceId, characteristicId, data, encryptionEnabled = true) {
        return new Promise((resolve, reject) => {
            let dataToUse = data;
            if (encryptionEnabled) {
                dataToUse = EncryptionHandler_1.EncryptionHandler.encrypt(data, this.settings);
            }
            this.getCharacteristic(serviceId, characteristicId)
                .then((characteristic) => {
                characteristic.write(dataToUse, false, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            })
                .catch((err) => { reject(err); });
        });
    }
    readCharacteristic(serviceId, characteristicId, encryptionEnabled = true) {
        return new Promise((resolve, reject) => {
            this.getCharacteristic(serviceId, characteristicId)
                .then((characteristic) => {
                characteristic.read((err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            })
                .catch((err) => { reject(err); });
        });
    }
    readCharacteristicWithoutEncryption(serviceId, characteristicId) {
        return this.readCharacteristic(serviceId, characteristicId, false);
    }
    cleanUp() {
        this.scanner.cleanUp();
    }
    getService(serviceId) {
        return new Promise((resolve, reject) => {
            if (!this.connectedPeripheral) {
                return reject("NOT CONNECTED");
            }
            let service = this.connectedPeripheral.services[serviceId];
            if (!service) {
                return reject("Service Unknown:" + serviceId + " in list:" + JSON.stringify(Object.keys(this.connectedPeripheral.services)));
            }
            resolve(service);
        });
    }
    getCharacteristic(serviceId, characteristicId) {
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
    setupSingleNotification(serviceId, characteristicId, writeCommand) {
        return this.getCharacteristic(serviceId, characteristicId)
            .then((characteristic) => {
            return new Promise((resolve, reject) => {
                let cleanUp = (err) => {
                    // cleanup listeners
                    characteristic.removeListener('data', collectDataCallback);
                    if (err) {
                        return reject(err);
                    }
                };
                let mergedDataCallback = (data) => {
                    cleanUp(null);
                    // first we check if we have to decrypt this data.
                    if (this.settings.encryptionEnabled) {
                        data = EncryptionHandler_1.EncryptionHandler.decrypt(data, this.settings);
                    }
                    resolve(data);
                };
                let merger = new NotificationMerger_1.NotificationMerger(mergedDataCallback);
                let collectDataCallback = (data, isNotification) => {
                    if (isNotification) {
                        merger.merge(data);
                    }
                };
                characteristic.on('data', collectDataCallback);
                characteristic.once('notify', (state) => {
                    if (state === true) {
                        // great!
                        writeCommand();
                    }
                    else {
                        cleanUp("Failed to subscribe to notifications");
                    }
                });
                characteristic.subscribe((err) => { if (err) {
                    return cleanUp(err);
                } });
            });
        });
    }
    setupNotificationStream(serviceId, characteristicId, writeCommand, processHandler, timeoutSeconds = 5) {
        return this.getCharacteristic(serviceId, characteristicId)
            .then((characteristic) => {
            return new Promise((resolve, reject) => {
                let fallbackTimeout = setTimeout(() => { cleanUp("Notification Stream Timeout"); }, timeoutSeconds * 1000);
                let cleanUp = (err) => {
                    // cleanup listeners
                    clearTimeout(fallbackTimeout);
                    characteristic.removeListener('data', collectDataCallback);
                    characteristic.unsubscribe();
                    if (err) {
                        return reject(err);
                    }
                };
                let mergedDataCallback = (data) => {
                    // first we check if we have to decrypt this data.
                    if (this.settings.encryptionEnabled) {
                        data = EncryptionHandler_1.EncryptionHandler.decrypt(data, this.settings);
                    }
                    let instruction = processHandler(data);
                    if (instruction === BluenetTypes_1.ProcessType.ABORT_ERROR) {
                        cleanUp("Abort");
                    }
                    else if (instruction === BluenetTypes_1.ProcessType.CONTINUE) {
                        // do nothing and wait
                    }
                    else if (instruction === BluenetTypes_1.ProcessType.FINISHED) {
                        cleanUp(null);
                        return resolve();
                    }
                    else {
                        cleanUp("Unknown instruction");
                    }
                };
                let merger = new NotificationMerger_1.NotificationMerger(mergedDataCallback);
                let collectDataCallback = (data, isNotification) => {
                    console.log("Got Data", data, isNotification);
                    if (isNotification) {
                        merger.merge(data);
                    }
                };
                characteristic.on('data', collectDataCallback);
                characteristic.once('notify', (state) => {
                    if (state === true) {
                        // great!
                        writeCommand();
                    }
                    else {
                        cleanUp("Failed to subscribe to notifications");
                    }
                });
                characteristic.subscribe((err) => { if (err) {
                    return cleanUp(err);
                } });
            });
        });
    }
}
exports.BleHandler = BleHandler;
//# sourceMappingURL=BleHandler.js.map