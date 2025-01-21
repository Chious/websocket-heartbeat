const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ noServer: true });

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
    if (id !== senderId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}
