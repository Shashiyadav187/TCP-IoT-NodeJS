var fs = require('fs');
var net = require('net');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.get('/', function(req, res) {
    fs.readFile('./index.html', function(err, data) {
        res.send(data.toString())
    });
});

io.on('connection', function(socket) {
    var tcp = net.connect({ port: 5555 });

    tcp.on('data', function(data) {
        socket.emit('data', { data: data.toString() });
    });

    socket.on('data', function(data) {
	var device = JSON.parse(data);
        tcp.write({ imei: device.imei, command: device.command });
    });

    socket.on('disconnect', function() {
        tcp.end();
    });

    tcp.on('end', function() {
        socket.disconnect();
    });
});

server.listen(3333);
