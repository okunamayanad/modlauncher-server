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
          instance_id: number;
          profile_id: number;
        };
        const { instance_id, profile_id } = body;

        return Response.json();
      },
    },

    "/api/*": Response.json({ message: "Not found" }, { status: 404 }),
  },
});
