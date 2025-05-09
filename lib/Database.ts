import { JsonDB, Config } from "node-json-db";
import Paths from "./Paths";
import { join } from "path";
import { mkdirSync } from "fs";

class Database {
  private static instance: JsonDB;

  private constructor() {} // Prevent direct instantiation

  public static getInstance(): JsonDB {
    if (!Database.instance) {
      // Ensure the directory exists
      mkdirSync(Paths.data, { recursive: true });

      // Define the full path to the database file
      const dbPath = join(Paths.data, "profiles");

      // Initialize the database
      Database.instance = new JsonDB(new Config(dbPath, true, false, "/"));
    }

    return Database.instance;
  }
}

export default Database;
