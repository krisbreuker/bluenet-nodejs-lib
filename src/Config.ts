import {LOG_LEVEL} from "./util/logging/LogLevels";


export let LogConfig = {
  ble     : LOG_LEVEL.info,
  usb     : LOG_LEVEL.info,
  events  : LOG_LEVEL.ERROR,
  cloud   : LOG_LEVEL.warning,
  system  : LOG_LEVEL.info,
  log     : LOG_LEVEL.info,  // basic default log for general logging
}


