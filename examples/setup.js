let BluenetLib = require("../dist/index");

let bluenet = new BluenetLib.Bluenet()

bluenet.setSettings({adminKey:'adminKeyForCrown', memberKey:'memberKeyForHome', guestKey:'guestKeyForOther'})

bluenet.getNearestSetupStone(rssiAtLeast = -80, returnFirstAcceptable = true)
  .then((peripheral) => {
    bluenet.setupCrownstone(peripheral.handle, 1, '4f745905', '1843423e-e175-4af0-a2e4-31e32f729a8a', 123, 456)
  })
  .catch((err) => { console.log("couldntSETUP", err) })
