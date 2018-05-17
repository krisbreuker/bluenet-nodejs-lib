import {StoneTracker} from "../ble/StoneTracker";

type PromiseCallback = (any) => Promise<any>

interface TrackerMap {
  [key: string]: StoneTracker
}