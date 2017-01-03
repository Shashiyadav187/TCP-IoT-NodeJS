var _ = require('lodash');
var net = require('net');
require('./lib/server');
var clients = [];
net.createServer(function(socket) {

    var broadcast = function(imei, message) {
        clients.forEach(function(client) {
	   var client_imei = client.imei.toString();
	 if (client_imei.trim() == imei){
	      client.write(message);
	    }
        });
    };

    var socketWrite = function(message) {
        socket.write(message);
    };

    socket.on('data', function(data) {
        if (socket.remoteAddress !== '::ffff:127.0.0.1') {
            if (typeof socket.imei === 'undefined') {
                setIMEI(data);
            } else {
                socket.write(data);
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
        socket.imei = imei;
        clients.push(socket);
    };

    socketWrite('Welcome to KR-IoT Server');

}).listen(5555, function() {
    console.log("Server running on port 5555");
});
