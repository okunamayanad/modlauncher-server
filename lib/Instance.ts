import Database from "./Database";
import crypto from "crypto";
const dbInstance = Database.getInstance();

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
}
