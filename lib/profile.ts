import database from "./database";
import crypto from "crypto";
const dbInstance = database.getInstance();

export class Profile {
  uuid: string;
  username: string;
  accessToken: string;

  constructor(username: string, accessToken: string) {
    this.uuid = crypto.randomUUID(); // Generate a unique UUID
    this.username = username;
    this.accessToken = accessToken;
  }

  async save(): Promise<boolean> {
    try {
      dbInstance.push(`/profiles/${this.uuid}`, {
        uuid: this.uuid,
        username: this.username,
        accessToken: this.accessToken,
      });
      return true;
    } catch (error) {
      console.error("Failed to save profile:", error);
      return false;
    }
  }

  async delete(): Promise<boolean> {
    try {
      await dbInstance.delete(`/profiles/${this.uuid}`);
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

  static async getAllProfiles(): Promise<Profile[]> {
    try {
      const profilesData = await dbInstance.getData("/profiles");
      return Object.values(profilesData).map((profileData: any) => {
        const profile = new Profile(
          profileData.username,
          profileData.accessToken
        );
        profile.uuid = profileData.uuid;
        return profile;
      });
    } catch (error) {
      console.error("Failed to get profiles:", error);
      return [];
    }
  }
}
