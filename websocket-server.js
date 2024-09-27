const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8090 });

wss.on('connection', (ws) => {
  console.log('New client connected');

  // When a client sends a message
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    const parsedMessage = JSON.parse(message);

    // Broadcast the message to all other clients (excluding sender)
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(parsedMessage));
      }
    });
  });

  // When a client disconnects
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Send a message to the client
  ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));
});

console.log('WebSocket server running on ws://localhost:8080');
