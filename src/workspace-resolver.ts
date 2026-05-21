import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import type { ResolveOptions, WorkspaceResolution } from "./types.js";

const ENV_WORKSPACE_KEYS = ["CODEX_WORKSPACE", "WORKSPACE", "INIT_CWD", "PWD"] as const;

export function resolveWorkspace(options: ResolveOptions): WorkspaceResolution {
  const candidate = firstExistingPath([
    options.workspaceArg,
    ...ENV_WORKSPACE_KEYS.map((key) => options.env[key]),
    options.cwd,
  ]);

  const startPath = path.resolve(candidate ?? options.cwd);
  const startDirectory = toDirectory(startPath);
  const solutionRoot = findSolutionRoot(startDirectory);

  if (solutionRoot) {
    return {
      workspace: solutionRoot.directory,
      startPath,
      source: sourceForCandidate(candidate, options),
      solutionPath: solutionRoot.solutionPath,
    };
  }

  return {
    workspace: startDirectory,
    startPath,
    source: sourceForCandidate(candidate, options),
  };
}

export function findSolutionRoot(startDirectory: string): { directory: string; solutionPath: string } | undefined {
  let current = path.resolve(startDirectory);

  while (true) {
    const solutionPath = findSolutionFile(current);
    if (solutionPath) {
      return { directory: current, solutionPath };
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return undefined;
    }
    current = parent;
  }
}

function firstExistingPath(candidates: Array<string | undefined>): string | undefined {
  for (const candidate of candidates) {
    if (!candidate || candidate.trim().length === 0) {
      continue;
    }

    const resolved = path.resolve(candidate);
    if (existsSync(resolved)) {
      return resolved;
    }
  }

  return undefined;
}

function toDirectory(candidate: string): string {
  try {
    return statSync(candidate).isDirectory() ? candidate : path.dirname(candidate);
  } catch {
    return candidate;
  }
}

function findSolutionFile(directory: string): string | undefined {
  if (!existsSync(directory)) {
    return undefined;
  }

  const entry = readdirSync(directory, { withFileTypes: true }).find((item) => {
    if (!item.isFile()) {
      return false;
    }

    const lower = item.name.toLowerCase();
    return lower.endsWith(".sln") || lower.endsWith(".slnx");
  });

  return entry ? path.join(directory, entry.name) : undefined;
}

function sourceForCandidate(candidate: string | undefined, options: ResolveOptions): string {
  if (options.workspaceArg && path.resolve(options.workspaceArg) === candidate) {
    return "argument";
  }

  for (const key of ENV_WORKSPACE_KEYS) {
    const value = options.env[key];
    if (value && path.resolve(value) === candidate) {
      return `env:${key}`;
    }
  }

  return "cwd";
}
