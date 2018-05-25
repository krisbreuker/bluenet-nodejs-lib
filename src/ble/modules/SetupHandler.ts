import {BleHandler} from "../BleHandler";
import {CrownstoneCharacteristics, SetupCharacteristics} from "../../protocol/Characteristics";
import {CSServices} from "../../protocol/Services";
import {EncryptionHandler} from "../../util/EncryptionHandler";
import {ControlPacketsGenerator} from "../../protocol/ControlPackets";
import {BluenetError, BluenetErrorType} from "../../BluenetError";


export class SetupHandler {
  ble : BleHandler;

  constructor(ble) {
    this.ble = ble;
  }


  setup(crownstoneId, meshAccessAddress, ibeaconUUID, ibeaconMajor, ibeaconMinor) {
    return new Promise((resolve, reject) => {
      if (this.ble.connectedPeripheral.characteristics[CSServices.SetupService][SetupCharacteristics.SetupControl]) {

      }
      else {
        reject(new BluenetError(BluenetErrorType.INCOMPATIBLE_FIRMWARE, "This Crownstone has an old firmware and is not compatible with this lib."))
      }
    })
  }

  handleSetupPhaseEncryption() : Promise<void> {
    return new Promise((resolve, reject) => {
        this.ble.settings.disableEncryptionTemporarily()
        this.getSessionKey()
          .then((key) => {
            this.ble.settings.loadSetupKey(key)
            return this.getSessionNonce()
          })
          .then((nonce) => {
            this.ble.settings.setSessionNonce(nonce)
            this.ble.settings.restoreEncryption()
            resolve()
          })
          .catch((err: Error) => {
            this.ble.settings.restoreEncryption()
            reject(err)
          })
      })
  }


  getSessionKey() : Promise<Buffer> {
    return this.ble.readCharacteristicWithoutEncryption(CSServices.SetupService, SetupCharacteristics.SessionKey)
  }

  getSessionNonce() : Promise<Buffer> {
    return this.ble.readCharacteristicWithoutEncryption(CSServices.SetupService, SetupCharacteristics.SessionNonce)
  }

}