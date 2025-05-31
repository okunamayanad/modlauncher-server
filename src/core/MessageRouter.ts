import type { ServerWebSocket } from "bun";
import type { WebSocketData, IncomingMessage } from "../types/WebSocket";
import { ProfileController } from "../controllers/ProfileController";
import { InstanceController } from "../controllers/InstanceController";
import { ModController } from "../controllers/ModController";
import { ResponseHelper } from "../utils/ResponseHelper";
import { Logger } from "../utils/Logger";

export class MessageRouter {
  private controllers = new Map<string, any>();
  private logger = Logger.getInstance();

  constructor() {
    this.registerControllers();
  }

  private registerControllers(): void {
    const profileController = new ProfileController(null); // TODO: Inject proper LauncherService
    const instanceController = new InstanceController();
    const modController = new ModController();

    // Profile routes
    this.controllers.set(
      "profile:create",
      profileController.create.bind(profileController)
    );
    this.controllers.set(
      "profile:get",
      profileController.get.bind(profileController)
    );
    this.controllers.set(
      "profile:update",
      profileController.update.bind(profileController)
    );
    this.controllers.set(
      "profile:delete",
      profileController.delete.bind(profileController)
    );
    this.controllers.set(
      "profile:list",
      profileController.list.bind(profileController)
    );

    // Instance routes
    this.controllers.set(
      "instance:create",
      instanceController.create.bind(instanceController)
    );
    this.controllers.set(
      "instance:launch",
      instanceController.launch.bind(instanceController)
    );
    this.controllers.set(
      "instance:get",
      instanceController.get.bind(instanceController)
    );
    this.controllers.set(
      "instance:update",
      instanceController.update.bind(instanceController)
    );
    this.controllers.set(
      "instance:delete",
      instanceController.delete.bind(instanceController)
    );
    this.controllers.set(
      "instance:list",
      instanceController.list.bind(instanceController)
    );

    // Mod routes
    this.controllers.set(
      "mod:search",
      modController.search.bind(modController)
    );
    this.controllers.set(
      "mod:download",
      modController.download.bind(modController)
    );
  }

  route(ws: ServerWebSocket<WebSocketData>, message: string): void {
    try {
      const data: IncomingMessage = JSON.parse(message);
      const handler = this.controllers.get(data.type);

      if (!handler) {
        ResponseHelper.sendError(ws, `Unknown message type: ${data.type}`);
        return;
      }

      handler(ws, data.payload || {});
    } catch (error) {
      this.logger.error("Message routing error:", error);
      ResponseHelper.sendError(ws, "Invalid message format");
    }
  }
}
