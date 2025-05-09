import { Profile } from "./lib/Profile.ts";
import type { ServerWebSocket } from "bun";

// Define interface for client data
interface WebSocketData {
  clientId: string;
}

// Create a store for active connections
const clients = new Map<string, ServerWebSocket<WebSocketData>>();

// Handler functions for different message types
const handlers = {
  launch: async (ws: ServerWebSocket<WebSocketData>, data: any) => {
    const { instance_uuid, profile_uuid } = data;
    // Process launch logic here

    // Send response back to client
    ws.send(
      JSON.stringify({
        type: "launch_response",
        success: true,
        instance_uuid,
        profile_uuid,
      })
    );
  },

  getInstances: async (ws: ServerWebSocket<WebSocketData>) => {
    // Get instances logic here
    const instances: any = []; // Replace with actual instances data

    ws.send(
      JSON.stringify({
        type: "instances_response",
        instances,
      })
    );
  },

  createProfile: async (ws: ServerWebSocket<WebSocketData>, data: any) => {
    const { username, password } = data;
    const profile = new Profile(username, password);

    ws.send(
      JSON.stringify({
        type: "profile_created",
        uuid: profile.uuid,
        username: profile.username,
        password: profile.password,
      })
    );
  },
};

// WebSocket server
const server = Bun.serve<WebSocketData, {}>({
  port: 3000,
  fetch(req, server) {
    // Health check endpoint
    if (req.url.endsWith("/api/status")) {
      return new Response("OK");
    }

    // Upgrade HTTP request to WebSocket
    if (server.upgrade(req)) {
      return; // Return if upgrade is successful
    }

    // Return 404 for any other HTTP requests
    return new Response("Not Found", { status: 404 });
  },
  websocket: {
    // Called when a client connects
    open(ws) {
      const clientId = crypto.randomUUID();
      clients.set(clientId, ws);
      ws.data = { clientId };

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: "connection_established",
          clientId,
        })
      );
    },

    // Called when a client sends a message
    message(ws, message) {
      try {
        const data = JSON.parse(message as string);

        // Route message to appropriate handler based on type
        switch (data.type) {
          case "launch":
            handlers.launch(ws, data);
            break;
          case "get_instances":
            handlers.getInstances(ws);
            break;
          case "create_profile":
            handlers.createProfile(ws, data);
            break;
          default:
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Unknown message type",
              })
            );
        }
      } catch (error) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid message format",
          })
        );
      }
    },

    // Called when a client disconnects
    close(ws) {
      if (ws.data.clientId) {
        clients.delete(ws.data.clientId);
      }
    },
  },
});

console.log(`WebSocket server listening on port ${server.port}`);
