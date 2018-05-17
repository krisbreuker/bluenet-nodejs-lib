import {DeviceType} from "../protocol/BluenetTypes";
import {parseOpCode3, parseOpCode4, parseOpCode5, parseOpCode6} from "./parsers";
import {BluenetSettings} from "../ble/BluenetSettings";
let aesjs = require('aes-js');

export class ServiceData {
  opCode             = 0
  dataType           = 0
  crownstoneId       = 0
  switchState        = 0
  flagsBitmask       = 0
  temperature        = 0
  powerFactor        = 1
  powerUsageReal     = 0
  powerUsageApparent = 0
  accumulatedEnergy  = 0
  setupMode          = false
  stateOfExternalCrownstone = false

  data : Buffer
  encryptedData : Buffer
  encryptedDataStartIndex : number;

  dimmingAvailable
  dimmingAllowed
  hasError
  switchLocked

  partialTimestamp
  timestamp

  validation

  errorTimestamp
  errorsBitmask
  errorMode
  timeIsSet
  switchCraftEnabled

  uniqueIdentifier

  deviceType = 'undefined';
  rssiOfExternalCrownstone = 0

  validData = false
  dataReadyForUse = false // decryption is successful


  constructor(data : Buffer) {
    this.data = data;
    this.validData = true;
    if (data.length === 18) {
      this.encryptedData = data.slice(2)
      this.encryptedDataStartIndex = 2
    }
    else if (data.length === 17) {
      this.encryptedData = data.slice(1)
      this.encryptedDataStartIndex = 1;
    }
    else {
      this.validData = false;
    }
  }

  parse() {
    this.validData = true;
    if (this.data.length === 18) {
      this.opCode = this.data.readUInt8(0)
      switch (this.opCode) {
        case 5:
          parseOpCode5(this, this.data)
        case 6:
          parseOpCode6(this, this.data)
        default:
          parseOpCode5(this, this.data)
      }
    }
    else if (this.data.length === 17) {
      this.opCode = this.data[0]
      switch (this.opCode) {
        case 3:
          parseOpCode3(this, this.data)
        case 4:
          parseOpCode4(this, this.data)
        default:
          parseOpCode3(this, this.data)
      }
    }
    else {
      this.validData = false;
    }
  }

  hasCrownstoneDataFormat() {
    return this.validData;
  }

  getJSON() {}

  isSetupPackage() {
    if (this.validData) {
      return false
    }

    return this.setupMode
  }

  decrypt(key) {
    if (this.validData && this.encryptedData.length === 16) {
      let aesEcb = new aesjs.ModeOfOperation.ecb(key);

      let decrypted = aesEcb.decrypt(this.encryptedData);
      // convert from UInt8Array to Buffer
      let decryptedBuffer = Buffer.from(decrypted);

      // copy decrypted data back in to data buffer.
      decryptedBuffer.copy(this.data, this.encryptedDataStartIndex);

      this.dataReadyForUse = true;
    }
  }
}