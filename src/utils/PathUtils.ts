import { join } from "path";
import { DatabaseService } from "../services/DatabaseService";

export class PathUtils {
  static getInstancePath(instanceUuid: string): string {
    return join(DatabaseService.getDataPath(), "instances", instanceUuid);
  }

  static getMinecraftPath(instanceUuid: string): string {
    return join(PathUtils.getInstancePath(instanceUuid), "minecraft");
  }

  static getModsPath(gameVersion?: string): string {
    const basePath = join(DatabaseService.getDataPath(), "mods");
    return gameVersion ? join(basePath, gameVersion) : basePath;
  }

  static getProfilesPath(): string {
    return join(DatabaseService.getDataPath(), "profiles");
  }

  static getLogsPath(): string {
    return join(DatabaseService.getDataPath(), "logs");
  }
}
