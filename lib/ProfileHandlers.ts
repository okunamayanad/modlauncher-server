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
