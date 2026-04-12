# Skill 22 Code Layout

## ESP32 Firmware
- `i2c-accel/`: ESP-IDF project that reads ADXL343 + LIDAR and prints one UART line per second:
  - `lidar_cm accel_mag`

## Node + Browser App
- `app.js`: Node server that reads serial data, emits live updates with Socket.IO, and appends CSV logs.
- `index.html`: CanvasJS client page that plots live LIDAR and accelerometer magnitude.
- `package.json`: Node dependencies/scripts.
- `sensor_log.csv`: Generated at runtime by `app.js`.

## Run Steps
1. Flash ESP32 firmware (`idf.py -p <PORT> flash`) without keeping monitor open.
2. In this `code/` directory, install dependencies:
   - `npm install`
3. Start the Node app (set serial path if needed):
   - `SERIAL_PORT=/dev/cu.usbserial-XXXX npm start`
4. Open `http://localhost:3000` in a browser.

## Notes
- External modules used:
  - [`serialport`](https://www.npmjs.com/package/serialport)
  - [`socket.io`](https://socket.io/)
  - [CanvasJS CDN](https://canvasjs.com/javascript-charts/)
