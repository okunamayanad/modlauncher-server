import { db } from "./Database.ts";

export class Profile {
  uuid: string;
  username: string;
  password: string;

  constructor(username: string, password: string) {
    this.uuid = crypto.randomUUID(); // Generate a unique UUID
    this.username = username;
    this.password = password;
  }

  // Save the profile to the database
  async save() {
    try {
      const stmt = db.prepare(`
        INSERT INTO profiles (uuid, username, password) 
        VALUES (?, ?, ?)
      `);
      stmt.run(this.uuid, this.username, this.password);
      console.log("Profile saved to the database.");
    } catch (error) {
      console.error("Error saving profile to the database:", error);
    }
  }

  // Find a profile by UUID or username
  static findBy(field: string, value: string) {
    try {
      // Validate the field to prevent SQL injection
      const validFields = ["uuid", "username"];
      if (!validFields.includes(field)) {
        throw new Error("Invalid search field");
      }

      // Prepare the SQL query
      const query = `SELECT * FROM profiles WHERE ${field} = ?`;
      const stmt = db.prepare(query);
      const profileData = stmt.get(value) as {
        username: string;
        password: string;
      };

      if (profileData) {
        return new Profile(profileData.username, profileData.password); // Return the profile
      } else {
        return null; // No profile found
      }
    } catch (error) {
      console.error("Error searching for profile:", error);
      return null;
    }
  }
}
