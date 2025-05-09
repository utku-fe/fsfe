const express = require("express");
const https = require("https");
const fs = require("fs");
const WebSocket = require("ws");

const app = express();
const server = https.createServer({
  key: fs.readFileSync("/etc/letsencrypt/live/utkutekin.dev/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/utkutekin.dev/fullchain.pem")
}, app);

app.get("/", function (req, res) {
  res.sendFile("index.html", { root: __dirname });
});

server.listen(443, function () {
  console.log("server started on port 433");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
  console.log("clients connected ", numClients);

  wss.broadcast(`current visitors: ${numClients}`);

  if (ws.readyState === WebSocket.OPEN) {
    ws.send("welcome to server");
  }

  ws.on("close", function close() {
    console.log("a client has disconnected");
    wss.broadcast(`current visitors: ${wss.clients.size}`);
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};
