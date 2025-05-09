import { Database } from "bun:sqlite";

// Initialize the database (create the database if it doesn't exist)
const db = new Database("profiles.db");

// Create the 'profiles' table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    uuid TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  );
`);

export { db };
