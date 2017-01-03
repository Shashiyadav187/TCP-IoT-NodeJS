var _ = require('lodash');
var net = require('net');
var helpers = require('./lib/helpers');
require('./lib/server');
var clients = [];
net.createServer(function(socket) {

    var broadcast = function(imei, message) {
        var sock = _.filter(clients, function(client) { return client.imei.toString().trim() === imei; });
        sock.write(message);
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
                var sock = _.filter(clients, function(client) { return socket.remoteAddress === '::ffff:127.0.0.1' });
                sock.write(data);
            }
        } else {
            var device = JSON.parse(data.toString());
            broadcast(device.imei, device.command);
        }
    });

    socket.on('end', function() {
        var idx = clients.indexOf(socket);
        if (idx != -1) {
            delete clients[idx];
        }
    });

    var setIMEI = function(imei) {
        if (helpers.isIMEI(imei)) {
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