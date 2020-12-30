"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wrapper for all relevant data of the object
 *
 */
const DataStepper_1 = require("../../../util/DataStepper");
class UartPacket {
    constructor(data) {
        this.valid = false;
        this.load(data);
    }
    load(data) {
        let minSize = 6; // opcode, size and crc
        if (data.length >= minSize) {
            this.valid = true;
            let stepper = new DataStepper_1.DataStepper(data);
            try {
                this.opCode = stepper.getUInt16();
                this.size = stepper.getUInt16();
                let totalSize = minSize + this.size;
                if (data.length >= totalSize) {
                    this.payload = stepper.getBuffer(this.size);
                    this.crc = stepper.getUInt16();
                }
                else {
                    this.valid = false;
                }
            }
            catch (err) {
                this.valid = false;
            }
        }
        else {
            this.valid = false;
        }
    }
}
exports.UartPacket = UartPacket;
//# sourceMappingURL=UartWrapperPacket.js.map