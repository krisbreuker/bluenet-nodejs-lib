# bluenet-nodejs-lib
Official lib for NodeJS to communicate with Crownstones via BLE.

## Installation

Dependency installation is handled through Yarn. Eventually, we will release this library on npm but for now it's only available through git.

run

```
yarn
```

to install the dependencies.

The BLE part is handled by Noble. Any platform specific installation steps can be read here: [https://github.com/noble/noble].

## Usage

You can run the examples in the ./examples folder using:

```
sudo node scanning.js
```

sudo rights are required on ubuntu so that the BlueZ backend is allowed to scan.

## Developing

If you want to develop with this library, we recommend using the typescript files under source. 

To start the typescript compiler run:

```
npm start
```

To run the unit tests run:

```
npm test
```


## API

You import the library using require.

```js
// import library
let BluenetLib = require("../dist/index")

// create a Bluenet instance
let bluenet = new BluenetLib.Bluenet()

// the Event topics
let topics = BluenetLib.Topics;


// util functions to use.
let util = BluenetLib.util;
```

Bluenet has a number of methods available:

***`setSettings(keys, referenceId="BluenetNodeJSLib", encryptionEnabled=true)`***
> @param **keys** *: JSON {adminKey: string, memberKey: string, guestKey: string}*  
> @param **referenceId** *: string*  
> @param **encryptionEnabled** *: Bool*  
> @returns void  
>
> **All keys are 16 length strings or 32 length hex strings.**  
> Used to set the encryption keys used for communication with Crownstones. 
Alternatively you could use `linkCloud` to download your keys from the Crownstone Cloud.  

***`linkCloud(userData)`***
> @param **userData** *: userData JSON*  
> @returns Promise< void >
>
> The userData JSON looks like this:
>```js
>{
>  "email":"x@gmail.com",
>  "password":"myPassword",
>  "sha1Password":"hashOfMyPassword",
>  "userId": "myCloudUserId",
>  "token": "myCloudAccessToken",
>  "sphereId": "myCloudSphereId"
>}
>```
> Not all fields are mandatory. 
> - mandatory fields: sphereId  
> - possible combinations of other fields:  
>   - email and password  
>   - email and sha1Password  
>   - token  
>   - token and userId (this saves a call to the cloud.)  


***`connect(connectData, scanDuration = 5)`***
> @param **connectData** *: Either a Noble Peripheral instance, an advertisement object from the bluenet events, a handle (string) or an address (string).*  
> @param **scanDuration** *: Maximum amount of time Bluenet will search for the Crownstone to connect to.*  
> @returns Promise< void >  
>
> If Bluenet is not scanning and has not scanned yet, it will start scanning to find the peripheral for connection. 


***`wait(seconds)`***
> @param **seconds** *: number of seconds to wait*  
> @returns Promise< void >  
>
> Convenience method to add waits to your process

***`setupCrownstone(handle, crownstoneId, meshAccessAddress, ibeaconUUID, ibeaconMajor, ibeaconMinor)`***
> @param **handle** *: Either a Noble Peripheral instance, an advertisement object from the bluenet events, a handle (string) or an address (string).*  
> @param **crownstoneId** *: number between 1 and 255.*  
> @param **meshAccessAddress** *: the access address of the mesh. You can generate this with `util.generateMeshAccessAddress()`.*  
> @param **ibeaconUUID** *: iBeacon UUID: cf73d455-6aca-43fc-aef6-937141c04bf7 *  
> @param **ibeaconMajor** *: number between 1 and 65535.*  
> @param **ibeaconMinor** *: number between 1 and 65535.*  
> @returns Promise< void >  
>
> When the Crownstone is new, it is in setup mode. This means it does not yet have any encryption keys, mesh address, id and iBeacon data. When you setup a Crownstone,
it belongs to you and cannot be setup by others until you factory reset it. See the Control Submodule for more information on this.

***`disconnect()`***
> @returns Promise< void >  
>
> Disconnect from the connected Crownstone.

***`cleanUp()`***
> Remove the Noble event listeners. This does not close your app.

***`quit()`***
> Quit your app. Only use this when you want to quit your script. It does a cleanUp() and process.exit(1);

***`startScanning()`***
> Start scanning for Crownstones.

***`stopScanning()`***
> Stop scanning for Crownstones.

***`on(topic, callback)`***
> @param **topic** *: one of the topics from BluenetLib.Topics (string). See below for more information.*  
> @param **callback** *: a callback which will be invoked for every emit of this event.*  
> @returns () => {} : unsubscribe callback
> Subscribe to events. Invoke the unsubscribe callback to remove your subscription.

***`getNearestCrownstone(rssiAtLeast=-100, scanDuration=5, returnFirstAcceptable=false, addressesToExclude=[])`***
> @param **rssiAtLeast** *: number; Filter by distance. -80 means -75 will be accepted, while -85 will not.*  
> @param **scanDuration** *: number (seconds); maximum amount of time this scan will take. Resolves with nearest when scan is completed.*  
> @param **returnFirstAcceptable** *: Boolean; immediately resolve this promise if one Crownstone matches the search parameters.*  
> @param **addressesToExclude** *: array of either handles or addresses to ignore for this search. Not all platforms can get addresses (OSX for example).*  
> @returns Promise< advertisement > : Resolves to the advertisement payload of the nearest Crownstone. This can be used in the connect method.
>
> This will return any Crownstone that fits the search parameters. This does not mean you can decrypt the data successfully so the payload of the advertisement may be random.

***`getNearestValidatedCrownstone(rssiAtLeast=-100, scanDuration=5,returnFirstAcceptable=false, addressesToExclude=[])`***
> Same as getNearestCrownstone except it will only use Crownstones that have your encryption keys.


***`getNearestSetupStone(rssiAtLeast=-100, scanDuration=5,returnFirstAcceptable=false, addressesToExclude=[])`***
> Same as getNearestCrownstone except it will only use Crownstones that are in setup mode.


### Control submodule

The control submodule is used to send commands to a Crownstone. Here is a usage example:

```js
// import lib
let BluenetLib = require("../dist/index");

// make instance of bluenet
let bluenet = new BluenetLib.Bluenet();

// load encryption keys into bluenet. Important! Without keys, you cant send commands to the Crownstone.
bluenet.setSettings({adminKey:'adminKeyForCrown', memberKey:'memberKeyForHome', guestKey:'guestKeyForOther'});

// this is an UUID in OSX, mac address in Linux. Change this in the example when you run it.
let handle = "e719476672b5"; 

// First we connect
bluenet.connect(handle)
  .then(() => {
    // here we are connected, now switch this Crownstone off.
    return bluenet.control.setSwitchState(0);
  })
  .then(() => {
    // Wait for a second (optional)
    return bluenet.wait(1);
  })
  .then(() => {
    // Switch it back on
    return bluenet.control.setSwitchState(1);
  })
  .then(() => {
    // Tell the Crownstone to disconnect from us.
    return bluenet.control.disconnect()
  })
  .then(() => {
    // close the script
    bluenet.quit();
  })
  .catch((err) => { console.log("Error in process...", err); })
```

Here are the methods in the Control Submodule:


***`setSwitchState(state: number)`***
> @param **state** *: number between 0 and 1. 0 for off, 1 for on, between 0 and 1 for dimming. Dimming must be enabled for this Crownstone in the Consumer App.*  
> @returns Promise< void >
>
> Switch the Crownstone on or off or have it dim your lights!


***`commandFactoryReset()`***
> @returns Promise< void >
>
> Put the Crownstone back into setup mode.

***`disconnect()`***
> @returns Promise< void >
>
> Tell the Crownstone to disconnect from you. This is different from using Bluenet.disconnect(), where the lib will disconnect from the Crownstone.
> Some adapters (or phones) are slow to disconnect. This speeds this process up a lot.

### Events

There are a few events you can subscribe to using the bluenet.on method. They are all contained in the Topics object:

```js
const Topics = {
  peripheralDiscovered: 'peripheralDiscovered',
  advertisement: 'advertisement',
  verifiedAdvertisement: 'verifiedAdvertisement',
}
```

***`Topics.peripheralDiscovered`***
> Repeatedly called for every scanned advertisement. data is a Noble Peripheral Object.

***`Topics.advertisement`***
> Repeatedly called for every scanned advertisement, regardless if Bluenet can decrypt the content.
> data is an object containing the advertisement:
> ```js
> {
>     handle:             string,
>     address:            string,
>     name:               string,
>     rssi:               number,
>     isCrownstoneFamily: boolean,
>     isInDFUMode:        boolean,
>     referenceId:        string,
>     serviceUUID:        string,
>     serviceData: {
>       opCode                    : number,
>       dataType                  : number,
>       stateOfExternalCrownstone : boolean,
>       hasError                  : boolean,
>       setupMode                 : boolean,
> 
>       crownstoneId              : number,
>       switchState               : number,
>       flagsBitmask              : number,
>       temperature               : number,
>       powerFactor               : number,
>       powerUsageReal            : number,
>       powerUsageApparent        : number,
>       accumulatedEnergy         : number,
>       timestamp                 : number,
>       
>       dimmingAvailable          : boolean,
>       dimmingAllowed            : boolean,
>       switchLocked              : boolean,
>       switchCraftEnabled        : boolean,
>       
>       errorMode                 : boolean, // only relevant if errorMode is true
>       errors                    : {
>                                     overCurrent       : boolean,
>                                     overCurrentDimmer : boolean,
>                                     temperatureChip   : boolean,
>                                     temperatureDimmer : boolean,
>                                     dimmerOnFailure   : boolean,
>                                     dimmerOffFailure  : boolean,
>                                     bitMask           : number,
>                                   },
>       
>       uniqueElement             : number,
>       timeIsSet                 : boolean,
>       deviceType                : string,  // one of these: ["undefined","plug","guidestone","builtin","crownstoneUSB"]
>       rssiOfExternalCrownstone  : number,  // only relevant if stateOfExternalCrownstone is true
>     }
> }
> ```
> For more information on these fields, check our protocol: [https://github.com/crownstone/bluenet/blob/master/docs/PROTOCOL.md]

***`Topics.verifiedAdvertisement`***
> Same as advertisement except this will only emit advertisements from Crownstones with your encryption keys.




## License

MIT