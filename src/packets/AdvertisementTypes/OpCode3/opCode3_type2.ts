import {ServiceData} from "../../ServiceData";
import {Util} from "../../../util/Util";
import {parseOpCode3_type0} from "./opCode3_type0";

export function parseOpCode3_type2(serviceData : ServiceData, data : Buffer) {
  if (data.length == 17) {
    parseOpCode3_type0(serviceData, data)

    // apply differences between type 0 and type 2
    serviceData.stateOfExternalCrownstone = true
  }
}