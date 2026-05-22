import { readFileSync, writeFileSync } from "node:fs";

const files = [
  "plugin.json",
  ".agents/plugins/smart-vs-mcp/plugin.json",
  ".codex-plugin/plugin.json",
  ".claude-plugin/plugin.json",
  ".claude-plugin/marketplace.json",
  ".cursor-plugin/plugin.json",
  "plugins/smart-vs-mcp/plugin.json",
  "plugins/smart-vs-mcp/.codex-plugin/plugin.json",
  "gemini-extension.json",
];

const packageJson = readJson("package.json");
const version = packageJson.version;

for (const file of files) {
  const json = readJson(file);
  setVersion(json, version);
  writeJson(file, json);
}

console.log(`synced plugin manifest versions to ${version}`);

function setVersion(json, version) {
  if (typeof json.version === "string") {
    json.version = version;
  }

  if (Array.isArray(json.plugins)) {
    for (const plugin of json.plugins) {
      if (plugin && typeof plugin.version === "string") {
        plugin.version = version;
      }
    }
  }
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
