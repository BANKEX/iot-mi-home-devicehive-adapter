// Mini client for Mi home devices

const EventEmitter = require('events');
const dgram = require('dgram');

class MiniMi extends EventEmitter {
    constructor() {
        super();
    }

    open() {
        var self = this;

        return new Promise(function (resolve, reject) {
            var HOST = '0.0.0.0';
            var PORT = 9898;
            var MCAST_ADDR = "224.0.0.50";
            
            self.client = dgram.createSocket('udp4');

            self.client.on('listening', function () {
                var address = self.client.address();
                console.log('UDP Client listening on ' + address.address + ":" + address.port);
                self.client.setBroadcast(true);
                self.client.setMulticastTTL(128); 
                self.client.addMembership(MCAST_ADDR);
            });

            self.client.on('error', reject);

            self.client.on('message', function (message, remote) {
                // console.log('MCast Msg: From: ' + remote.address + ':' + remote.port +' - ' + message);

                var json = JSON.parse(message.toString());
                json.data = JSON.parse(json.data); // Because of nested json escaping

                if (json.cmd === "report" && json.data.status) {
                    self.emit('event', json.model, json.short_id, json.data.status);
                }
            });

            self.client.bind(PORT, HOST, resolve);
        });
    }

    close() {
        this.client.close();
    }
}

module.exports = new MiniMi();