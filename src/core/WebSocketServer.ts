import type { Server, ServerWebSocket } from "bun";
import { MessageRouter } from "./MessageRouter";
import { ClientManager } from "./ClientManager";
import { Logger } from "../utils/Logger";
import type { WebSocketData } from "../types/WebSocket";

export class WebSocketServer {
  private server?: Server;
  private messageRouter = new MessageRouter();
  private clientManager = new ClientManager();
  private logger = Logger.getInstance();

  constructor(private port: number) {}

  async start(): Promise<void> {
    this.server = Bun.serve({
      port: this.port,
      fetch: this.handleFetch.bind(this),
      websocket: {
        open: this.handleOpen.bind(this),
        message: this.handleMessage.bind(this),
        close: this.handleClose.bind(this),
      },
    });
  }

  private handleFetch(req: Request, server: Server): Response | undefined {
    if (req.url.endsWith("/api/status")) {
      return new Response(
        JSON.stringify({
          status: "ok",
          clients: this.clientManager.getClientCount(),
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (server.upgrade(req)) {
      return;
    }

    return new Response("Not Found", { status: 404 });
  }

  private handleOpen(ws: ServerWebSocket<WebSocketData>): void {
    this.clientManager.addClient(ws);
    this.logger.info(`Client connected: ${ws.data.clientId}`);
  }

  private handleMessage(
    ws: ServerWebSocket<WebSocketData>,
    message: string
  ): void {
    this.messageRouter.route(ws, message);
  }

  private handleClose(ws: ServerWebSocket<WebSocketData>): void {
    this.clientManager.removeClient(ws.data.clientId);
    this.logger.info(`Client disconnected: ${ws.data.clientId}`);
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.server.stop();
      this.logger.info("Server stopped");
    }
  }
}
