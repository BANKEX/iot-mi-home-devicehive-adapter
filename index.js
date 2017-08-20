const mi = require('./mini-mi');
const DeviceHive = require('devicehive');
const dhConfig = require('./devicehive-config');

var dhDevice = undefined;

console.log('Starting...');

mi.open().then(() => {
    console.log("Listening for device events...");

    mi.on('event', (device, id, status) => {
        console.log('Event received:', device, id, status);

        if (dhDevice)
            dhDevice.sendNotification(`device`, { id: id, event: status })
    });

}, err => console.log("Error:", err));

function authPromise(server, login, password) {
  return new DeviceHive({ serverURL : server + `/api/rest`, login, password });
}

authPromise(dhConfig.server, dhConfig.login, dhConfig.pass)
.then(deviceHive => deviceHive.getDevice(dhConfig.deviceId), err => console.log("DeviceHive error:", err))
.then(device => {
    dhDevice = device;
}, err => console.log("Device error:", err));