import type { ServerWebSocket } from "bun";
import {
  sendResponse,
  sendError,
  sendGameLog,
  type WebSocketData,
} from "./websocketHandlers";
import { Instance } from "./instance";
import { Profile } from "./profile";
const { Client, Authenticator } = require("minecraft-launcher-core");
import paths from "./paths";
import { join } from "path";
import { mkdirSync } from "fs";

export async function createInstance(
  ws: ServerWebSocket<WebSocketData>,
  data: any
): Promise<void> {
  const {
    name,
    versionNumber,
    versionType,
    modLoader,
    mods,
    allocatedMemory,
    iconPath,
    resolution,
  } = data;
  const instance = new Instance(
    name,
    versionNumber,
    versionType,
    modLoader,
    mods,
    allocatedMemory,
    iconPath,
    resolution
  );
  await instance.save();

  sendResponse(ws, "instanceCreated", {
    uuid: instance.uuid,
    name: instance.name,
    version: instance.versionNumber,
    modLoader: instance.modLoader,
    mods: instance.mods,
    allocatedMemory: instance.allocatedMemory,
    iconPath: instance.iconPath,
    resolution: instance.resolution,
    createdAt: instance.createdAt,
  });
}

export async function launchInstance(
  ws: ServerWebSocket<WebSocketData>,
  data: any
): Promise<void> {
  const { instance_uuid, profile_uuid } = data;
  const instance = await Instance.fromDatabase(instance_uuid);
  const profile = await Profile.fromDatabase(profile_uuid);

  if (instance && profile) {
    const launcher = new Client();
    const auth = Authenticator.getAuth(profile.username) // temporarily offline mode for testing
    //const auth = Authenticator.getAuth(profile.username, profile.accessToken);
    const instancePath = join(paths.data, "instances", instance.uuid);
    if (!auth) {
      sendError(ws, "Authentication failed");
      return;
    }
    mkdirSync(instancePath, { recursive: true });
    let opts = {
      authorization: auth,
      root: join(instancePath, "minecraft"),
      version: {
        number: instance.versionNumber,
        type: instance.versionType,
      },
      memory: {
        max: instance.allocatedMemory.max + "M",
        min: instance.allocatedMemory.min + "M",
      },
    };

    launcher.launch(opts)

    launcher.on("debug", (e: string) => sendGameLog(ws, e, instance_uuid));
    launcher.on("data", (e: string) => sendGameLog(ws, e, instance_uuid));
    launcher.on("debug", (e: string) => console.log(`${e}`));
    launcher.on("data", (e: string) => console.log(`${e}`));

    sendResponse(ws, "instanceLaunched", {
      instance_uuid: instance.uuid,
      profile_uuid: profile.uuid,
    });
  } else {
    sendError(ws, "Instance not found");
  }
}
