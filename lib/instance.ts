import {
  Authenticator,
  Client,
  type ILauncherOptions,
} from "minecraft-launcher-core";
import { join } from "path";
import paths from "./paths";
import database from "./database";
import crypto from "crypto";
const dbInstance = database.getInstance();
const launcher = new Client();

export class Instance {
  uuid: string;
  name: string;
  versionNumber: string;
  versionType: "release" | "snapshot";
  modLoader: "Vanilla" | "Forge" | "Fabric" | "Quilt" | "NeoForge";
  mods: {
    name: string;
    modrinth_id?: string;
    version: string;
    addedAt: Date;
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
  options: Record<string, any>;

  constructor(
    name: string,
    version: string,
    versionType: "release" | "snapshot",
    modLoader: "Vanilla" | "Forge" | "Fabric" | "Quilt" | "NeoForge",
    mods: {
      name: string;
      modrinth_id?: string;
      version: string;
      addedAt: Date;
      source: "modrinth" | "custom";
    }[],
    allocatedMemory: { min: number; max: number },
    iconpath: string,
    resolution: { width: number; height: number }
  ) {
    this.uuid = crypto.randomUUID();
    this.name = name;
    this.versionNumber = version;
    this.versionType = versionType;
    this.modLoader = modLoader;
    this.mods = mods;
    this.allocatedMemory = allocatedMemory;
    this.iconPath = iconpath;
    this.createdAt = new Date();
    this.lastPlayed = new Date();
    this.resolution = resolution;
    this.options = {
      root: join(paths.data, "instances", this.uuid),
      version: {
        number: this.versionNumber,
        type: this.versionType,
      },
      memory: {
        min: this.allocatedMemory.min,
        max: this.allocatedMemory.max,
      },
      window: {
        width: this.resolution.width,
        height: this.resolution.height,
      },
    };
  }

  async launch(): Promise<void> {
    try {
      let authorization = await Authenticator.getAuth("username");
      let opts: ILauncherOptions = {
        root: this.options.root,
        version: this.options.version,
        memory: this.options.memory,
        window: this.options.window,
        authorization,
      };
      await launcher.launch(opts);
      console.log("Instance launched successfully");
    } catch (error) {
      console.error("Failed to launch instance:", error);
    }
  }

  async save(): Promise<boolean> {
    try {
      dbInstance.push(`/instances/${this.uuid}`, {
        uuid: this.uuid,
        name: this.name,
        version: this.versionNumber,
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
      modrinth_id?: string;
      version: string;
      addedAt: Date;
      source: "modrinth" | "custom";
    }[],
    allocatedMemory: { min: number; max: number },
    iconPath: string,
    resolution: { width: number; height: number }
  ): Promise<boolean> {
    this.name = name;
    this.versionNumber = version;
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
        instanceData.versionType,
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
          instanceData.versionType,
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
