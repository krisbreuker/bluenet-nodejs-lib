"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UartUtil_1 = require("../../util/UartUtil");
const UartWrapperPacket_1 = require("./uartPackets/UartWrapperPacket");
const EventBus_1 = require("../../util/EventBus");
const ESCAPE_TOKEN = 0x5c;
const BIT_FLIP_MASK = 0x40;
const START_TOKEN = 0x7e;
const OPCODE_SIZE = 2;
const LENGTH_SIZE = 2;
const CRC_SIZE = 2;
const PREFIX_SIZE = OPCODE_SIZE + LENGTH_SIZE;
const WRAPPER_SIZE = PREFIX_SIZE + CRC_SIZE;
class UartReadBuffer {
    constructor(callback) {
        this.escapingNextToken = false;
        this.active = false;
        this.opCode = 0;
        this.reportedSize = 0;
        this.callback = null;
        this.buffer = [];
        this.escapingNextToken = false;
        this.active = false;
        this.opCode = 0;
        this.callback = callback;
        this.reportedSize = 0;
    }
    addByteArray(rawByteArray) {
        for (let i = 0; i < rawByteArray.length; i++) {
            this.add(rawByteArray[i]);
        }
    }
    add(byte) {
        // if (we have a start token and we are not active
        if (byte === START_TOKEN) {
            if (this.active) {
                console.log("WARN: MULTIPLE START TOKENS");
                EventBus_1.eventBus.emit("UartNoise", "multiple start token");
                // console.log("buf:", this.buffer)
                this.reset();
                return;
            }
            else {
                this.active = true;
                return;
            }
        }
        if (!this.active) {
            console.log("not active!", byte);
            return;
        }
        if (byte === ESCAPE_TOKEN) {
            if (this.escapingNextToken) {
                console.log("WARN: DOUBLE ESCAPE");
                EventBus_1.eventBus.emit("UartNoise", "double escape token");
                this.reset();
                return;
            }
            this.escapingNextToken = true;
            return;
        }
        // first get the escaping out of the way to avoid any double checks later on
        if (this.escapingNextToken) {
            byte ^= BIT_FLIP_MASK;
            this.escapingNextToken = false;
        }
        this.buffer.push(byte);
        let bufferSize = this.buffer.length;
        if (bufferSize == PREFIX_SIZE) {
            let sizeBuffer = Buffer.from(this.buffer.slice(OPCODE_SIZE, PREFIX_SIZE));
            this.reportedSize = sizeBuffer.readUInt16LE(0);
        }
        if (bufferSize > PREFIX_SIZE) {
            if (bufferSize == (this.reportedSize + WRAPPER_SIZE)) {
                this.process();
                return;
            }
            else if (bufferSize > this.reportedSize + WRAPPER_SIZE) {
                console.log("WARN: OVERFLOW");
                this.reset();
            }
        }
    }
    process() {
        let payload = this.buffer.slice(0, this.buffer.length - CRC_SIZE);
        let calculatedCrc = UartUtil_1.UartUtil.crc16_ccitt(payload);
        let crcBuffer = Buffer.from(this.buffer.slice(this.buffer.length - CRC_SIZE, this.buffer.length));
        let sourceCrc = crcBuffer.readUInt16LE(0);
        if (calculatedCrc != sourceCrc) {
            console.log("WARN: Failed CRC");
            EventBus_1.eventBus.emit("UartNoise", "crc mismatch");
            this.reset();
            return;
        }
        let packet = new UartWrapperPacket_1.UartPacket(Buffer.from(this.buffer));
        this.callback(packet);
        this.reset();
    }
    reset() {
        this.buffer = [];
        this.escapingNextToken = false;
        this.active = false;
        this.opCode = 0;
        this.reportedSize = 0;
    }
}
exports.UartReadBuffer = UartReadBuffer;
//# sourceMappingURL=UartReadBuffer.js.map