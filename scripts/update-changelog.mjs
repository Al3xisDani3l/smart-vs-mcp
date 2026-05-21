import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2] ?? JSON.parse(readFileSync("package.json", "utf8")).version;
const today = new Date().toISOString().slice(0, 10);
const previousTag = getPreviousTag();
const range = previousTag ? `${previousTag}..HEAD` : "HEAD";
const commits = getCommits(range);
const sections = groupCommits(commits);
const body = renderRelease(version, today, sections, previousTag);
const existing = existsSync("CHANGELOG.md") ? readFileSync("CHANGELOG.md", "utf8") : "# Changelog\n";
const updated = existing.startsWith("# Changelog") ? existing.replace("# Changelog\n", `# Changelog\n\n${body}`) : `# Changelog\n\n${body}\n${existing}`;

writeFileSync("CHANGELOG.md", updated.trimEnd() + "\n");
writeFileSync("RELEASE_NOTES.md", body.trimStart());
console.log(`updated CHANGELOG.md and RELEASE_NOTES.md for ${version}`);

function getPreviousTag() {
  try {
    return execFileSync("git", ["describe", "--tags", "--abbrev=0"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function getCommits(range) {
  const args = ["log", range, "--pretty=format:%s"];
  const output = execFileSync("git", args, { encoding: "utf8" }).trim();
  return output ? output.split("\n") : [];
}

function groupCommits(commits) {
  const sections = new Map([
    ["feat", []],
    ["fix", []],
    ["docs", []],
    ["chore", []],
    ["other", []],
  ]);

  for (const subject of commits) {
    const match = /^(feat|fix|docs|chore|refactor|perf|test|style)(?:\([^)]+\))?:\s*(.+)$/i.exec(subject);
    const key = match?.[1]?.toLowerCase() ?? "other";
    const text = match?.[2] ?? subject;
    const normalized = ["refactor", "perf", "test", "style"].includes(key) ? "chore" : key;
    sections.get(normalized)?.push(text);
  }

  return sections;
}

function renderRelease(version, today, sections, previousTag) {
  const lines = [`## ${version} - ${today}`, ""];

  if (previousTag) {
    lines.push(`Changes since ${previousTag}.`, "");
  }

  const labels = {
    feat: "Features",
    fix: "Fixes",
    docs: "Documentation",
    chore: "Maintenance",
    other: "Other",
  };

  for (const [key, items] of sections) {
    if (items.length === 0) {
      continue;
    }
    lines.push(`### ${labels[key]}`, "");
    for (const item of items) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (lines.length === 2) {
    lines.push("- Initial release.", "");
  }

  return lines.join("\n");
}
