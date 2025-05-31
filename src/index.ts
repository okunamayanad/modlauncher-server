import { WebSocketServer } from "./core/WebSocketServer";
import { Logger } from "./utils/Logger";
import { Config } from "./config/Config";

async function main() {
  try {
    const logger = Logger.getInstance();
    const config = Config.getInstance();

    logger.info("Starting ModLauncher Server...");

    const server = new WebSocketServer(config.get("port", 3000));
    await server.start();

    logger.info(`Server started on port ${config.get("port", 3000)}`);
  } catch (error) {
    Logger.getInstance().error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
