let BluenetLib = require("../dist/index");

let bluenet = new BluenetLib.Bluenet()

bluenet.setSettings({adminKey:'adminKeyForCrown', memberKey:'memberKeyForHome', guestKey:'guestKeyForOther'})

bluenet.getNearestValidatedCrownstone(-80, 10, true)
  .then((peripheral) => {
    console.log("Example: Connecting...")
    return bluenet.connect(peripheral)
      .then(() => {
        console.log("Example: Commanding factory reset...")
        return bluenet.control.commandFactoryReset()
      })
      .then(() => {
        console.log("Example: Disconnecting...")
        return bluenet.disconnect()
      })
      .then(() => {
        console.log("Done.")
      })
  })
  .catch((err) => { console.log("commandFactoryReset", err) })

