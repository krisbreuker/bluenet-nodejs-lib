
let BluenetLib = require("../dist/index")

let bluenet = new BluenetLib.Bluenet()

bluenet.setSettings({adminKey:'adminKeyForCrown', memberKey:'memberKeyForHome', guestKey:'guestKeyForOther'})
bluenet.isReady()
  .then(() => { bluenet.startScanning(); })
  .catch((err) => { console.log("Error while running example:", err); })