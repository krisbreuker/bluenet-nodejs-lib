import {StoneTracker} from "./StoneTracker";
import {Topics} from "../topics/Topics";
import {eventBus} from "../util/EventBus";
import {Advertisement} from "../packets/Advertisement";
import {BluenetSettings} from "./BluenetSettings";
import {TrackerMap} from "../types/declarations";

var noble = require('noble');

export class Validator {

  trackedStones : TrackerMap = {};
  settings : BluenetSettings;

  constructor(settings : BluenetSettings) {
    this.settings = settings;
    noble.on('scanStart', ()        => { console.log("scanStart");        });
    noble.on('scanStop',  ()        => { console.log("scanStop");         });
    noble.on('discover',  (advertisement)   => { this.discover(advertisement);    });
    noble.on('warning',   (warning)         => { console.log("warning", warning); });
  }

  discover(rawAdvertisement) {
    let advertisement = new Advertisement(rawAdvertisement)

    // decrypt the advertisement
    if (this.settings.encryptionEnabled) {
      advertisement.decrypt(this.settings.guestKey);
    }
    else {
      advertisement.setReadyForUse();
    }
    // parse the service data
    advertisement.process();


    if (this.trackedStones[advertisement.id] === undefined) {
      this.trackedStones[advertisement.id] = new StoneTracker();
    }

    this.trackedStones[advertisement.id].update(advertisement);

    if (this.trackedStones[advertisement.id].verified) {
      console.log("HERE", advertisement)
      eventBus.emit(Topics.advertisement, advertisement.getJSON())
    }
  }
}