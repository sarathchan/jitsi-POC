#!/bin/bash

# Start the Express.js app in the background
node index.js &

# Start the WebSocket server
node websocket-server.js
