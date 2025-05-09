import type { ServerWebSocket } from "bun";
import {
  sendResponse,
  sendError,
  type WebSocketData,
} from "./websocketHandlers";
import { Profile } from "./profile";

export async function createProfile(
  ws: ServerWebSocket<WebSocketData>,
  data: any
): Promise<void> {
  const { username, accessToken } = data;
  const profile = new Profile(username, accessToken);
  profile.save();

  sendResponse(ws, "profileCreated", {
    uuid: profile.uuid,
    username: profile.username,
  });
}

export async function getProfile(
  ws: ServerWebSocket<WebSocketData>,
  data: any
): Promise<void> {
  const { uuid } = data;
  const profile = await Profile.fromDatabase(uuid);

  if (profile) {
    sendResponse(ws, "profileData", {
      uuid: profile.uuid,
      username: profile.username,
    });
  } else {
    sendError(ws, "Profile not found");
  }
}

export async function deleteProfile(
  ws: ServerWebSocket<WebSocketData>,
  data: any
): Promise<void> {
  const { uuid } = data;

  try {
    const profile = await Profile.fromDatabase(uuid);

    if (!profile) {
      sendError(ws, "Profile not found");
      return;
    }

    const success = await profile.delete();
    if (!success) {
      sendError(ws, "Failed to delete profile");
      return;
    }

    sendResponse(ws, "profileDeleted", { uuid: profile.uuid });
  } catch (error) {
    sendError(ws, "An unexpected error occurred");
  }
}

export async function getAllProfiles(
  ws: ServerWebSocket<WebSocketData>
): Promise<void> {
  const profiles = await Profile.getAllProfiles();
  sendResponse(ws, "allProfiles", profiles);
}
