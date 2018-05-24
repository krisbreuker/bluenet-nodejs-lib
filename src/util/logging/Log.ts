import { LogConfig }  from  "../../Config"
import { LOG_LEVEL }  from  "./LogLevels";


export class Logger {
  level : number;
  levelPrefix : string;

  constructor(level) {
    this.level = level;
    this.levelPrefix = this._getPrefix(level);
  }

  log(...any) {
    this._log('Info -----', LogConfig.log, arguments);
  }

  ble(...any) {
    this._log('BLE ------', LogConfig.ble, arguments);
  }

  usb(...any) {
    this._log('USB ------', LogConfig.usb, arguments);
  }

  event(...any) {
    this._log('Event ----', LogConfig.events, arguments);
  }

  cloud(...any) {
    this._log('Cloud ----', LogConfig.cloud, arguments);
  }

  system(...any) {
    this._log('System ---', LogConfig.system, arguments);
  }

  error(...any) {
    this._logType('ERROR ----', LogConfig.log, LOG_LEVEL.error,  arguments);
  }

  warn(...any) {
    this._logType('WARNING --', LogConfig.log, LOG_LEVEL.warning,  arguments);
  }

  info(...any) {
    this._logType('Info -----', LogConfig.log, LOG_LEVEL.info,  arguments);
  }

  debug(...any) {
    this._logType('Debug ----', LogConfig.log, LOG_LEVEL.debug,  arguments);
  }

  verbose(...any) {
    this._logType('Verbose --', LogConfig.log, LOG_LEVEL.debug,  arguments);
  }


  _getPrefix(level) {
    switch(level) {
      case LOG_LEVEL.verbose:
        return 'v';
      case LOG_LEVEL.debug:
        return 'd';
      case LOG_LEVEL.info:
        return 'i';
      case LOG_LEVEL.warning:
        return 'w';
      case LOG_LEVEL.error:
        return 'e';
      default:
        return 'v';
    }
  }


  _log(type, configCheckField, allArguments) {
    if (configCheckField <= this.level) {
      let args = ['LOG' + this.levelPrefix + ' ' + type + ' :'];
      for (let i = 0; i < allArguments.length; i++) {
        let arg = allArguments[i];
        args.push(arg);
      }
      console.log.apply(this, args);
    }
  }

  _logType(type, configCheckField, forcedLevel, allArguments) {
    if (configCheckField <= forcedLevel) {
      let args = ['LOG' + this._getPrefix(forcedLevel) + ' ' + type + ' :'];
      for (let i = 0; i < allArguments.length; i++) {
        let arg = allArguments[i];
        args.push(arg);
      }
      console.log.apply(this, args);
    }
  }
}


export const LOGv   = new Logger(LOG_LEVEL.verbose);
export const LOGd   = new Logger(LOG_LEVEL.debug  );
export const LOGi   = new Logger(LOG_LEVEL.info   );
export const LOG    = new Logger(LOG_LEVEL.info   );
export const LOGw   = new Logger(LOG_LEVEL.warning);
export const LOGe   = new Logger(LOG_LEVEL.error  );

