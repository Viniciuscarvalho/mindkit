/**
 * Supported AI development tools
 */
export type ToolType = 'claude' | 'cursor' | 'codex';

/**
 * Component types that can be installed
 */
export type ComponentType = 'commands' | 'agents' | 'templates' | 'skills';

/**
 * Tool detection result
 */
export interface ToolDetection {
  tool: ToolType;
  installed: boolean;
  configPath: string | null;
  version?: string;
}

/**
 * Template configuration
 */
export interface TemplateConfig {
  name: string;
  source: string;
  type: ComponentType;
  description?: string;
  targets: Partial<Record<ToolType, TargetConfig>>;
  transforms?: PathTransform[];
}

/**
 * Target configuration for a specific tool
 */
export interface TargetConfig {
  path: string;
  /** For tools that merge content into a single file (like Codex AGENTS.md) */
  merge?: boolean;
  /** Section header when merging */
  sectionHeader?: string;
}

/**
 * Path transformation rule
 */
export interface PathTransform {
  type: 'path' | 'variable';
  from: string;
  to: string;
}

/**
 * Registry of all available templates
 */
export interface TemplateRegistry {
  version: number;
  templates: TemplateConfig[];
}

/**
 * Installation options
 */
export interface InstallOptions {
  tools: ToolType[];
  components: ComponentType[];
  dryRun?: boolean;
  force?: boolean;
  backup?: boolean;
}

/**
 * Installation result for a single component
 */
export interface InstallResult {
  template: TemplateConfig;
  tool: ToolType;
  success: boolean;
  targetPath: string;
  error?: string;
  backedUp?: boolean;
}

/**
 * Backup metadata
 */
export interface BackupMeta {
  timestamp: string;
  tools: ToolType[];
  files: string[];
}

/**
 * Sync configuration
 */
export interface SyncConfig {
  source: ToolType;
  targets: ToolType[];
  watch?: boolean;
  interval?: number;
}

/**
 * Sync event
 */
export interface SyncEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
  source: ToolType;
}

/**
 * Project mindkit configuration (.mindkit/config.yaml)
 */
export interface MindkitConfig {
  version: number;
  tools: ToolType[];
  sync?: SyncConfig;
  customTemplates?: string[];
}

/**
 * Adapter interface that all tool adapters must implement
 */
export interface ToolAdapter {
  readonly tool: ToolType;
  readonly name: string;
  readonly description: string;

  /** Detect if the tool is installed */
  detect(): Promise<ToolDetection>;

  /** Get the global config directory for this tool */
  getGlobalConfigDir(): string;

  /** Get the project config path for this tool */
  getProjectConfigPath(projectRoot: string): string;

  /** Install a template to this tool */
  install(template: TemplateConfig, content: string, projectRoot?: string): Promise<InstallResult>;

  /** Read existing config from this tool */
  readConfig(path: string): Promise<string | null>;

  /** List installed components */
  listInstalled(type: ComponentType): Promise<string[]>;

  /** Transform content for this tool's format */
  transformContent(content: string, transforms: PathTransform[]): string;
}

/**
 * Path placeholders used in templates
 */
export const PATH_PLACEHOLDERS = {
  DOCS: '{{DOCS}}',
  PROJECT: '{{PROJECT}}',
  HOME: '{{HOME}}',
  CONFIG: '{{CONFIG}}',
} as const;

/**
 * Default paths for each tool
 */
export const DEFAULT_PATHS: Record<ToolType, { global: string; project: string }> = {
  claude: {
    global: '~/.claude',
    project: 'CLAUDE.md',
  },
  cursor: {
    global: '~/.cursor',
    project: '.cursor/rules',
  },
  codex: {
    global: '~/.codex',
    project: 'AGENTS.md',
  },
};
