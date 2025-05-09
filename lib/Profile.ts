import Database from "./Database";
import crypto from "crypto";
const dbInstance = Database.getInstance();

export class Profile {
  uuid: string;
  username: string;
  accessToken: string;

  constructor(username: string, accessToken: string) {
    this.uuid = crypto.randomUUID(); // Generate a unique UUID
    this.username = username;
    this.accessToken = accessToken;

    dbInstance.push(`/profiles/${this.uuid}`, {
      uuid: this.uuid,
      username: this.username,
      accessToken: this.accessToken,
    });
  }

  static async delete(uuid: string): Promise<boolean> {
    try {
      await dbInstance.delete(`/profiles/${uuid}`);
      return true;
    } catch (error) {
      console.error("Failed to delete profile:", error);
      return false;
    }
  }

  static async fromDatabase(uuid: string): Promise<Profile | null> {
    try {
      const profileData = await dbInstance.getData(`/profiles/${uuid}`);
      var profile = new Profile(profileData.username, profileData.accessToken);
      profile.uuid = profileData.uuid; // Set the UUID from the database
      return profile;
    } catch (error) {
      console.error("Profile not found:", error);
      return null;
    }
  }
}
