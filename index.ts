// Create the webserver
import { Profile } from "./lib/Profile.ts";

Bun.serve({
  port: 3000,
  routes: {
    // Static routes
    "/api/status": new Response("OK"),

    // Dynamic routes
    "/api/launch": {
      GET: () => new Response("Launch an instance"),
      POST: async (req) => {
        const body = (await req.json()) as {
          instance_uuid: string;
          profile_uuid: string;
        };
        const { instance_uuid, profile_uuid } = body;

        return Response.json();
      },
    },

    "/api/instances": {
      GET: async (req) => {
        return Response.json();
      },
    },

    "/api/new/profile": {
      POST: async (req) => {
        const body = (await req.json()) as {
          username: string;
          password: string;
        };
        const { username, password } = body;
        const profile = new Profile(username, password);

        return Response.json({
          uuid: profile.uuid,
          username: profile.username,
          password: profile.password,
        });
      },
    },

    "/api/*": Response.json({ message: "Not found" }, { status: 404 }),
  },
});
