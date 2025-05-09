// Create the webserver

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

    "/api/*": Response.json({ message: "Not found" }, { status: 404 }),
  },
});
