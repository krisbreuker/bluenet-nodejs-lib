import {ServiceData} from "./ServiceData";
import {DeviceType} from "../protocol/BluenetTypes";
import {parseOpCode3_type0} from "./AdvertisementTypes/OpCode3/opCode3_type0";
import {parseOpCode3_type1} from "./AdvertisementTypes/OpCode3/opCode3_type1";
import {parseOpCode3_type2} from "./AdvertisementTypes/OpCode3/opCode3_type2";
import {parseOpCode3_type3} from "./AdvertisementTypes/OpCode3/opCode3_type3";
import {parseOpCode4_type0} from "./AdvertisementTypes/OpCode4/opCode4_type0";



export function parseOpCode3( serviceData : ServiceData, data : Buffer ) {
  if (data.length !== 17) { return; }

  serviceData.dataType = data.readUInt8(1);

  switch(serviceData.dataType) {
    case 0:
      parseOpCode3_type0(serviceData, data);
      break;
    case 1:
      parseOpCode3_type1(serviceData, data);
      break;
    case 2:
      parseOpCode3_type2(serviceData, data);
      break;
    case 3:
      parseOpCode3_type3(serviceData, data);
      break;
    default:
      parseOpCode3_type0(serviceData, data)
  }
}


export function parseOpCode4( serviceData : ServiceData, data : Buffer ) {
  if (data.length !== 17) { return; }

  serviceData.setupMode = true;

  serviceData.dataType = data.readUInt8(1);

  switch(serviceData.dataType) {
    case 0:
      parseOpCode4_type0(serviceData, data);
      break;
    default:
      parseOpCode4_type0(serviceData, data)

  }
}


export function parseOpCode5( serviceData : ServiceData, data : Buffer ) {
  if (data.length !== 18) { return; }

  let deviceType = data.readUInt8(1);
  serviceData.deviceType = DeviceType.getLabel(deviceType);

  serviceData.dataType = data.readUInt8(2);

  let slice = data.slice(1);

  switch(serviceData.dataType) {
    case 0:
      parseOpCode3_type0(serviceData, slice);
      break;
    case 1:
      parseOpCode3_type1(serviceData, slice);
      break;
    case 2:
      parseOpCode3_type2(serviceData, slice);
      serviceData.rssiOfExternalCrownstone = slice.readUInt8(15);
      break;
    case 3:
      parseOpCode3_type3(serviceData, data);
      serviceData.rssiOfExternalCrownstone = slice.readUInt8(15);
      break;
    default:
      parseOpCode3_type0(serviceData, slice)
  }
}


export function parseOpCode6( serviceData : ServiceData, data : Buffer ) {
  if (data.length !== 18) { return; }

  let deviceType = data.readUInt8(1);
  serviceData.deviceType = DeviceType.getLabel(deviceType);
  serviceData.setupMode = true;

  serviceData.dataType = data.readUInt8(2);

  let slice = data.slice(1);

  switch(serviceData.dataType) {
    case 0:
      parseOpCode4_type0(serviceData, slice);
      break;
    default:
      parseOpCode4_type0(serviceData, slice)

  }
}