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

  static async fromDatabase(uuid: string): Promise<Profile | null> {
    try {
      const profileData = await dbInstance.getData(`/profiles/${uuid}`);
      return new Profile(profileData.username, profileData.accessToken);
    } catch (error) {
      console.error("Profile not found:", error);
      return null;
    }
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
}
