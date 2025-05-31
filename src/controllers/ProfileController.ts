import type { ServerWebSocket } from "bun";
import type { WebSocketData } from "../types/WebSocket";
import type {
  CreateProfileRequest,
  UpdateProfileRequest,
} from "../types/Profile";
import type { LaunchInstanceRequest } from "../types/Instance";
import { BaseController } from "./BaseController";
import { Profile } from "../models/Profile";
import { Instance } from "../models/Instance";
import { ResponseHelper } from "../utils/ResponseHelper";

export class ProfileController extends BaseController {
  private launcherService: any; // Replace 'any' with the actual LauncherService type

  constructor(launcherService: any) { // Replace 'any' with the actual LauncherService type
    super();
    this.launcherService = launcherService;
  }
  async create(
    ws: ServerWebSocket<WebSocketData>,
    data: CreateProfileRequest
  ): Promise<void> {
    await this.handleRequest(
      ws,
      async () => {
        const profile = new Profile(data.username, data.accessToken);
        const success = await profile.save();

        if (!success) {
          throw new Error("Failed to save profile");
        }

        return profile.toJSON();
      },
      "profile:created",
      "Failed to create profile"
    );
  }

  async get(
    ws: ServerWebSocket<WebSocketData>,
    data: { uuid: string }
  ): Promise<void> {
    await this.handleRequest(
      ws,
      async () => {
        const profile = await Profile.findById(data.uuid);
        if (!profile) {
          throw new Error("Profile not found");
        }
        return profile.toJSON();
      },
      "profile:data",
      "Profile not found"
    );
  }

  async update(
    ws: ServerWebSocket<WebSocketData>,
    data: UpdateProfileRequest
  ): Promise<void> {
    await this.handleRequest(
      ws,
      async () => {
        const profile = await Profile.findById(data.uuid);
        if (!profile) {
          throw new Error("Profile not found");
        }

        const success = await profile.update({
          username: data.username,
          accessToken: data.accessToken,
        });

        if (!success) {
          throw new Error("Failed to update profile");
        }

        return profile.toJSON();
      },
      "profile:updated",
      "Failed to update profile"
    );
  }

  async delete(
    ws: ServerWebSocket<WebSocketData>,
    data: { uuid: string }
  ): Promise<void> {
    await this.handleRequest(
      ws,
      async () => {
        const instance = await Instance.findById(data.uuid);
        if (!instance) {
          throw new Error("Instance not found");
        }

        const success = await instance.delete();
        if (!success) {
          throw new Error("Failed to delete instance");
        }

        return { uuid: data.uuid };
      },
      "instance:deleted",
      "Failed to delete instance"
    );
  }

  async list(ws: ServerWebSocket<WebSocketData>): Promise<void> {
    await this.handleRequest(
      ws,
      async () => {
        const instances = await Instance.findAll();
        return instances.map((instance) => instance.toJSON());
      },
      "instance:list",
      "Failed to get instances"
    );
  }

  async launch(
    ws: ServerWebSocket<WebSocketData>,
    data: LaunchInstanceRequest
  ): Promise<void> {
    try {
      const instance = await Instance.findById(data.instanceUuid);
      const profile = await Profile.findById(data.profileUuid);

      if (!instance) {
        ResponseHelper.sendError(ws, "Instance not found");
        return;
      }

      if (!profile) {
        ResponseHelper.sendError(ws, "Profile not found");
        return;
      }

      await this.launcherService.launch(instance, profile, ws);

      ResponseHelper.sendResponse(ws, "instance:launched", {
        instanceUuid: instance.uuid,
        profileUuid: profile.uuid,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error("Failed to launch instance:", error);
      ResponseHelper.sendError(ws, "Failed to launch instance");
    }
  }
}
