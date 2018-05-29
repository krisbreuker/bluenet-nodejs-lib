import { BleHandler } from "./ble/BleHandler";
import { BluenetSettings } from "./ble/BluenetSettings";
import { ControlHandler } from "./ble/modules/ControlHandler";
import { CloudHandler } from "./ble/modules/CloudHandler";
import { SetupHandler } from "./ble/modules/SetupHandler";
export default class Bluenet {
    ble: BleHandler;
    settings: BluenetSettings;
    control: ControlHandler;
    setup: SetupHandler;
    cloud: CloudHandler;
    constructor();
    /**
     *
     * @param keys
     * @param {string} referenceId
     * @param {boolean} encryptionEnabled
     */
    setSettings(keys: any, referenceId?: string, encryptionEnabled?: boolean): void;
    /**
     *
     * @returns {Promise<any>}
     */
    isReady(): Promise<{}>;
    linkCloud(userData: any): Promise<{}> | Promise<void>;
    connect(connectData: any, scanDuration?: number): Promise<void>;
    wait(seconds: any): Promise<{}>;
    setupCrownstone(handle: any, crownstoneId: any, meshAccessAddress: any, ibeaconUUID: any, ibeaconMajor: any, ibeaconMinor: any): Promise<{}>;
    disconnect(): Promise<{}>;
    cleanUp(): void;
    quit(): void;
    startScanning(): Promise<void>;
    stopScanning(): void;
    on(topic: any, callback: any): any;
    getNearestCrownstone(rssiAtLeast?: number, scanDuration?: number, returnFirstAcceptable?: boolean, addressesToExclude?: any[]): Promise<{}>;
    getNearestValidatedCrownstone(rssiAtLeast?: number, scanDuration?: number, returnFirstAcceptable?: boolean, addressesToExclude?: any[]): Promise<{}>;
    getNearestSetupStone(rssiAtLeast?: number, scanDuration?: number, returnFirstAcceptable?: boolean, addressesToExclude?: any[]): Promise<{}>;
    _getNearest(setupMode: any, verifiedOnly: any, rssiAtLeast?: number, scanDuration?: number, returnFirstAcceptable?: boolean, addressesToExclude?: any[]): Promise<{}>;
}
