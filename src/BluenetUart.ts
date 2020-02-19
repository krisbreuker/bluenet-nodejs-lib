import SerialPort from 'serialport'
import { ControlPacket } from './protocol/BlePackets';
import {ControlType} from "./protocol/BluenetTypes";
import {UartTxType} from "./core/uart/UartTypes";
import {UartWrapper} from "./core/uart/uartPackets/UartWrapper";
import {UartReadBuffer} from "./core/uart/UartReadBuffer";
import {UartPacket} from "./core/uart/uartPackets/UartWrapperPacket";
import {UartParser} from "./core/uart/UartParser";
import {eventBus} from "./util/EventBus";

function updatePorts() {
  return new Promise((resolve, reject) => {
    let availablePorts = {};
    SerialPort.list().then((ports) => {
      ports.forEach((port) => {
        availablePorts[port.path] = {port:port, connected:false};
      });
      resolve(availablePorts);
    });
  })
}


export class BluenetUart {
  ports = {};
  port : SerialPort = null;

  readBuffer : UartReadBuffer = null
  triedPaths = [];

  constructor() {
    this.readBuffer = new UartReadBuffer((data : UartPacket) => {
      UartParser.parse(data)
    });
    this.openPort();
  }

  openPort() {
    updatePorts().then((available) => {
      this.ports = available;

      let portPaths = Object.keys(this.ports);
      for (let i = 0; i < portPaths.length; i++) {
        let path = portPaths[i];
        if (this.ports[path].port?.manufacturer === "Silicon Labs" || this.ports[path].port?.manufacturer === "SEGGER") {
          if (this.triedPaths.indexOf(path) === -1) {
            this.tryPath(path);
            break
          }
        }
      }
    });
  }

  tryPath(path) {
    this.triedPaths.push(path);
    this.port = new SerialPort(path,{ baudRate: 230400 });

    const ByteLength = SerialPort.parsers.ByteLength;
    const parser = new ByteLength({length: 1});
    this.port.pipe(parser)

    parser.on('data', (response) => { this.readBuffer.addByteArray(response); });
    this.port.on("open", () => {
      let HANDSHAKE = "HelloCrownstone";
      let success = false;
      let unsubscribe = eventBus.on("UartMessage", (data) => {
        console.log("Got the message", data.string)
        if (data?.string === HANDSHAKE) {
          success = true;
          clearTimeout(closeTimeout);
          unsubscribe();
        }})
      let closeTimeout = setTimeout(() => {
        if (!success) {
          unsubscribe();
          this.port.close(() => {
            // try another.
            this.openPort();
          })
        }
      }, 200);
      this.uartEcho(HANDSHAKE);
    })
  }


  uartEcho(string) {
    let controlPacket = new ControlPacket(ControlType.UART_MESSAGE).loadString(string).getPacket()

    // finally wrap it in an Uart packet
    let uartPacket = new UartWrapper(UartTxType.CONTROL, controlPacket).getPacket()

    this.port.write(uartPacket);
  }

}