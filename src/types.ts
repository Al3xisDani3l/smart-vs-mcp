export type PathFormat = "Windows" | "Posix";

export type VsMcpSettings = {
  port: number;
  host: string;
  scheme: "http" | "https";
  sdkPath: string;
  defaultPathFormat: PathFormat;
  autoStart: boolean;
};

export type LoadedSettings = {
  settings: VsMcpSettings;
  sourcePath: string;
  endpoint: string;
};

export type WorkspaceResolution = {
  workspace: string;
  startPath: string;
  source: string;
  solutionPath?: string;
};

export type ResolveOptions = {
  workspaceArg?: string;
  env: NodeJS.ProcessEnv;
  cwd: string;
};

export type HealthResult = {
  online: boolean;
  status?: number;
  error?: string;
};

export type StatusResult = {
  workspace: WorkspaceResolution;
  settings?: LoadedSettings;
  health?: HealthResult;
  error?: string;
};
