'use strict';
// __tests__/Intro-test.js
// Note: test renderer must be required after react-native.
import {EncryptionHandler} from "../src/util/EncryptionHandler";
import {BluenetSettings} from "../src/ble/BluenetSettings";
import 'jest';

// let jest = require('jest');

let settings = new BluenetSettings()
settings.loadKeys(true, 'AdminKeyOf16Byte', 'MemberKeyOf16Byt', 'GuestKeyOf16Byte','test');


test('CTR Encryption', () => {
  settings.setSessionNonce(Buffer.from([49,50,51,52,53]))
  let payload = [0,0,1,0,100]
  let payloadData = Buffer.from(payload)
  let data = EncryptionHandler.encrypt(payloadData, settings)

  let expectedResult = Buffer.from([128, 128, 128, 0, 171, 199, 94, 51, 230, 26, 253, 144, 182, 105, 56, 210, 94, 165, 184, 243])
  expect(data).toEqual(expectedResult);
});


test('CTR Decryption', () => {
  settings.setSessionNonce(Buffer.from([49,50,51,52,53]))
  let input = Buffer.from([128, 128, 128, 0, 171, 199, 94, 51, 230, 26, 253, 144, 182, 105, 56, 210, 94, 165, 184, 243])
  let data = EncryptionHandler.decrypt(input, settings)

  // added 0 padding which is added to data that will be encrypted. This is not stripped afterwards (by design)
  let expectedResult = Buffer.from([0,0,1,0,100,0,0,0,0,0,0,0])
  expect(data).toEqual(expectedResult);
});
