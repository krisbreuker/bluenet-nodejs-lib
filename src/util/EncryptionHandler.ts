import {BluenetSettings, UserLevel} from "../ble/BluenetSettings";
import {Session} from "inspector";
var crypto = require('crypto')
const aesjs = require('aes-js');



let BLOCK_LENGTH             = 16
let NONCE_LENGTH             = 16
let SESSION_DATA_LENGTH      = 5
let SESSION_KEY_LENGTH       = 4
let PACKET_USER_LEVEL_LENGTH = 1
let PACKET_NONCE_LENGTH      = 3
let CHECKSUM                 = 0xcafebabe

let BLUENET_ENCRYPTION_TESTING = false


class AESCounter {
  _counter : Uint8Array;

  constructor( IV : Buffer ) {
    let counterBuffer = Buffer.alloc(BLOCK_LENGTH);
    IV.copy(counterBuffer,0,0);

    this._counter = new Uint8Array(counterBuffer);
  }

  increment() {
    // we'll never need more than 256*16 bytes
    this._counter[BLOCK_LENGTH-1]++;
  }


}

export class EncryptionHandler {

  static decryptSessionNonce(rawNonce: Buffer, key: Buffer) {
    if (key.length      !== 16) { throw "Invalid Key"; }
    if (rawNonce.length !== 16) { throw "Invalid Payload for sessionNonce decrypting!"; }

    var aesEcb = new aesjs.ModeOfOperation.ecb(key);
    var decrypted = Buffer.from(aesEcb.decrypt(rawNonce));

    // start validation
    if (0xcafebabe === decrypted.readUInt32LE(0)) {
      return decrypted.slice(4,4+SESSION_DATA_LENGTH);
    }
    else {
      throw "Could not validate Session Nonce";
    }
  }



  static encrypt( data : Buffer, settings : BluenetSettings ) {
    if (settings.sessionNonce == null) {
      throw "BleError.NO_SESSION_NONCE_SET";
    }

    if (settings.userLevel == UserLevel.unknown) {
      throw "BleError.DO_NOT_HAVE_ENCRYPTION_KEY";
    }

    // unpack the session data
    let sessionData = new SessionData(settings.sessionNonce)

    // create Nonce array
    let nonce = Buffer.alloc(PACKET_NONCE_LENGTH);
    EncryptionHandler.fillWithRandomNumbers(nonce)

    let IV = EncryptionHandler.generateIV(nonce, sessionData.sessionNonce);
    let counterBuffer = Buffer.alloc(BLOCK_LENGTH);
    IV.copy(counterBuffer,0,0);

    // get key
    let key = EncryptionHandler._getKey(settings.userLevel, settings)

    // get the packet size. This must fit the data and the session key and be an integer amount of blocks
    let packetSize = (data.length + SESSION_KEY_LENGTH) + BLOCK_LENGTH - (data.length + SESSION_KEY_LENGTH) % BLOCK_LENGTH;

    let paddedPayload = Buffer.alloc(packetSize)
    sessionData.validationKey.copy(paddedPayload,0,0,SESSION_KEY_LENGTH)

    // put the input data in the padded payload
    data.copy(paddedPayload,SESSION_KEY_LENGTH, 0);

    // do the actual encryption
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counterBuffer));
    let encryptedBytes = aesCtr.encrypt(paddedPayload);
    let encryptedBuffer = Buffer.from(encryptedBytes);

    // assemble the result package
    let result = Buffer.alloc(encryptedBytes.length + PACKET_NONCE_LENGTH + PACKET_USER_LEVEL_LENGTH)
    nonce.copy(result, 0,0, PACKET_NONCE_LENGTH);
    result.writeUInt8(settings.userLevel, PACKET_NONCE_LENGTH);
    encryptedBuffer.copy(result, PACKET_NONCE_LENGTH + PACKET_USER_LEVEL_LENGTH,0);

    return result;
  }

  static decrypt( data: Buffer, settings: BluenetSettings ) {
    if (settings.sessionNonce == null) {
      throw "BleError.NO_SESSION_NONCE_SET"
    }

    // unpack the session data
    let sessionData = new SessionData(settings.sessionNonce)

    // decrypt data
    let decrypted = EncryptionHandler._decrypt(data, sessionData, settings)
    // verify decryption success and strip checksum
    let result = EncryptionHandler._verifyDecryption(decrypted, sessionData)

    return result;
  }

  static _decrypt(data : Buffer, sessionData: SessionData, settings: BluenetSettings) {
    let encryptedPackage = new EncryptedPackage(data);

    let key = EncryptionHandler._getKey(encryptedPackage.userLevel, settings)

    let IV = EncryptionHandler.generateIV(encryptedPackage.nonce, sessionData.sessionNonce)

    let counterBuffer = Buffer.alloc(BLOCK_LENGTH);
    IV.copy(counterBuffer,0,0);

    // do the actual encryption
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counterBuffer));
    let decryptedBytes = aesCtr.decrypt(encryptedPackage.getPayload());

    return Buffer.from(decryptedBytes);
  }

  static _verifyDecryption(decrypted : Buffer, sessionData: SessionData) {
    if (decrypted.readUInt32LE(0) === sessionData.validationKey.readUInt32LE(0)) {
      // remove checksum from decyption and return payload
      let result = Buffer.alloc(decrypted.length - SESSION_KEY_LENGTH)
      decrypted.copy(result,0, SESSION_KEY_LENGTH)
      return result
    }
    else {
      throw 'BleError.COULD_NOT_DECRYPT'
    }
  }


  static decryptAdvertisement(data, key) {
    let aesEcb = new aesjs.ModeOfOperation.ecb(key);

    let decrypted = aesEcb.decrypt(data);
    // convert from UInt8Array to Buffer
    let decryptedBuffer = Buffer.from(decrypted);
    return decryptedBuffer;
  }


  static generateIV(packetNonce: Buffer, sessionData: Buffer) : Buffer {
    if (packetNonce.length != PACKET_NONCE_LENGTH) {
      throw "BleError.INVALID_SIZE_FOR_SESSION_NONCE_PACKET"
    }

    let IV = Buffer.alloc(NONCE_LENGTH);

    // the IV used in the CTR mode is 8 bytes, the first 3 are random
    packetNonce.copy(IV,0,0)

    // the IV used in the CTR mode is 8 bytes, the last 5 are from the session data
    sessionData.copy(IV,PACKET_NONCE_LENGTH,0)

    return IV
  }

  static _getKey(userLevel, settings: BluenetSettings) : Buffer {
    if (settings.initializedKeys == false && userLevel != UserLevel.setup) {
      throw "BleError.COULD_NOT_ENCRYPT_KEYS_NOT_SET"
    }

    let key = null;
    switch (userLevel) {
      case UserLevel.admin:
        key = settings.adminKey;
        break;
      case UserLevel.member:
        key = settings.memberKey;
        break;
      case UserLevel.guest:
        key = settings.guestKey;
        break;
      case UserLevel.setup:
        key = settings.setupKey;
        break;
      default:
        throw "BleError.INVALID_KEY_FOR_ENCRYPTION"
    }

    if (key == null) {
      throw "BleError.DO_NOT_HAVE_ENCRYPTION_KEY"
    }

    if (key.length !== 16) {
      throw "BleError.DO_NOT_HAVE_ENCRYPTION_KEY"
    }

    return key
  }

  static fillWithRandomNumbers(buff) {
    if (global["BLUENET_ENCRYPTION_TESTING"]) {
      for (let i = 0; i < buff.length; i++) {
        buff.writeUInt8(128, i);
      }
      return;
    }
    crypto.randomFillSync(buff, 0, buff.length);
  }
}


export class SessionData {
  sessionNonce  = null
  validationKey = null

  constructor(sessionData) {
    if (sessionData.length != SESSION_DATA_LENGTH) {
      throw "BleError.INVALID_SESSION_DATA"
    }

    this.sessionNonce = Buffer.from(sessionData);
    this.validationKey = this.sessionNonce.slice(0,4);

  }
}


export class EncryptedPackage {
  nonce     : Buffer = null
  userLevel : number = null
  payload   : Buffer = null

  constructor(data : Buffer) {
    let prefixLength = PACKET_NONCE_LENGTH + PACKET_USER_LEVEL_LENGTH
    if (data.length < prefixLength) {
      throw 'BleError.INVALID_PACKAGE_FOR_ENCRYPTION_TOO_SHORT'
    }

    this.nonce = Buffer.alloc(PACKET_NONCE_LENGTH);
    data.copy(this.nonce, 0,0, PACKET_NONCE_LENGTH);
    // 20 is the minimal size of a packet (3+1+16)
    if (data.length < 20) {
      throw 'BleError.INVALID_PACKAGE_FOR_ENCRYPTION_TOO_SHORT'
    }

    this.userLevel = data.readUInt8(PACKET_NONCE_LENGTH);
    // only allow 0, 1, 2 for Admin, User, Guest and 100 for Setup
    if (this.userLevel > 2 && this.userLevel != UserLevel.setup) {
      throw 'BleError.INVALID_KEY_FOR_ENCRYPTION'
    }

    let payloadData = Buffer.alloc(data.length - prefixLength)
    data.copy(payloadData, 0, prefixLength, data.length);

    if (payloadData.length % 16 != 0) {
      throw 'BleError.INVALID_SIZE_FOR_ENCRYPTED_PAYLOAD'
    }

    this.payload = payloadData;
  }

  getPayload() : Buffer {
    if (this.payload != null) {
      return this.payload;
    }
    throw "BleError.CAN_NOT_GET_PAYLOAD"
  }
}

