import {ControlPacketsGenerator} from "../src/protocol/ControlPackets";
import 'jest'

test('getFactoryResetPacket', () => {
  expect(ControlPacketsGenerator.getFactoryResetPacket()).toEqual(Buffer.from([239, 190, 173, 222]));
})

test('getSetSchedulePacket', () => {
  expect(ControlPacketsGenerator.getSetSchedulePacket([1,2,3])).toEqual(Buffer.from([15, 0, 3, 0, 1, 2, 3]))
})

test('getScheduleRemovePacket', () => {
  expect(ControlPacketsGenerator.getScheduleRemovePacket(2)).toEqual(Buffer.from([26, 0, 1, 0, 2]))
})

test('getCommandFactoryResetPacket', () => {
  expect(ControlPacketsGenerator.getCommandFactoryResetPacket()).toEqual(Buffer.from([5, 0, 4, 0, 239, 190, 173, 222]))
})

test('getSwitchStatePacket', () => {
  expect(ControlPacketsGenerator.getSwitchStatePacket(0.0) ).toEqual(Buffer.from([0, 0, 1, 0, 0]))
  expect(ControlPacketsGenerator.getSwitchStatePacket(1)   ).toEqual(Buffer.from([0, 0, 1, 0, 100]))
  expect(ControlPacketsGenerator.getSwitchStatePacket(0.99)).toEqual(Buffer.from([0, 0, 1, 0, 99]))
  expect(ControlPacketsGenerator.getSwitchStatePacket(0.4) ).toEqual(Buffer.from([0, 0, 1, 0, 40]))
})

test('getResetPacket', () => {
  expect(ControlPacketsGenerator.getResetPacket()).toEqual(Buffer.from([4, 0, 0, 0]))
})

test('getPutInDFUPacket', () => {
  expect(ControlPacketsGenerator.getPutInDFUPacket()).toEqual(Buffer.from([3, 0, 0, 0]))
})

test('getDisconnectPacket', () => {
  expect(ControlPacketsGenerator.getDisconnectPacket()).toEqual(Buffer.from([19, 0, 0, 0]))
})

test('getRelaySwitchPacket', () => {
  expect(ControlPacketsGenerator.getRelaySwitchPacket(0)).toEqual(Buffer.from([16, 0, 1, 0, 0]))
  expect(ControlPacketsGenerator.getRelaySwitchPacket(1)).toEqual(Buffer.from([16, 0, 1, 0, 1]))
})

test('getPwmSwitchPacket', () => {
  expect(ControlPacketsGenerator.getPwmSwitchPacket(0)).toEqual(Buffer.from(   [1, 0, 1, 0, 0]))
  expect(ControlPacketsGenerator.getPwmSwitchPacket(0.33)).toEqual(Buffer.from([1, 0, 1, 0, 33]))
  expect(ControlPacketsGenerator.getPwmSwitchPacket(0.66)).toEqual(Buffer.from([1, 0, 1, 0, 66]))
  expect(ControlPacketsGenerator.getPwmSwitchPacket(1)).toEqual(Buffer.from(   [1, 0, 1, 0, 100]))
})

test('getKeepAliveStatePacket', () => {
  expect(ControlPacketsGenerator.getKeepAliveStatePacket(false, 1, 135)).toEqual(Buffer.from([6, 0, 4, 0, 0, 100, 135, 0]))
  expect(ControlPacketsGenerator.getKeepAliveStatePacket(true,  1, 0)).toEqual(Buffer.from(  [6, 0, 4, 0, 1, 100, 0,   0]))
  expect(ControlPacketsGenerator.getKeepAliveStatePacket(true,  0, 500)).toEqual(Buffer.from([6, 0, 4, 0, 1, 0,   244, 1]))
})

test('getKeepAliveRepeatPacket', () => {
  expect(ControlPacketsGenerator.getKeepAliveRepeatPacket()).toEqual(Buffer.from([7,0,0,0]))
})

test('getResetErrorPacket', () => {
  expect(ControlPacketsGenerator.getResetErrorPacket(0xabcdef02)).toEqual(Buffer.from([23, 0, 4, 0, 2, 239, 205, 171]))
})

test('getSetTimePacket', () => {
  expect(ControlPacketsGenerator.getSetTimePacket(1516616561)).toEqual(Buffer.from([2, 0, 4, 0, 113, 187, 101, 90]))
})

test('getAllowDimmingPacket', () => {
  expect(ControlPacketsGenerator.getAllowDimmingPacket(true)).toEqual(Buffer.from(  [29, 0, 1, 0, 1]))
  expect(ControlPacketsGenerator.getAllowDimmingPacket(false)).toEqual(Buffer.from([29, 0, 1, 0, 0]))
})

test('getLockSwitchPacket', () => {
  expect(ControlPacketsGenerator.getLockSwitchPacket(true)).toEqual(Buffer.from(  [30, 0, 1, 0, 1]))
  expect(ControlPacketsGenerator.getLockSwitchPacket(false)).toEqual(Buffer.from([30, 0, 1, 0, 0]))
})