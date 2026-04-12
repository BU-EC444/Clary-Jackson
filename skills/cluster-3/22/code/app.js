const http = require("http");
const fs = require("fs");
const path = require("path");
const { SerialPort } = require("serialport");
const { Server } = require("socket.io");

const HTTP_PORT = parseInt(process.env.HTTP_PORT || "3000", 10);
const SERIAL_PORT_PATH = process.env.SERIAL_PORT || (
  process.platform === "win32" ? "COM3" : "/dev/cu.usbserial-0001"
);
const BAUD_RATE = parseInt(process.env.BAUD_RATE || "115200", 10);
const LOG_FILE = path.join(__dirname, "sensor_log.csv");

function ensureCsvHeader() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, "timestamp,lidar_cm,accel_mag\n");
    }
  } catch (err) {
    console.error("Failed to initialize CSV header:", err.message);
  }
}

function appendCsvRow(timestamp, lidarCm, accelMag) {
  const row = `${timestamp},${lidarCm},${accelMag}\n`;
  fs.writeFile(LOG_FILE, row, { flag: "a" }, (err) => {
    if (err) {
      console.error("Failed to append CSV row:", err.message);
    }
  });
}

function parseSensorLine(rawLine) {
  const parts = rawLine.trim().split(/\s+/);
  if (parts.length !== 2) {
    return null;
  }

  const lidarCm = Number(parts[0]);
  const accelMag = Number(parts[1]);
  if (!Number.isFinite(lidarCm) || !Number.isFinite(accelMag)) {
    return null;
  }

  return { lidarCm, accelMag };
}

function parseAccelFromVerboseLine(rawLine) {
  const match = rawLine.match(/X:\s*([-\d.]+)\s+Y:\s*([-\d.]+)\s+Z:\s*([-\d.]+)/);
  if (!match) {
    return null;
  }

  const x = Number(match[1]);
  const y = Number(match[2]);
  const z = Number(match[3]);
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
    return null;
  }

  return Math.sqrt((x * x) + (y * y) + (z * z));
}

function parseLidarFromVerboseLine(rawLine) {
  const okMatch = rawLine.match(/LIDAR distance:\s*(\d+)\s*cm/i);
  if (okMatch) {
    return Number(okMatch[1]);
  }

  if (/LIDAR read failed/i.test(rawLine)) {
    return -1;
  }

  return null;
}

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Failed to load index.html");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

const io = new Server(server);
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

ensureCsvHeader();

let serialBuffer = "";
let skippedLineCount = 0;
let pendingAccelMag = null;
const serial = new SerialPort({
  path: SERIAL_PORT_PATH,
  baudRate: BAUD_RATE
});

serial.on("open", () => {
  console.log(`Serial opened on ${SERIAL_PORT_PATH} @ ${BAUD_RATE}`);
});

serial.on("data", (chunk) => {
  serialBuffer += chunk.toString("utf8");
  const lines = serialBuffer.split(/\r?\n/);
  serialBuffer = lines.pop() || "";

  for (const rawLine of lines) {
    const parsed = parseSensorLine(rawLine);
    if (parsed) {
      const payload = {
        t: Date.now(),
        lidarCm: parsed.lidarCm,
        accelMag: parsed.accelMag
      };

      io.emit("sensorData", payload);
      appendCsvRow(payload.t, payload.lidarCm, payload.accelMag);
      console.log(`${payload.t} lidar=${payload.lidarCm} accelMag=${payload.accelMag}`);
      continue;
    }

    const accelMagFromVerbose = parseAccelFromVerboseLine(rawLine);
    if (accelMagFromVerbose !== null) {
      pendingAccelMag = accelMagFromVerbose;
      continue;
    }

    const lidarFromVerbose = parseLidarFromVerboseLine(rawLine);
    if (lidarFromVerbose !== null && pendingAccelMag !== null) {
      const payload = {
        t: Date.now(),
        lidarCm: lidarFromVerbose,
        accelMag: pendingAccelMag
      };

      io.emit("sensorData", payload);
      appendCsvRow(payload.t, payload.lidarCm, payload.accelMag);
      console.log(`${payload.t} lidar=${payload.lidarCm} accelMag=${payload.accelMag}`);
      pendingAccelMag = null;
      continue;
    }

    // Ignore non-sensor lines (boot logs, roll/pitch, etc.)
    if (!/roll:\s*/i.test(rawLine)) {
      skippedLineCount++;
      if (skippedLineCount % 25 === 0) {
        console.log(`Skipping non-sensor serial lines (count=${skippedLineCount})`);
      }
    }
  }
});

serial.on("error", (err) => {
  console.error("Serial error:", err.message);
});

server.listen(HTTP_PORT, () => {
  console.log(`Listening on http://localhost:${HTTP_PORT}`);
});
