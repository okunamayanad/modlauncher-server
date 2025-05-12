import paths from "./paths";
import { join } from "path";
import { mkdirSync, promises as fsPromises } from "fs";
import { ModrinthV2Client, type ProjectVersion } from "@xmcl/modrinth";

const modsDir = join(paths.data, "mods");
const client = new ModrinthV2Client();

export async function getModFromModrinth(
  projectId: string,
  gameVersion: string,
  modLoader: "Forge" | "Fabric" | "Quilt" | "NeoForge"
) {
  mkdirSync(join(modsDir, gameVersion), { recursive: true });

  const versions = await client.getProjectVersions(projectId);

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

  const filePath = join(modsDir, gameVersion, file.filename);

  try {
    await fsPromises.access(filePath);
    return filePath;
  } catch {
    const response = await fetch(file.url);
    const buffer = await response.arrayBuffer();
    await fsPromises.writeFile(filePath, Buffer.from(buffer));
    return filePath;
  }
}
