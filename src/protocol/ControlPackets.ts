import { ControlPacket, FactoryResetPacket, keepAliveStatePacket } from './BlePackets'
import {ControlType} from './BluenetTypes';
import {Util} from "../util/Util";

export class ControlPacketsGenerator {

  static getFactoryResetPacket() {
    let buffer = Buffer.alloc(4);
    buffer.writeUInt32LE(0xdeadbeef,0);
    return buffer
  }

  static getSetSchedulePacket(data) {
    return new ControlPacket(ControlType.SCHEDULE_ENTRY).loadByteArray(data).getPacket()
  }


  static getScheduleRemovePacket(timerIndex) {
    return new ControlPacket(ControlType.SCHEDULE_REMOVE).loadUInt8(timerIndex).getPacket()
  }

  static getCommandFactoryResetPacket() {
    return new FactoryResetPacket().getPacket()
  }

  static getSwitchStatePacket(switchState) {
    let convertedSwitchState = Util.bound0_100(switchState)
    return new ControlPacket(ControlType.SWITCH).loadUInt8(convertedSwitchState).getPacket()
  }

  static getResetPacket() {
    return new ControlPacket(ControlType.RESET).getPacket()
  }

  static getPutInDFUPacket() {
    return new ControlPacket(ControlType.GOTO_DFU).getPacket()
  }

  static getDisconnectPacket() {
    return new ControlPacket(ControlType.DISCONNECT).getPacket()
  }

  /**
   * @param state : 0 or 1
   * @returns {Buffer}
   */
  static getRelaySwitchPacket(state) {
    return new ControlPacket(ControlType.RELAY).loadUInt8(state).getPacket()
  }

  /**
   * @param switchState   [0 .. 1]
   * @returns {Buffer}
   */
  static getPwmSwitchPacket(switchState) {
    let convertedSwitchState = Util.bound0_100(switchState)

    return new ControlPacket(ControlType.PWM).loadUInt8(convertedSwitchState).getPacket()
  }

  static getKeepAliveStatePacket(changeState, switchState, timeout) {
    let convertedSwitchState = Util.bound0_100(switchState)

    let actionState = 0
    if (changeState) {
      actionState = 1
    }

    return new keepAliveStatePacket(actionState, convertedSwitchState, timeout).getPacket()
  }

  static getKeepAliveRepeatPacket() {
    return new ControlPacket(ControlType.KEEP_ALIVE_REPEAT).getPacket()
  }

  static getResetErrorPacket(errorMask) {
    return new ControlPacket(ControlType.RESET_ERRORS).loadUInt32(errorMask).getPacket()
  }

  /**
   * This is a LOCAL timestamp since epoch in seconds

   so if you live in GMT + 1 add 3600 to the timestamp

   * @param time
   * @returns {Buffer}
   */
  static getSetTimePacket(time) {
    return new ControlPacket(ControlType.SET_TIME).loadUInt32(time).getPacket()
  }

  static getAllowDimmingPacket(allow) {
    let allowByte = 0
    if (allow) {
      allowByte = 1
    }

    return new ControlPacket(ControlType.ALLOW_DIMMING).loadUInt8(allowByte).getPacket()
  }

  static getLockSwitchPacket(lock) {
    let lockByte = 0
    if (lock) {
      lockByte = 1
    }
    return new ControlPacket(ControlType.LOCK_SWITCH).loadUInt8(lockByte).getPacket()
  }
}
