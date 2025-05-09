import database from "./database";
import crypto from "crypto";
const dbInstance = database.getInstance();

export class Instance {
  uuid: string;
  name: string;
  version: string;
  modLoader: "Vanilla" | "Forge" | "Fabric" | "Quilt" | "NeoForge";
  mods: {
    name: string;
    version: string;
    modrinth_id?: string;
    file_name: string;
    addedAt?: Date;
    source: "modrinth" | "custom";
  }[];
  allocatedMemory: {
    min: number;
    max: number;
  };
  iconPath: string;
  createdAt: Date;
  lastPlayed: Date;
  resolution: {
    width: number;
    height: number;
  };

  constructor(
    name: string,
    version: string,
    modLoader: "Vanilla" | "Forge" | "Fabric" | "Quilt" | "NeoForge",
    mods: {
      name: string;
      version: string;
      modrinth_id?: string;
      file_name: string;
      addedAt: Date;
      source: "modrinth" | "custom";
    }[],
    allocatedMemory: { min: number; max: number },
    iconpath: string,
    resolution: { width: number; height: number }
  ) {
    this.uuid = crypto.randomUUID();
    this.name = name;
    this.version = version;
    this.modLoader = modLoader;
    this.mods = mods;
    this.allocatedMemory = allocatedMemory;
    this.iconPath = iconpath;
    this.createdAt = new Date();
    this.lastPlayed = new Date();
    this.resolution = resolution;
  }

  async save(): Promise<boolean> {
    try {
      dbInstance.push(`/instances/${this.uuid}`, {
        uuid: this.uuid,
        name: this.name,
        version: this.version,
        modLoader: this.modLoader,
        mods: this.mods,
        allocatedMemory: this.allocatedMemory,
        iconPath: this.iconPath,
        createdAt: this.createdAt,
        lastPlayed: this.lastPlayed,
        resolution: this.resolution,
      });
      return true;
    } catch (error) {
      console.error("Failed to save instance:", error);
      return false;
    }
  }

  async updateInstance(
    name: string,
    version: string,
    modLoader: "Vanilla" | "Forge" | "Fabric" | "Quilt" | "NeoForge",
    mods: {
      name: string;
      version: string;
      modrinth_id?: string;
      file_name: string;
      addedAt: Date;
      source: "modrinth" | "custom";
    }[],
    allocatedMemory: { min: number; max: number },
    iconPath: string,
    resolution: { width: number; height: number }
  ): Promise<boolean> {
    this.name = name;
    this.version = version;
    this.modLoader = modLoader;
    this.mods = mods;
    this.allocatedMemory = allocatedMemory;
    this.iconPath = iconPath;
    this.resolution = resolution;
    this.lastPlayed = new Date(); // Update last played time
    return this.save();
  }

  async delete(): Promise<boolean> {
    try {
      await dbInstance.delete(`/instances/${this.uuid}`);
      return true;
    } catch (error) {
      console.error("Failed to delete instance:", error);
      return false;
    }
  }

  static async fromDatabase(uuid: string): Promise<Instance | null> {
    try {
      const instanceData = await dbInstance.getData(`/instances/${uuid}`);
      const instance = new Instance(
        instanceData.name,
        instanceData.version,
        instanceData.modLoader,
        instanceData.mods,
        instanceData.allocatedMemory,
        instanceData.iconPath,
        instanceData.resolution
      );
      instance.uuid = instanceData.uuid;
      instance.createdAt = new Date(instanceData.createdAt);
      return instance;
    } catch (error) {
      console.error("Instance not found:", error);
      return null;
    }
  }

  static async getAllInstances(): Promise<Instance[]> {
    try {
      const instancesData = await dbInstance.getData("/instances");
      return Object.values(instancesData).map((instanceData: any) => {
        const instance = new Instance(
          instanceData.name,
          instanceData.version,
          instanceData.modLoader,
          instanceData.mods,
          instanceData.allocatedMemory,
          instanceData.iconPath,
          instanceData.resolution
        );
        instance.uuid = instanceData.uuid;
        instance.createdAt = new Date(instanceData.createdAt);
        return instance;
      });
    } catch (error) {
      console.error("Failed to get all instances:", error);
      return [];
    }
  }
}
