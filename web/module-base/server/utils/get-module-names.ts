import { existsSync, readdirSync } from "fs";
import { join } from "path";

/**
 * Get list of all module names from modules directory
 */
export function getModuleNames(): string[] {
  const modulesDirectory = join(process.cwd(), "modules");

  if (!existsSync(modulesDirectory)) {
    return [];
  }

  const moduleDirs = readdirSync(modulesDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  return moduleDirs;
}

