var _ = require('lodash');
var net = require('net');
require('./lib/server');
var clients = [];
net.createServer(function(socket) {

    var self = this;
    clients.push(socket);

    var broadcast = function(imei, message) {
        var sock = _.filter(clients, function(client) { return client.imei === imei; });
        sock.write(message);
    };

    var socketWrite = function(message) {
        socket.write(message);
    };

    socket.on('data', function(data) {
        if (socket.remoteAddress !== '::ffff:127.0.0.1') {
            if (typeof socket.imei === 'undefined') {
                return setIMEI(data);
            } else {
                socket.write(data);
            }
        } else {
            broadcast(data.imei, data.command);
        }
    });

    socket.on('end', function() {
        var idx = clients.indexOf(socket);
        if (idx != -1) {
            delete clients[idx];
        }
    });

    var setIMEI = function(imei) {
        socket.imei = imei;
        socket.write(socket.imei);
    };

    socketWrite('Welcome to KR-IoT Server');

}).listen(5555, function() {
    console.log("Server running on port 5555");
});