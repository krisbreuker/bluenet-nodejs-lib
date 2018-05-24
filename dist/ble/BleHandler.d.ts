/// <reference types="node" />
import { BluenetSettings } from "./BluenetSettings";
import { Scanner } from "./Scanner";
export declare class BleHandler {
    scanner: Scanner;
    settings: BluenetSettings;
    connectedPeripheral: any;
    constructor(settings: any);
    /**
     * Connect is either a handle or a peripheral object
     * @param connectData
     */
    connect(connectData: any, scanDuration: any): Promise<void>;
    _connect(connectData: any, scanDuration: any): Promise<{}>;
    _getServices(peripheral: any): Promise<{}>;
    _getCharacteristics(services: any): Promise<{}>;
    _getCharacteristicsFromService(service: any): Promise<{}>;
    _setConnectedPeriphral(peripheral: any): void;
    startScanning(): Promise<void>;
    stopScanning(): void;
    isReady(): Promise<{}>;
    disconnect(): Promise<{}>;
    writeToCharacteristic(serviceId: any, characteristicId: any, data: any, encryptionEnabled?: boolean): Promise<void>;
    readCharacteristic(serviceId: any, characteristicId: any, encryptionEnabled?: boolean): Promise<Buffer>;
    readCharacteristicWithoutEncryption(serviceId: any, characteristicId: any): Promise<Buffer>;
    quit(): void;
    getService(serviceId: any): Promise<{}>;
    getCharacteristic(serviceId: any, characteristicId: any): Promise<any>;
    setupSingleNotification(): void;
    setupNotificationStream(): void;
}
