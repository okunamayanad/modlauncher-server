import { WebSocketServer } from "./core/WebSocketServer";
import { Logger } from "./utils/Logger";
import { Config } from "./config/Config";
import { TrayService } from "./services/TrayService";

async function main() {
  try {
    const logger = Logger.getInstance();
    const config = Config.getInstance();

    logger.info("Starting ModLauncher Server...");

    // Initialize tray service first
    const trayService = new TrayService();

    const server = new WebSocketServer(config.get("port", 3000));
    await server.start();

    logger.info(`Server started on port ${config.get("port", 3000)}`);

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      logger.info("Received SIGINT, shutting down gracefully...");
      trayService.destroy();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      logger.info("Received SIGTERM, shutting down gracefully...");
      trayService.destroy();
      process.exit(0);
    });
  } catch (error) {
    Logger.getInstance().error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
