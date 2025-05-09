import { create } from "domain";
import database from "./database";
import crypto from "crypto";
const dbInstance = database.getInstance();

export class Profile {
  uuid: string;
  username: string;
  accessToken: string;
  createdAt: Date;

  constructor(username: string, accessToken: string) {
    this.uuid = crypto.randomUUID(); // Generate a unique UUID
    this.username = username;
    this.accessToken = accessToken;
    this.createdAt = new Date(Date.now());
  }

  async save(): Promise<boolean> {
    try {
      dbInstance.push(`/profiles/${this.uuid}`, {
        uuid: this.uuid,
        username: this.username,
        accessToken: this.accessToken,
        createdAt: this.createdAt,
      });
      return true;
    } catch (error) {
      console.error("Failed to save profile:", error);
      return false;
    }
  }

  async updateProfile(username: string, accessToken: string): Promise<boolean> {
    this.username = username;
    this.accessToken = accessToken;
    return this.save();
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
      profile.createdAt = new Date(profileData.createdAt); // Set the createdAt date
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
        profile.createdAt = new Date(profileData.createdAt);
        return profile;
      });
    } catch (error) {
      console.error("Failed to get profiles:", error);
      return [];
    }
  }
}
