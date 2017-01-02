var fs = require('fs');
var net = require('net');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var handleError = function(error) {
    console.log('An error occured: ', error);
};

app.get('/', function(req, res) {
    fs.readFile('./index.html', function(err, data) {
        res.send(data.toString())
    });
});

io.on('connection', function(socket) {
    var tcp = net.connect({ port: 5000 });

    tcp.on('data', function(data) {
        socket.emit('data', { data: data.toString() });
    });

    socket.on('data', function(data) {
        tcp.write({ imei: data.imei, command: data.command });
    });

    socket.on('disconnect', function() {
        tcp.end();
    });

    tcp.on('end', function() {
        socket.disconnect();
    });

    tcp.on('error', handleError);
    socket.on('error', handleError);
});

server.listen(3000);