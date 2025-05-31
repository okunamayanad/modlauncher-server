import type { ServerWebSocket } from "bun";
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  getAllProfiles,
} from "./profileHandlers";
import {
  createInstance,
  launchInstance,
} from "./instanceHandlers";

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
      case "createProfile":
        createProfile(ws, data);
        break;
      case "getProfile":
        getProfile(ws, data);
        break;
      case "updateProfile":
        updateProfile(ws, data);
        break;
      case "deleteProfile":
        deleteProfile(ws, data);
        break;
      case "getAllProfiles":
        getAllProfiles(ws);
        break;
      case "createInstance":
        createInstance(ws, data);
        break;
      case "launchInstance":
        launchInstance(ws, data);
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

export function sendGameLog(
  ws: ServerWebSocket<WebSocketData>,
  log: string,
  instanceUuid: string | null = null
): void {
  ws.send(JSON.stringify({
    type: `log@${instanceUuid || "global"}`,
    message: log,
    timestamp: new Date().toISOString(),
  }));
}
