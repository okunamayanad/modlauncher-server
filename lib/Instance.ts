import Database from "./Database";
import crypto from "crypto";
const dbInstance = Database.getInstance();

export class Instance {
  uuid: string;
  name: string;
  version: string;
  modLoader: "Vanilla" | "Forge" | "Fabric" | "Quilt" | "NeoForge";
  allocatedMemory: {
    min: number;
    max: number;
  };
  iconpath: string;
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
    allocatedMemory: { min: number; max: number },
    iconpath: string,
    resolution: { width: number; height: number }
  ) {
    this.uuid = crypto.randomUUID(); // Generate a unique UUID
    this.name = name;
    this.version = version;
    this.modLoader = modLoader;
    this.allocatedMemory = allocatedMemory;
    this.iconpath = iconpath;
    this.createdAt = new Date();
    this.lastPlayed = new Date();
    this.resolution = resolution;

    dbInstance.push(`/instances/${this.uuid}`, {
      uuid: this.uuid,
      name: this.name,
      version: this.version,
      modLoader: this.modLoader,
      allocatedMemory: this.allocatedMemory,
      iconpath: this.iconpath,
      createdAt: this.createdAt,
      lastPlayed: this.lastPlayed,
      resolution: this.resolution,
    });
  }
}
