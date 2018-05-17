export const CROWNSTONE_PLUG_ADVERTISEMENT_SERVICE_UUID        = "C001"
export const CROWNSTONE_BUILTIN_ADVERTISEMENT_SERVICE_UUID     = "C002"
export const CROWNSTONE_GUIDESTONE_ADVERTISEMENT_SERVICE_UUID  = "C003"
export const DFU_ADVERTISEMENT_SERVICE_UUID                    = "00001530-1212-EFDE-1523-785FEABCD123"

export const CSServices = {
  DeviceInformation         : "180a",
  CrownstoneService         : "24f00000-7d10-4805-bfc1-7663a01c3bff",
  SetupService              : "24f10000-7d10-4805-bfc1-7663a01c3bff",
  GeneralService            : "24f20000-7d10-4805-bfc1-7663a01c3bff",
  PowerService              : "24f30000-7d10-4805-bfc1-7663a01c3bff",
  IndoorLocalizationService : "24f40000-7d10-4805-bfc1-7663a01c3bff",
  ScheduleService           : "24f50000-7d10-4805-bfc1-7663a01c3bff",
  MeshService               : "0000fee4-0000-1000-8000-00805f9b34fb",
}

export const DFUServices = {
  DFU : DFU_ADVERTISEMENT_SERVICE_UUID
}

export const ServiceUUIDArray = [
  CROWNSTONE_PLUG_ADVERTISEMENT_SERVICE_UUID,
  CROWNSTONE_BUILTIN_ADVERTISEMENT_SERVICE_UUID,
  CROWNSTONE_GUIDESTONE_ADVERTISEMENT_SERVICE_UUID,
]