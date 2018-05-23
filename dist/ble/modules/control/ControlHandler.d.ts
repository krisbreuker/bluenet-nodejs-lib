/// <reference types="node" />
import { BleHandler } from "../../BleHandler";
export declare class ControlHandler {
    ble: BleHandler;
    constructor(ble: any);
    getAndSetSessionNonce(): Promise<void>;
    setSwitchState(state: number): Promise<void>;
    disconnect(): Promise<void>;
    _writeControlPacket(packet: Buffer): Promise<void>;
}
