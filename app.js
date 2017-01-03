var _ = require('lodash');
var net = require('net');
require('./lib/server');
var clients = [];
net.createServer(function(socket) {

    var broadcast = function(imei, message) {
        clients.forEach(function(client) {
            var client_imei = client.imei.toString();
            if (client_imei.trim() == imei) {
                client.write(message);
            }
        });
    };

    socket.on('data', function(data) {
        if (socket.remoteAddress !== '::ffff:127.0.0.1') {
            if (typeof socket.imei === 'undefined') {
                if (setIMEI(data)) {
                    socket.write('Device Connected');
                } else {
                    socket.write('Bad Command');
                }
            } else {
                clients.forEach(function(client) {
                    if (client.remoteAddress === '::ffff:127.0.0.1') {
                        client.write(data);
                    }
                });
            }
        } else {
            if (typeof socket.remoteAddress === 'undefined') {
                clients.push(socket);
            } else {
                var device = JSON.parse(data.toString());
                broadcast(device.imei, device.command);
            }
        }
    });

    socket.on('end', function() {
        var idx = clients.indexOf(socket);
        if (idx != -1) {
            delete clients[idx];
        }
    });

    var setIMEI = function(imei) {
        if (imei.toString().trim() !== '') {
            socket.imei = imei;
            clients.push(socket);
            return true;
        } else {
            return false;
        }
    };

    socket.write('Welcome to KR-IoT Server');

}).listen(5555, function() {
    console.log("Server running on port 5555");
});