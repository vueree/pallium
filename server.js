import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import debugModule from "debug";

const debug = debugModule("server");
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 5173;

let messages = [];

wss.on("connection", (ws) => {
  debug(`New client connected`);
  console.log(`New client connected`);

  // Send chat history to the new client
  const historyMessage = JSON.stringify({ type: "chat history", messages });
  console.log("Sending chat history:", historyMessage);
  ws.send(historyMessage);

  ws.on("message", (data) => {
    console.log(`Received raw message: ${data}`);
    try {
      const parsedData = JSON.parse(data);
      console.log(`Parsed message:`, parsedData);

      if (parsedData.type === "chat message") {
        const message = {
          id: Date.now(),
          text: parsedData.message.text,
          user: parsedData.message.user,
          timestamp: new Date()
        };
        messages.push(message);
        console.log("Added new message to chat history:", message);

        // Broadcast the message to all clients
        const broadcastMessage = JSON.stringify({
          type: "chat message",
          message
        });
        console.log("Broadcasting message:", broadcastMessage);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocketServer.OPEN) {
            client.send(broadcastMessage);
          }
        });
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.on("close", () => {
    debug("Client disconnected");
    console.log("Client disconnected");
  });

  ws.on("error", (error) => {
    debug(`WebSocket error: ${error.message}`);
    console.error(`WebSocket error: ${error.message}`);
  });
});

// Heartbeat to keep connections alive
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", () => {
  clearInterval(interval);
});

server.on("error", (error) => {
  debug(`Server error: ${error.message}`);
  console.error(`Server error: ${error.message}`);
});

server.listen(PORT, () => {
  debug(`Server is running on port ${PORT}`);
  console.log(`Server is running on port ${PORT}`);
});

// Add a basic route for testing
app.get("/", (req, res) => {
  res.send("WebSocket server is running");
});
