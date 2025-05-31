import { BaseModel } from "./BaseModel";
import type { ProfileData } from "../types/Profile";
import { Logger } from "../utils/Logger";

export class Profile extends BaseModel {
  public username: string;
  public accessToken: string;

  constructor(username: string, accessToken: string) {
    super();
    this.username = username;
    this.accessToken = accessToken;
  }

  async save(): Promise<boolean> {
    try {
      this.updateTimestamp();
      await Profile.db.push(`/profiles/${this.uuid}`, this.toJSON());
      return true;
    } catch (error) {
      Logger.getInstance().error("Failed to save profile:", error);
      return false;
    }
  }

  async update(
    data: Partial<Pick<Profile, "username" | "accessToken">>
  ): Promise<boolean> {
    if (data.username !== undefined) this.username = data.username;
    if (data.accessToken !== undefined) this.accessToken = data.accessToken;
    return this.save();
  }

  async delete(): Promise<boolean> {
    try {
      await Profile.db.delete(`/profiles/${this.uuid}`);
      return true;
    } catch (error) {
      Logger.getInstance().error("Failed to delete profile:", error);
      return false;
    }
  }

  toJSON(): ProfileData {
    return {
      uuid: this.uuid,
      username: this.username,
      accessToken: this.accessToken,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static async findById(uuid: string): Promise<Profile | null> {
    try {
      const data = await Profile.db.getData(`/profiles/${uuid}`);
      return Profile.fromJSON(data);
    } catch {
      return null;
    }
  }

  static async findAll(): Promise<Profile[]> {
    try {
      const data = await Profile.db.getData("/profiles");
      return Object.values(data).map((item: any) => Profile.fromJSON(item));
    } catch {
      return [];
    }
  }

  static fromJSON(data: ProfileData): Profile {
    const profile = new Profile(data.username, data.accessToken);
    profile.uuid = data.uuid;
    profile.createdAt = new Date(data.createdAt);
    if (data.updatedAt) profile.updatedAt = new Date(data.updatedAt);
    return profile;
  }
}
