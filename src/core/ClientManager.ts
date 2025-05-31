import type { ServerWebSocket } from "bun";
import type { WebSocketData } from "../types/WebSocket";
import { ResponseHelper } from "../utils/ResponseHelper";
import crypto from "crypto";

export class ClientManager {
  private clients = new Map<string, ServerWebSocket<WebSocketData>>();

  addClient(ws: ServerWebSocket<WebSocketData>): void {
    const clientId = crypto.randomUUID();
    ws.data = { clientId };
    this.clients.set(clientId, ws);

    ResponseHelper.sendResponse(ws, "connection:established", {
      clientId
    });
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  getClient(clientId: string): ServerWebSocket<WebSocketData> | undefined {
    return this.clients.get(clientId);
  }

  getClientCount(): number {
    return this.clients.size;
  }

  broadcast(type: string, payload: any): void {
    const message = JSON.stringify({ type, ...payload });
    for (const client of this.clients.values()) {
      client.send(message);
    }
  }

  broadcastToGroup(clientIds: string[], type: string, payload: any): void {
    const message = JSON.stringify({ type, ...payload });
    for (const clientId of clientIds) {
      const client = this.clients.get(clientId);
      if (client) {
        client.send(message);
      }
    }
  }
}
