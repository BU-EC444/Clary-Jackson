# Design Pattern – Sockets

[Internet Sockets](https://en.wikipedia.org/wiki/Network_socket) -- sockets are a more fundamental
way to communicate on an IP network.  Here is a sketch of socket programming using
node.js which greatly simplifies network programming.

## Node.js

Node.js makes it easy to implement UDP sockets. The full
[documentation](https://nodejs.org/api/dgram.html) on implementing UDP
on node.js. We pulled out the basic atttributes below:

```js
// Required module
var dgram = require('dgram');

// Port and IP
var PORT = 3333;
var HOST = '192.168.1.105';

// Create socket
var server = dgram.createSocket('udp4');

// Create server that listens on a port
server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

// On connection, print out received message
server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);

    // Send Ok acknowledgement
    server.send("Ok!",remote.port,remote.address,function(error){
      if(error){
        console.log('MEH!');
      }
      else{
        console.log('Sent: Ok!');
      }
    });

});

// Bind server to port and IP
server.bind(PORT, HOST);


```


## On the ESP32

The ESP ports the [BSD
API](https://en.wikipedia.org/wiki/Berkeley_sockets) for its
implementation of Internet sockets. The code provided in the [client
UDP
example](https://github.com/espressif/esp-idf/tree/master/examples/protocols/sockets/udp_client)
works as is. There is also [code
example](https://github.com/espressif/esp-idf/tree/master/examples/protocols/sockets)
for a UDP server sockets.

Set up the WiFi and/or IP:port using menuconfig or through defines in the code.

Some important code snippets pulled out of example:

``` c

#define HOST_IP_ADDR "X.X.X.X"
#define PORT_SND  3333

// Setting up ESP as client to source UDP packets
static const char *TAG_CLIENT = "Client";
static const char *payload = "Hello from ESP32";

char addr_str[128];
int addr_family;
int ip_protocol;

// IPv4
struct sockaddr_in destAddr;
destAddr.sin_addr.s_addr = inet_addr(HOST_IP_ADDR); // Destination IP
destAddr.sin_family = AF_INET;
destAddr.sin_port = htons(PORT_SND);  // Destination Port
addr_family = AF_INET;
ip_protocol = IPPROTO_IP;
inet_ntoa_r(destAddr.sin_addr, addr_str, sizeof(addr_str) - 1);

// Create socket
int sock = socket(addr_family, SOCK_DGRAM, ip_protocol);
if (sock < 0) {
  ESP_LOGE(TAG_CLIENT, "Unable to create socket: errno %d", errno);
  break;
}
ESP_LOGI(TAG_CLIENT, "Socket created");

while (1) {

  // SEND
  int err = sendto(sock, payload, strlen(payload), 0, (struct sockaddr *)&destAddr, sizeof(destAddr));

  if (err < 0) {
    ESP_LOGE(TAG_CLIENT, "Error occured during sending: errno %d", errno);
    break;
  }
  else {
    ESP_LOG_BUFFER_HEX(TAG_CLIENT, pSend, strlen(pSend));
  }

  vTaskDelay(100 / portTICK_PERIOD_MS);
}

if (sock != -1) {
  ESP_LOGE(TAG_CLIENT, "Shutting down socket and restarting...");
  shutdown(sock, 0);
  close(sock);
}

```


## References
- [Network Sockets](https://en.wikipedia.org/wiki/Network_socket)
- [Node.js UDP](https://nodejs.org/api/dgram.html)
- [ESP Sockets Examples](https://github.com/espressif/esp-idf/tree/master/examples/protocols/sockets)
