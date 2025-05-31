import type { ServerWebSocket } from "bun";
import type { WebSocketData, OutgoingMessage } from "../types/WebSocket";

export class ResponseHelper {
  static sendResponse(
    ws: ServerWebSocket<WebSocketData>,
    type: string,
    payload: any
  ): void {
    const message: OutgoingMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(message));
  }

  static sendError(
    ws: ServerWebSocket<WebSocketData>,
    message: string,
    code?: string
  ): void {
    const response: OutgoingMessage = {
      type: "error",
      error: {
        message,
        code,
        timestamp: new Date().toISOString(),
      },
    };
    ws.send(JSON.stringify(response));
  }

  static sendGameLog(
    ws: ServerWebSocket<WebSocketData>,
    log: string,
    instanceUuid?: string
  ): void {
    const response: OutgoingMessage = {
      type: instanceUuid ? `log:${instanceUuid}` : "log:global",
      log: {
        message: log,
        instanceUuid,
        timestamp: new Date().toISOString(),
      },
    };
    ws.send(JSON.stringify(response));
  }
}
