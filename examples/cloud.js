let BluenetLib = require("../dist/index");
let fs = require("fs");


// You can use the template JSON to make your own userData.json
// mandatory fields: sphereId
// possible combinations:
// email and password
// email and sha1Password
// token
// token and userId // this saves a call to the cloud.
let userData = JSON.parse(fs.readFileSync("userData.json"));


let bluenet = new BluenetLib.Bluenet()
bluenet.linkCloud(userData)
  .then(() => {
    console.log("Success") ;
    console.log(bluenet.settings)
  })
  .catch((err) => { console.log("COULDNT LINK CLOUD", err) })

