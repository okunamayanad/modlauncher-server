import { JsonDB, Config } from "node-json-db";
import { join } from "path";
import { mkdirSync } from "fs";
import envPaths from "env-paths";

export class DatabaseService {
  private static instance: JsonDB;
  private static readonly paths = envPaths("modlauncher-server");

  private constructor() {}

  public static getInstance(): JsonDB {
    if (!DatabaseService.instance) {
      mkdirSync(DatabaseService.paths.data, { recursive: true });
      const dbPath = join(DatabaseService.paths.data, "database");
      DatabaseService.instance = new JsonDB(
        new Config(dbPath, true, false, "/")
      );
    }
    return DatabaseService.instance;
  }

  public static getDataPath(): string {
    return DatabaseService.paths.data;
  }
}
