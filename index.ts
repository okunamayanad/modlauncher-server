import {
  handleWebSocketConnection,
  handleIncomingMessage,
  type WebSocketData,
} from "./lib/WebsocketHandlers";

// A Map to store connected clients
const clients = new Map<string, WebSocket>();

// WebSocket server
const server = Bun.serve<WebSocketData, {}>({
  port: 3000,
  fetch(req, server) {
    if (req.url.endsWith("/api/status")) {
      return new Response("OK");
    }
    if (server.upgrade(req)) {
      return;
    }
    return new Response("Not Found", { status: 404 });
  },
  websocket: {
    open(ws) {
      handleWebSocketConnection(ws);
    },
    message(ws, message) {
      handleIncomingMessage(ws, message as string);
    },
    close(ws) {
      if (ws.data.clientId) {
        clients.delete(ws.data.clientId);
      }
    },
  },
});

console.log(`WebSocket server listening on port ${server.port}`);
