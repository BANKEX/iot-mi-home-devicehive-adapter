const miio = require('miio');
const DeviceHive = require('devicehive');

var fs = require('fs');
var dns = require('dns');

function reverseLookup(ip) {
    dns.reverse(ip,function (err, domains){
        miGatewayPattern = /lumi-gateway-v3.*/;

        if (err != null) {
            return;
        }

        domains.forEach(function (domain) {
            dns.lookup(domain, function(err, address, family) {
                if (miGatewayPattern.test(domain)) {
                    console.log("Mi home gateway found:", domain, "at ip", ip);

                    initMiHomeGateway(ip);
                }
            });
        });
    });
}

function discoverDevices() {
    console.log("Network discovery...");

    fs.readFile('/proc/net/arp', function(err, data) {
        if (err)
            return done(err, null);

        var devices = data.toString().split('\n');
        devices.splice(0,1);

        for (i = 0; i < devices.length; i++) {
            var cols = devices[i].replace(/ [ ]*/g, ' ').split(' ');

            if ((cols.length > 3) && (cols[0].length !== 0) && (cols[3].length !== 0) && cols[3] !== '00:00:00:00:00:00') {
                var host = reverseLookup(cols[0]);
            }
        }
    });
}

// var demoLogin = 'dnx2k';
// var demoPass = '123456';
// var deviceId = 'hU2I81NaUr496kcbbZf7NOcU9ruyvu8pow1u';
// var device = undefined;

// function authPromise(login, password) {
//   return new DeviceHive({
//     serverURL : `http://devicehive.bankex.org/api/rest`,
//     login,
//     password
//   });
// }

// authPromise(demoLogin, demoPass)
// .then(deviceHive => deviceHive.getDevice(deviceId))
// .then(_device => {
//  device = _device;
//  console.log(device);
// });

// setTimeout(function () {
//  device.sendNotification(`presence_alarm`, {})
// }, 1000);


function initMiHomeGateway(ip) {
    console.log("Connecting...");
    // Resolve a device, specifying the token (see below for how to get the token)
    miio.device({ address: ip }).then(function (device) {
        // if (device.type === 'controller') {
        //     // This is a controller such as a switch, cube or wall mounted switch
        //     device.on('propertyChanged', e => console.log('d', device.type + ' : property "' + e.property + '" changed from ' + e.oldValue + ' to ' + e.value))
        //     device.on('action', action => console.log('d', device.type + ' : action detected "' + action.id + '"'))
        // }

        // All devices have a propertyChanged event
        device.on('propertyChanged', e => console.log(e.property, e.oldValue, e.value));

        // Some devices have custom events
        device.on('action', e => console.log('Action performed:', e.id));

        console.log("Connection successfull\nEnumerating devices...");

        for (var deviceId in device._devices) {
            //console.log(deviceId);
            var d = device._devices[deviceId];
            //console.log(deviceId, d);

            if (!d.device)
                break;

            d.device.on('propertyChanged', e => console.log(device.type + ' : property "' + e.property + '" changed from ' + e.oldValue + ' to ' + e.value))
            d.device.on('action', action => console.log(device.type + ' : action detected "' + action.id + '"'))

            switch (d.type) {
            case 1: // Switch
                console.log("Switch");
                //device.on('action', e => console.log("Switch", 'Action performed:', e.id));
                break;
            case 2: // Motion
                console.log("Motion");
                break;
            case 3: // Magnet
                console.log("Magnet");
                //device.on('action', e => console.log("Magnet", 'Action performed:', e.id));
                break;
            case 10: // Sensor HT - humidity/temperature
                console.log("Temperature/humidity");
                break;
            }
        }

        console.log("Done");
    }).catch(console.error);
}

discoverDevices();


// const devices = miio.devices({
//   filter: reg => reg.type == 'gateway' || reg.type == 'controller'
// });

// devices.on('available', reg => {
//   const device = reg.device;

//   if (!device) {
//     console.log(reg.id, 'could not be connected to');
//     return;
//   }

//   console.log('Connected to', device);

//   if (device.type === 'controller') {
//      // This is a controller such as a switch, cube or wall mounted switch
//      device.on('action', action => console.log(action.id));
//   }
// });