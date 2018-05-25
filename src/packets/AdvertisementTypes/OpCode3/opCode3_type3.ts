import {ServiceData} from "../../ServiceData";
import {parseOpCode3_type1} from "./opCode3_type1";

export function parseOpCode3_type3(serviceData : ServiceData, data : Buffer) {
  if (data.length == 17) {
    parseOpCode3_type1(serviceData, data)

    // apply differences between type 1 and type 4
    serviceData.stateOfExternalCrownstone = true
    serviceData.powerUsageReal = 0
    serviceData.validation = data.readUInt8(16)
  }
}