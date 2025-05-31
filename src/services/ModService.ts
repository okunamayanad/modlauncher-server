import { join } from "path";
import { mkdirSync, promises as fsPromises } from "fs";
import { ModrinthV2Client, type ProjectVersion } from "@xmcl/modrinth";
import { DatabaseService } from "./DatabaseService";
import { Logger } from "../utils/Logger";
import type { ModData } from "../types/Instance";

export class ModService {
  private client = new ModrinthV2Client();
  private logger = Logger.getInstance();
  private modsPath = join(DatabaseService.getDataPath(), "mods");

  constructor() {
    mkdirSync(this.modsPath, { recursive: true });
  }

  async downloadFromModrinth(
    projectId: string,
    gameVersion: string,
    modLoader: "Forge" | "Fabric" | "Quilt" | "NeoForge"
  ): Promise<ModData> {
    try {
      const versionPath = join(this.modsPath, gameVersion);
      mkdirSync(versionPath, { recursive: true });

      const versions = await this.client.getProjectVersions(projectId);
      const selectedVersion = versions.find(
        (v) =>
          v.game_versions.includes(gameVersion) &&
          v.loaders.includes(modLoader.toLowerCase())
      );

      if (!selectedVersion) {
        throw new Error(
          `Version ${gameVersion} with mod loader ${modLoader} not found for project ${projectId}`
        );
      }

      const file = selectedVersion.files.find((f) => f.primary);
      if (!file) {
        throw new Error(`No primary file found for version ${gameVersion}`);
      }

      const filePath = join(versionPath, file.filename);

      // Check if file already exists
      try {
        await fsPromises.access(filePath);
        this.logger.info(`Mod already exists: ${file.filename}`);
      } catch {
        // File doesn't exist, download it
        this.logger.info(`Downloading mod: ${file.filename}`);
        const response = await fetch(file.url);
        const buffer = await response.arrayBuffer();
        await fsPromises.writeFile(filePath, Buffer.from(buffer));
        this.logger.info(`Downloaded mod: ${file.filename}`);
      }

      // Get project info for name
      const project = await this.client.getProject(projectId);

      return {
        name: project.title,
        modrinth_id: projectId,
        version: selectedVersion.version_number,
        addedAt: new Date(),
        source: "modrinth",
      };
    } catch (error) {
      this.logger.error("Failed to download mod from Modrinth:", error);
      throw error;
    }
  }

  async installCustomMod(
    filePath: string,
    name: string,
    version: string
  ): Promise<ModData> {
    // Implementation for custom mod installation
    // This would involve copying the file to the appropriate location
    // and returning mod data
    return {
      name,
      version,
      addedAt: new Date(),
      source: "custom",
    };
  }

  async removeMod(modData: ModData, gameVersion: string): Promise<boolean> {
    try {
      if (modData.source === "modrinth" && modData.modrinth_id) {
        // For Modrinth mods, we'd need to determine the filename
        // This is simplified - in practice, you'd store the filename
        const versionPath = join(this.modsPath, gameVersion);
        // Remove the mod file (implementation depends on how filenames are stored)
      }
      return true;
    } catch (error) {
      this.logger.error("Failed to remove mod:", error);
      return false;
    }
  }

  async searchMods(
    query: string,
    gameVersion?: string,
    modLoader?: string
  ): Promise<any[]> {
    try {
      const searchParams: any = {
        query,
        limit: 20,
      };

      if (gameVersion) {
        searchParams.facets = [["versions:" + gameVersion]];
      }

      if (modLoader) {
        const loaderFacet = ["categories:" + modLoader.toLowerCase()];
        if (searchParams.facets) {
          searchParams.facets.push(loaderFacet);
        } else {
          searchParams.facets = [loaderFacet];
        }
      }

      const results = await this.client.searchProjects(searchParams);
      return results.hits;
    } catch (error) {
      this.logger.error("Failed to search mods:", error);
      throw error;
    }
  }
}
