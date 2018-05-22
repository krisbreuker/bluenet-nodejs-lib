let BluenetLib = require("../dist/index");

let bluenet = new BluenetLib.Bluenet();

bluenet.setSettings({adminKey:'adminKeyForCrown', memberKey:'memberKeyForHome', guestKey:'guestKeyForOther'});

let handle = "d8dc6dda7bf943c19dd9418137a91756"; // this is an UUID in OSX, mac address in Linux. Change this in the example when you run it.
bluenet.connect(handle);