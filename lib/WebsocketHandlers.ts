import type { ServerWebSocket } from "bun";
import { createProfile } from "./ProfileHandlers";

export interface WebSocketData {
  clientId: string;
}

export const handleWebSocketConnection = (
  ws: ServerWebSocket<WebSocketData>
) => {
  const clientId = crypto.randomUUID();
  ws.data = { clientId };
  ws.send(JSON.stringify({ type: "connection_established", clientId }));
};

export const handleIncomingMessage = (
  ws: ServerWebSocket<WebSocketData>,
  message: string
) => {
  try {
    const data = JSON.parse(message);
    switch (data.type) {
      case "create_profile":
        createProfile(ws, data);
        break;
      default:
        sendError(ws, "Unknown message type");
    }
  } catch (error) {
    sendError(ws, "Invalid message format");
  }
};

export const sendError = <T>(ws: ServerWebSocket<T>, message: string) => {
  ws.send(JSON.stringify({ type: "error", message }));
};
