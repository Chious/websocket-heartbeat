const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// 存儲所有連接的客戶端
const clients = new Map();

wss.on('connection', ws => {
  const clientId = Date.now();
  clients.set(clientId, {
    ws,
    isAlive: true,
    lastHeartbeat: Date.now(),
  });

  // 處理接收到的消息
  ws.on('message', message => {
    const data = message.toString();

    if (data === 'ping') {
      // 回應心跳
      ws.send('pong');
      clients.get(clientId).lastHeartbeat = Date.now();
      clients.get(clientId).isAlive = true;
    } else {
      // 廣播消息給所有客戶端
      broadcastMessage(data, clientId);
    }
  });

  // 處理連接關閉
  ws.on('close', () => {
    clients.delete(clientId);
  });

  // 處理錯誤
  ws.on('error', error => {
    console.error(`Client ${clientId} error:`, error);
    clients.delete(clientId);
  });
});

// 廣播消息給所有客戶端
function broadcastMessage(message, senderId) {
  clients.forEach((client, id) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(`Broadcasting to client ${id}: ${message}`);
    }
  });
}

// 檢查心跳超時的客戶端
const HEARTBEAT_TIMEOUT = 45000; // 45秒
setInterval(() => {
  const now = Date.now();
  clients.forEach((client, id) => {
    if (now - client.lastHeartbeat > HEARTBEAT_TIMEOUT) {
      console.log(`Client ${id} heartbeat timeout`);
      client.ws.terminate();
      clients.delete(id);
    }
  });
}, 30000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/clients', (req, res) => {
  res.json(Array.from(clients.keys()));
});
