import { BaseModel } from "./BaseModel";
import type { InstanceData, ModData } from "../types/Instance";
import { Logger } from "../utils/Logger";

export class Instance extends BaseModel {
  public name: string;
  public versionNumber: string;
  public versionType: "release" | "snapshot";
  public modLoader: "Vanilla" | "Forge" | "Fabric" | "Quilt" | "NeoForge";
  public mods: ModData[];
  public allocatedMemory: { min: number; max: number };
  public iconPath: string;
  public lastPlayed: Date;
  public resolution: { width: number; height: number };

  constructor(data: {
    name: string;
    versionNumber: string;
    versionType: "release" | "snapshot";
    modLoader: "Vanilla" | "Forge" | "Fabric" | "Quilt" | "NeoForge";
    mods?: ModData[];
    allocatedMemory: { min: number; max: number };
    iconPath?: string;
    resolution: { width: number; height: number };
  }) {
    super();
    this.name = data.name;
    this.versionNumber = data.versionNumber;
    this.versionType = data.versionType;
    this.modLoader = data.modLoader;
    this.mods = data.mods || [];
    this.allocatedMemory = data.allocatedMemory;
    this.iconPath = data.iconPath || "";
    this.lastPlayed = new Date();
    this.resolution = data.resolution;
  }

  async save(): Promise<boolean> {
    try {
      this.updateTimestamp();
      await Instance.db.push(`/instances/${this.uuid}`, this.toJSON());
      return true;
    } catch (error) {
      Logger.getInstance().error("Failed to save instance:", error);
      return false;
    }
  }

  async update(data: Partial<InstanceData>): Promise<boolean> {
    if (data.name !== undefined) this.name = data.name;
    if (data.versionNumber !== undefined)
      this.versionNumber = data.versionNumber;
    if (data.versionType !== undefined) this.versionType = data.versionType;
    if (data.modLoader !== undefined) this.modLoader = data.modLoader;
    if (data.mods !== undefined) this.mods = data.mods;
    if (data.allocatedMemory !== undefined)
      this.allocatedMemory = data.allocatedMemory;
    if (data.iconPath !== undefined) this.iconPath = data.iconPath;
    if (data.resolution !== undefined) this.resolution = data.resolution;

    this.lastPlayed = new Date();
    return this.save();
  }

  async delete(): Promise<boolean> {
    try {
      await Instance.db.delete(`/instances/${this.uuid}`);
      return true;
    } catch (error) {
      Logger.getInstance().error("Failed to delete instance:", error);
      return false;
    }
  }

  toJSON(): InstanceData {
    return {
      uuid: this.uuid,
      name: this.name,
      versionNumber: this.versionNumber,
      versionType: this.versionType,
      modLoader: this.modLoader,
      mods: this.mods,
      allocatedMemory: this.allocatedMemory,
      iconPath: this.iconPath,
      createdAt: this.createdAt,
      lastPlayed: this.lastPlayed,
      resolution: this.resolution,
    };
  }

  static async findById(uuid: string): Promise<Instance | null> {
    try {
      const data = await Instance.db.getData(`/instances/${uuid}`);
      return Instance.fromJSON(data);
    } catch {
      return null;
    }
  }

  static async findAll(): Promise<Instance[]> {
    try {
      const data = await Instance.db.getData("/instances");
      return Object.values(data).map((item: any) => Instance.fromJSON(item));
    } catch {
      return [];
    }
  }

  static fromJSON(data: InstanceData): Instance {
    const instance = new Instance({
      name: data.name,
      versionNumber: data.versionNumber,
      versionType: data.versionType,
      modLoader: data.modLoader,
      mods: data.mods,
      allocatedMemory: data.allocatedMemory,
      iconPath: data.iconPath,
      resolution: data.resolution,
    });

    instance.uuid = data.uuid;
    instance.createdAt = new Date(data.createdAt);
    instance.lastPlayed = new Date(data.lastPlayed);

    return instance;
  }
}
