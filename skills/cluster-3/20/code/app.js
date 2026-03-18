const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

const PORT = 3000;
const CODE_DIR = __dirname;

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    fs.readFile(path.join(CODE_DIR, "index.html"), (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        return res.end("Error loading index.html");
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
  // send stocks data (AMZN only) for line chart
  fs.readFile(path.join(CODE_DIR, "stocks-csv.txt"), "utf8", (err, raw) => {
    if (err) return;
    const lines = raw.trim().split(/\r?\n/).slice(1);
    const stocksData = lines
      .map((line) => {
        const [date, stock, closing] = line.split(",").map((s) => s.trim());
        return { date: Number(date), stock, closing: Number(closing) };
      })
      .filter((row) => row.stock === "AMZN")
      .map((row) => ({ x: row.date, y: row.closing }));
    socket.emit("stocksData", stocksData);
  });

  // stream smoke data for spline chart
  fs.readFile(path.join(CODE_DIR, "smoke.txt"), "utf8", (err, raw) => {
    if (err) return;
    const lines = raw
      .trim()
      .split(/\r?\n/)
      .slice(1)
      .filter((line) => line.trim());
    const smokePoints = lines
      .map((line) => {
        const parts = line.split(/\t/);
        return { time: Number(parts[0]), id: Number(parts[1]), temp: Number(parts[3]) };
      })
      .filter((row) => row.id === 1)
      .map((row) => ({ x: row.time, y: row.temp }));

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= smokePoints.length) {
        clearInterval(interval);
        return;
      }
      socket.emit("smokePoint", smokePoints[idx]);
      idx++;
    }, 500);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
