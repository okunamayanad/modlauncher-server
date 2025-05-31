import type { ServerWebSocket } from "bun";
import type { WebSocketData } from "../types/WebSocket";
import { ResponseHelper } from "../utils/ResponseHelper";
import { Logger } from "../utils/Logger";

export abstract class BaseController {
  protected logger = Logger.getInstance();

  protected async handleRequest<T>(
    ws: ServerWebSocket<WebSocketData>,
    handler: () => Promise<T>,
    successType: string,
    errorMessage: string = "An error occurred"
  ): Promise<void> {
    try {
      const result = await handler();
      ResponseHelper.sendResponse(ws, successType, result);
    } catch (error) {
      this.logger.error(errorMessage, error);
      ResponseHelper.sendError(ws, errorMessage);
    }
  }
}
