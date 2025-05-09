import type { ServerWebSocket } from "bun";
import type { WebSocketData } from "./WebsocketHandlers";
import { Profile } from "./Profile";

export async function createProfile(
  ws: ServerWebSocket<WebSocketData>,
  data: any
): Promise<void> {
  const { username, accessToken } = data;
  const profile = new Profile(username, accessToken);

  ws.send(
    JSON.stringify({
      type: "profile_created",
      uuid: profile.uuid,
      username: profile.username,
    })
  );
}

export async function getProfile(
  ws: ServerWebSocket<WebSocketData>,
  data: any
): Promise<void> {
  const { uuid } = data;
  const profile = await Profile.fromDatabase(uuid);

  if (profile) {
    ws.send(
      JSON.stringify({
        type: "profile_data",
        uuid: profile.uuid,
        username: profile.username,
      })
    );
  } else {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Profile not found",
      })
    );
  }
}
