
let BluenetLib = require("../dist/index")

let bluenet = new BluenetLib.Bluenet()

bluenet.setSettings({adminKey:'adminKeyForCrown', memberKey:'memberKeyForHome', guestKey:'guestKeyForOther'})
bluenet.startScanning().catch((err) => { console.log("Error while running example:", err); })

// print scans.
bluenet.on(BluenetLib.Topics.advertisement,         (data) => { console.log("Got advertisement"); })
bluenet.on(BluenetLib.Topics.verifiedAdvertisement, (data) => { console.log(data); })
