let BluenetLib = require("../dist/index");
var fs = require("fs");

var userData = JSON.parse(fs.readFileSync("userData.json"));

let bluenet = new BluenetLib.Bluenet()
bluenet.linkCloud(userData)
  .then(() => {
    console.log("Success") ;
    console.log(bluenet.settings)
  })
  .catch((err) => { console.log("COULDNT LINK CLOUD", err) })

