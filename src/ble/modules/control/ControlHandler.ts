import {BleHandler} from "../../BleHandler";
import {CrownstoneCharacteristics} from "../../../protocol/Characteristics";
import {CSServices} from "../../../protocol/Services";
import {EncryptionHandler} from "../../../util/EncryptionHandler";
import {ControlPacketsGenerator} from "../../../protocol/ControlPackets";


export class ControlHandler {
  ble : BleHandler;


  constructor(ble) {
    this.ble = ble;
  }

  getAndSetSessionNonce() {
    return this.ble.readCharacteristicWithoutEncryption(CSServices.CrownstoneService, CrownstoneCharacteristics.SessionNonce)
      .then((rawNonce : Buffer) => {
        console.log("Got Nonce!")
        let decryptedNonce = EncryptionHandler.decryptSessionNonce(rawNonce, this.ble.settings.guestKey);

        console.log("Decrypted Nonce", decryptedNonce)
        this.ble.settings.setSessionNonce(decryptedNonce);
        console.log("Set Nonce")
      })
  }


  setSwitchState(state: number) {
    let switchState = state*100;
    let packet = ControlPacketsGenerator.getSwitchStatePacket(switchState)
    return this._writeControlPacket(packet)
  }

  disconnect() {
    let packet = ControlPacketsGenerator.getDisconnectPacket()
    return this._writeControlPacket(packet)
  }


  _writeControlPacket(packet: Buffer) : Promise<void> {
    return this.ble.writeToCharacteristic(CSServices.CrownstoneService, CrownstoneCharacteristics.Control, packet)
  }

}