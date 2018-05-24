

export const ControlType = {
  SWITCH                 : 0,
  PWM                    : 1,
  SET_TIME               : 2,
  GOTO_DFU               : 3,
  RESET                  : 4,
  FACTORY_RESET          : 5,
  KEEP_ALIVE_STATE       : 6,
  KEEP_ALIVE_REPEAT      : 7,
  ENABLE_MESH            : 8,
  ENABLE_ENCRYPTION      : 9,
  ENABLE_IBEACON         : 10,
  ENABLE_CONTINUOUS_POWER_MANAGEMENT : 11,
  ENABLE_SCANNER         : 12,
  SCAN_FOR_DEVICES       : 13,
  USER_FEEDBACK          : 14,
  SCHEDULE_ENTRY         : 15,
  RELAY                  : 16,
  VALIDATE_SETUP         : 17,
  REQUEST_SERVICE_DATA   : 18,
  DISCONNECT             : 19,
  SET_LED                : 20,
  NO_OPERATION           : 21,
  INCREASE_TX            : 22,
  RESET_ERRORS           : 23,
  MESH_KEEP_ALIVE_REPEAT : 24,
  MESH_MULTI_SWITCH      : 25,
  SCHEDULE_REMOVE        : 26,
  MESH_KEEP_ALIVE_STATE  : 27,
  MESH_COMMAND           : 28,
  ALLOW_DIMMING          : 29,
  LOCK_SWITCH            : 30,
}

export const ConfigurationType = {
  DEVICE_NAME            : 0,
  DEVICE_TYPE            : 1,
  ROOM                   : 2,
  FLOOR                  : 3,
  NEARBY_TIMEOUT         : 4,
  PWM_PERIOD             : 5,
  IBEACON_MAJOR          : 6,
  IBEACON_MINOR          : 7,
  IBEACON_UUID           : 8,
  IBEACON_TX_POWER       : 9,
  WIFI_SETTINGS          : 10,
  TX_POWER               : 11,
  ADVERTISEMENT_INTERVAL : 12,
  PASSKEY                : 13,
  MIN_ENV_TEMP           : 14,
  MAX_ENV_TEMP           : 15,
  SCAN_DURATION          : 16,
  SCAN_SEND_DELAY        : 17,
  SCAN_BREAK_DURATION    : 18,
  BOOT_DELAY             : 19,
  MAX_CHIP_TEMP          : 20,
  SCAN_FILTER            : 21,
  SCAN_FILTER_FRACTION   : 22,
  CURRENT_LIMIT          : 23,
  MESH_ENABLED           : 24,
  ENCRYPTION_ENABLED     : 25,
  IBEACON_ENABLED        : 26,
  SCANNER_ENABLED        : 27,
  CONTINUOUS_POWER_MEASUREMENT_ENABLED   : 28,
  TRACKER_ENABLED        : 29,
  ADC_SAMPLE_RATE        : 30,
  POWER_SAMPLE_BURST_INTERVAL            : 31,
  POWER_SAMPLE_CONTINUOUS_INTERVAL       : 32,
  POWER_SAMPLE_CONTINUOUS_NUMBER_SAMPLES : 33,
  CROWNSTONE_IDENTIFIER  : 34,
  ADMIN_ENCRYPTION_KEY   : 35,
  MEMBER_ENCRYPTION_KEY  : 36,
  GUEST_ENCRYPTION_KEY   : 37,
  DEFAULT_ON             : 38,
  SCAN_INTERVAL          : 39,
  SCAN_WINDOW            : 40,
  RELAY_HIGH_DURATION    : 41,
  LOW_TX_POWER           : 42,
  VOLTAGE_MULTIPLIER     : 43,
  CURRENT_MULITPLIER     : 44,
  VOLTAGE_ZERO           : 45,
  CURRENT_ZERO           : 46,
  POWER_ZERO             : 47,
  POWER_AVERAGE_WINDOW   : 48,
  MESH_ACCESS_ADDRESS    : 49,
}


export const MeshHandle = {
  HUB : 1,
  DATA : 2,
}


export const StateType = {
  RESET_COUNTER: 128,
  SWITCH_STATE: 129,
  ACCUMULATED_ENERGY: 130,
  POWER_USAGE: 131,
  TRACKED_DEVICES: 132,
  SCHEDULE: 133,
  OPERATION_MODE: 134,
  TEMPERATURE: 135,
  TIME: 136,
  ERROR_BITMASK: 139,
}


export const OpCode = {
  READ   : 0,
  WRITE  : 1,
  NOTIFY : 2,
}


//  *********** Mesh ***********

export const MeshCommandType = {
  CONTROL: 0,
  BEACON : 1,
  CONFIG : 2,
  STATE  : 3,
}


export const IntentType = {
  REGION_ENTER: 0,
  REGION_EXIT: 1,
  ENTER: 2,
  EXIT: 3,
  MANUAL: 4,
}


export const MeshKeepAliveTypes = {
  SHARED_TIMEOUT: 1,
}


export const MeshMultiSwitchType = {
  SIMPLE_LIST: 0,
}

//****************** DEVICE TYPES IN ADVERTISEMENTS *************//

export const DeviceType = {
  undefined  : 0,
  plug       : 1,
  guidestone : 2,
  builtin    : 3,
  crownstoneUSB : 4,

  getLabel: function(value) {
    let keys = Object.keys(DeviceType);
    for (let i = 0; i < keys.length; i++) {
      if (DeviceType[keys[i]] === value) {
        return keys[i];
      }
    }
    return 'undefined';
  },
}


//****************** RESULT VALUES *************//

export const ResultValue = {
  SUCCESS              : 0,     // Completed successfully.
  WAIT_FOR_SUCCESS     : 1,     // Command is successful so far, but you need to wait for SUCCESS.
  BUFFER_UNASSIGNED    : 16,    // No buffer was assigned for the command.
  BUFFER_LOCKED        : 17,    // Buffer is locked, failed queue command.
  WRONG_PAYLOAD_LENGTH : 32,    // Wrong payload lenght provided.
  WRONG_PARAMETER      : 33,    // Wrong parameter provided.
  INVALID_MESSAGE      : 34,    // invalid message provided.
  UNKNOWN_OP_CODE      : 35,    // Unknown operation code provided.
  UNKNOWN_TYPE         : 36,    // Unknown type provided.
  NOT_FOUND            : 37,    // The thing you were looking for was not found.
  NO_ACCESS            : 48,    // Invalid access for this command.
  NOT_AVAILABLE        : 64,    // Command currently not available.
  NOT_IMPLEMENTED      : 65,    // Command not implemented (not yet or not anymore).
  WRITE_DISABLED       : 80,    // Write is disabled for given type.
  ERR_WRITE_NOT_ALLOWED: 81,    // Direct write is not allowed for this type, use command instead.
  ADC_INVALID_CHANNEL  : 96,    // Invalid adc input channel selected.
}

//****************** PROCESS TYPES *************//

export const ProcessType = {
  CONTINUE    : 0,
  FINISHED    : 1,
  ABORT_ERROR : 2,
}
