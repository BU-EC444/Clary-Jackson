var dgram = require('dgram');

var PORT = 3333;                    // must match the ESP32 server's port
var HOST = '192.168.1.126';         // <-- the ESP32's IP from monitor

var client = dgram.createSocket('udp4');

var counter = 0;

setInterval(function () {
    var message = Buffer.from('Hello from laptop ' + counter);
    client.send(message, PORT, HOST, function (error) {
        if (error) {
            console.log('Send error:', error);
        } else {
            console.log('Sent: ' + message);
        }
    });
    counter++;
}, 1000);