export interface ModData {
  name: string;
  modrinth_id?: string;
  version: string;
  addedAt: Date;
  source: "modrinth" | "custom";
}

export interface InstanceData {
  uuid: string;
  name: string;
  versionNumber: string;
  versionType: "release" | "snapshot";
  modLoader: "Vanilla" | "Forge" | "Fabric" | "Quilt" | "NeoForge";
  mods: ModData[];
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
}

export interface CreateInstanceRequest {
  name: string;
  versionNumber: string;
  versionType: "release" | "snapshot";
  modLoader: "Vanilla" | "Forge" | "Fabric" | "Quilt" | "NeoForge";
  mods?: ModData[];
  allocatedMemory: { min: number; max: number };
  iconPath?: string;
  resolution: { width: number; height: number };
}

export interface LaunchInstanceRequest {
  instanceUuid: string;
  profileUuid: string;
}
