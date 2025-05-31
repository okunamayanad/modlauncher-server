import type { ServerWebSocket } from "bun";
import {
  sendResponse,
  sendError,
  type WebSocketData,
} from "./websocketHandlers";
import { Instance } from "./instance";

export async function createInstance(
  ws: ServerWebSocket<WebSocketData>,
  data: any
): Promise<void> {
  const { name, versionNumber, versionType, modLoader, mods, allocatedMemory, iconPath, resolution } = data;
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
  const { uuid } = data;
  const instance = await Instance.fromDatabase(uuid);

  if (instance) {
    // Logic to launch the instance
    sendResponse(ws, "instanceLaunched", {
      uuid: instance.uuid,
      name: instance.name,
      version: instance.versionNumber,
      modLoader: instance.modLoader,
      mods: instance.mods,
      allocatedMemory: instance.allocatedMemory,
      iconPath: instance.iconPath,
      resolution: instance.resolution,
    });
  } else {
    sendError(ws, "Instance not found");
  }
}
