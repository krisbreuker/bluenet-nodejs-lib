import { BleHandler } from "./ble/BleHandler";
import { BluenetSettings } from "./ble/BluenetSettings";
import { ControlHandler } from "./ble/modules/control/ControlHandler";
export default class Bluenet {
    ble: BleHandler;
    settings: BluenetSettings;
    control: ControlHandler;
    constructor();
    setSettings(keys: any, referenceId?: string, encryptionEnabled?: boolean): void;
    isReady(): Promise<{}>;
    connect(connectData: any, scanDuration: any): Promise<void>;
    wait(seconds: any): Promise<{}>;
    setupCrownstone(): void;
    disconnect(): Promise<{}>;
    quit(): void;
    startScanning(): Promise<void>;
    stopScanning(): void;
    on(topic: any, callback: any): any;
}
