"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UartUtil_1 = require("../../../util/UartUtil");
const ESCAPE_TOKEN = 0x5c;
const BIT_FLIP_MASK = 0x40;
const START_TOKEN = 0x7e;
class UartWrapper {
    constructor(opCode, payload) {
        this.opCode = opCode;
        this.payload = payload;
    }
    escapeCharacters(payload) {
        let escapedPayload = [];
        for (let i = 0; i < payload.length; i++) {
            let byte = payload[i];
            if (byte === ESCAPE_TOKEN || byte === START_TOKEN) {
                escapedPayload.push(ESCAPE_TOKEN);
                let escapedByte = byte ^ BIT_FLIP_MASK;
                escapedPayload.push(escapedByte);
            }
            else {
                escapedPayload.push(byte);
            }
        }
        return Buffer.from(escapedPayload);
    }
    getPacket() {
        // get the length of the payload before escaping
        let baseLength = this.payload.length;
        // construct the basePacket, which is used for CRC calculation
        let basePacket = Buffer.alloc(4);
        basePacket.writeUInt16LE(this.opCode, 0);
        basePacket.writeUInt16LE(baseLength, 2);
        basePacket = Buffer.concat([basePacket, this.payload]);
        // calculate the CRC of the packet so
        let baseCrc = UartUtil_1.UartUtil.crc16_ccitt(basePacket);
        let crcBuffer = Buffer.alloc(2);
        crcBuffer.writeUInt16LE(baseCrc, 0);
        // append the CRC to the base packet to escape the entire thing
        basePacket = Buffer.concat([basePacket, crcBuffer]);
        // escape everything except the START_TOKEN
        let escapedPayload = this.escapeCharacters(basePacket);
        let uartPacket = Buffer.concat([Buffer.from([START_TOKEN]), escapedPayload]);
        return uartPacket;
    }
}
exports.UartWrapper = UartWrapper;
//# sourceMappingURL=UartWrapper.js.map