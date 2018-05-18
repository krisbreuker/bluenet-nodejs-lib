
let BluenetLib = require("../dist/index")

let bluenet = new BluenetLib.Bluenet()

bluenet.setSettings({adminKey:'adminKeyForCrown', memberKey:'memberKeyForHome', guestKey:'guestKeyForOther'})