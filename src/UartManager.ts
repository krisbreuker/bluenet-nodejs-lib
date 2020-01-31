import SerialPort from 'serialport'

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


updatePorts().then((R) => { console.log(R)});