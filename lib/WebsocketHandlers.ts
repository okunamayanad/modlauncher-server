import type { ServerWebSocket } from "bun";
import {
  createProfile,
  getProfile,
  deleteProfile,
  getAllProfiles,
} from "./ProfileHandlers";

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
      case "get_profile":
        getProfile(ws, data);
        break;
      case "delete_profile":
        deleteProfile(ws, data);
        break;
      case "get_all_profiles":
        getAllProfiles(ws);
        break;
      default:
        sendError(ws, "Unknown message type");
    }
  } catch (error) {
    sendError(ws, "Invalid message format");
  }
};

export function sendResponse(
  ws: ServerWebSocket<WebSocketData>,
  type: string,
  payload: Record<string, any>
): void {
  ws.send(JSON.stringify({ type, ...payload }));
}

export function sendError(
  ws: ServerWebSocket<WebSocketData>,
  message: string
): void {
  ws.send(
    JSON.stringify({
      type: "error",
      message,
    })
  );
}
