import {StoneTracker} from "../ble/StoneTracker";
import {Advertisement} from "../packets/Advertisement";

type PromiseCallback = (any) => Promise<any>

interface TrackerMap {
  [key: string]: StoneTracker
}

interface Cache {
  [key: string]: {advertisement: Advertisement, peripheral: any}
}

interface requestOptions {
  data?: any,
  background?: boolean,
  noAccessToken?: boolean,

}

type requestType = 'query' | 'body';