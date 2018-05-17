import {ServiceUUIDArray} from "../protocol/Services";
import {ServiceData} from "./ServiceData";


export class Advertisement {
  id = null;
  name = null;
  handle = null;
  rssi = null;

  serviceDataAvailable = false;
  scanResponse : ServiceData = null;


  constructor(rawAdvertisement) {
    this.parse(rawAdvertisement);
  }

  parse(rawAdvertisement) {
    this.id = rawAdvertisement.id;
    this.handle = rawAdvertisement.uuid;
    this.name = rawAdvertisement.name;
    this.rssi = rawAdvertisement.rssi;

    let serviceDataArray = rawAdvertisement.advertisement.serviceData;
    for (let i = 0; serviceDataArray.length; i++) {
      if (!serviceDataArray[i]) { continue; }
      let uuid = serviceDataArray[i].uuid.toUpperCase();

      if (ServiceUUIDArray.indexOf(uuid) !== -1) {
        this.serviceDataAvailable = true;
        this.scanResponse = new ServiceData(serviceDataArray[i].data);
        break;
      }
    }
  }

  isSetupPackage() {
    console.log("isInDFUMode not implemented yet.")
    return false
  }

  isInDFUMode() {
    console.log("isInDFUMode not implemented yet.")
    return false
  }

  isCrownstoneFamily() {
    if (this.scanResponse) {
      return this.scanResponse.hasCrownstoneDataFormat()
    }
    return false;
  }

  decrypt(key) {
    if (this.scanResponse) {
      this.scanResponse.decrypt(key);
    }
  }

  process() {
    if (this.scanResponse) {
      this.scanResponse.parse();
    }
  }

  hasScanResponse() {
    return (this.serviceDataAvailable && this.scanResponse != null)
  }

  setReadyForUse() {
    if (this.scanResponse) {
      this.scanResponse.dataReadyForUse = true;
    }
  }

  getJSON() {
    return {};
  }
}

