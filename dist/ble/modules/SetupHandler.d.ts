/// <reference types="node" />
import { BleHandler } from "../BleHandler";
export declare class SetupHandler {
    ble: BleHandler;
    constructor(ble: any);
    setup(crownstoneId: any, meshAccessAddress: any, ibeaconUUID: any, ibeaconMajor: any, ibeaconMinor: any): Promise<{}>;
    handleSetupPhaseEncryption(): Promise<void>;
    getSessionKey(): Promise<Buffer>;
    getSessionNonce(): Promise<Buffer>;
}
