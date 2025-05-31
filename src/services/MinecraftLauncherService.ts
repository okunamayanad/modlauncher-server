import type { ServerWebSocket } from "bun";
import type { WebSocketData } from "../types/WebSocket";
import {
  Client,
  Authenticator,
  type ILauncherOptions,
} from "minecraft-launcher-core";
import { join } from "path";
import { mkdirSync } from "fs";
import { Instance } from "../models/Instance";
import { Profile } from "../models/Profile";
import { DatabaseService } from "./DatabaseService";
import { ResponseHelper } from "../utils/ResponseHelper";
import { Logger } from "../utils/Logger";

export class MinecraftLauncherService {
  private logger = Logger.getInstance();
  private activeInstances = new Map<string, Client>();

  async launch(
    instance: Instance,
    profile: Profile,
    ws: ServerWebSocket<WebSocketData>
  ): Promise<void> {
    try {
      const launcher = new Client();
      const instancePath = join(
        DatabaseService.getDataPath(),
        "instances",
        instance.uuid
      );

      // Create instance directory
      mkdirSync(instancePath, { recursive: true });
      mkdirSync(join(instancePath, "minecraft"), { recursive: true });

      // Get authentication (temporary offline mode for testing)
      const auth = await Authenticator.getAuth(profile.username);
      if (!auth) {
        throw new Error("Authentication failed");
      }

      const launchOptions: ILauncherOptions = {
        authorization: auth,
        root: join(instancePath, "minecraft"),
        version: {
          number: instance.versionNumber,
          type: instance.versionType,
        },
        memory: {
          max: `${instance.allocatedMemory.max}M`,
          min: `${instance.allocatedMemory.min}M`,
        },
        window: {
          width: instance.resolution.width,
          height: instance.resolution.height,
        },
      };

      // Set up event listeners
      launcher.on("debug", (message: string) => {
        this.logger.debug(`[${instance.uuid}] ${message}`);
        ResponseHelper.sendGameLog(ws, message, instance.uuid);
      });

      launcher.on("data", (message: string) => {
        this.logger.info(`[${instance.uuid}] ${message}`);
        ResponseHelper.sendGameLog(ws, message, instance.uuid);
      });

      launcher.on("progress", (progress: any) => {
        ResponseHelper.sendResponse(ws, "instance:progress", {
          instanceUuid: instance.uuid,
          progress,
        });
      });

      launcher.on("close", (code: number) => {
        this.logger.info(`Instance ${instance.uuid} closed with code ${code}`);
        this.activeInstances.delete(instance.uuid);
        ResponseHelper.sendResponse(ws, "instance:closed", {
          instanceUuid: instance.uuid,
          exitCode: code,
        });
      });

      // Launch the instance
      await launcher.launch(launchOptions);
      this.activeInstances.set(instance.uuid, launcher);

      // Update last played time
      instance.lastPlayed = new Date();
      await instance.save();
    } catch (error) {
      this.logger.error("Launch failed:", error);
      throw error;
    }
  }

  async stop(instanceUuid: string): Promise<boolean> {
    const launcher = this.activeInstances.get(instanceUuid);
    if (launcher) {
      try {
        // Note: minecraft-launcher-core doesn't have a built-in stop method
        // This would need to be implemented based on the launcher's capabilities
        this.activeInstances.delete(instanceUuid);
        return true;
      } catch (error) {
        this.logger.error("Failed to stop instance:", error);
        return false;
      }
    }
    return false;
  }

  getActiveInstances(): string[] {
    return Array.from(this.activeInstances.keys());
  }

  isInstanceRunning(instanceUuid: string): boolean {
    return this.activeInstances.has(instanceUuid);
  }
}
