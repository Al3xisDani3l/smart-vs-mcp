import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function getCliVersion(): string {
  const fromEnv = process.env.npm_package_version;
  if (fromEnv) {
    return fromEnv;
  }

  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, "..", "..", "package.json"),
    path.resolve(here, "..", "package.json"),
  ];

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(readFileSync(candidate, "utf8")) as { version?: string };
      if (parsed.version) {
        return parsed.version;
      }
    } catch {
      // Ignore and try the next candidate path.
    }
  }

  return "0.0.0";
}
