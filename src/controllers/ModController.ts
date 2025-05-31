import type { ServerWebSocket } from "bun";
import type { WebSocketData } from "../types/WebSocket";
import { BaseController } from "./BaseController";
import { ModService } from "../services/ModService";

export class ModController extends BaseController {
  private modService = new ModService();

  async search(
    ws: ServerWebSocket<WebSocketData>,
    data: {
      query: string;
      gameVersion?: string;
      modLoader?: string;
    }
  ): Promise<void> {
    await this.handleRequest(
      ws,
      async () => {
        return await this.modService.searchMods(
          data.query,
          data.gameVersion,
          data.modLoader
        );
      },
      "mod:search-results",
      "Failed to search mods"
    );
  }

  async download(
    ws: ServerWebSocket<WebSocketData>,
    data: {
      projectId: string;
      gameVersion: string;
      modLoader: "Forge" | "Fabric" | "Quilt" | "NeoForge";
    }
  ): Promise<void> {
    await this.handleRequest(
      ws,
      async () => {
        return await this.modService.downloadFromModrinth(
          data.projectId,
          data.gameVersion,
          data.modLoader
        );
      },
      "mod:downloaded",
      "Failed to download mod"
    );
  }
}
