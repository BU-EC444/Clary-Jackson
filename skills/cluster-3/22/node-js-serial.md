# Node.js and Serial Data to CanvasJS and to a File

In the earlier Node.js skill we focused on getting the ESP32 to
send sensor data via serial line to the laptop where it is received by
a node app. The node app was then able to display the data on the console.

In the CanvasJS skill, we demonstrated chart plotting with data
served up by the node app to the client browser using socket.io as the
conduit. Data were read from a file inside the node app.

In this skill you will accomplish two functions: (1) Feed the (live)
data from the serial port directly into the browser client via
socket.io as the link between the node app and the client javascript;
and (2) feed the live data to the browser while saving the data to a
local file (local to the node server). This last step is a precursor
to using a database to store sensor data.


## Assignment

1. Choose any ***two*** sensors from your completed skills and send
the collected data, once per second to the UART in a way that allows
you to decode them at the node app. We suggest sending the data as a
single line with values separated by a space. 
2. Write the node app to read the data from the serial port and then
send the data via socket.io to the client browser (via the index.html file javascript).
3. The two data streams, plus the current time (originating in the node app)
should be displayed using CanvasJS.
4. Create a second verision that concurrently writes the data to a file in the node app context.
5. Demonstrate and report

The example code is complete for doing this with a single sensor. 

## Reference Material
- [Serial Port Module](https://www.npmjs.com/package/serialport)
- [Socket.io Brief](/docs/design-patterns/docs/dp-socketIO.md)
- [Serial to Node Example](https://github.com/BU-EC444/04-Code-Examples/tree/main/serial-esp-to-node-serialport)
