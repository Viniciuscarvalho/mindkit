// mindkit - AI Development Setup Manager
// Exports for programmatic usage

export type {
  ToolType,
  ComponentType,
  ToolDetection,
  TemplateConfig,
  TargetConfig,
  PathTransform,
  TemplateRegistry,
  InstallOptions,
  InstallResult,
  BackupMeta,
  SyncConfig,
  SyncEvent,
  MindkitConfig,
  ToolAdapter,
} from './types/index.js';

export { PATH_PLACEHOLDERS, DEFAULT_PATHS } from './types/index.js';

// Adapters
export {
  BaseAdapter,
  ClaudeAdapter,
  CursorAdapter,
  CodexAdapter,
  getAdapter,
  getAllAdapters,
  detectInstalledTools,
} from './core/adapters/index.js';

// Templates
export {
  getBuiltinTemplatesDir,
  getUserTemplatesDir,
  getRegistryPath,
  getDefaultRegistry,
  loadUserRegistry,
  getMergedRegistry,
  loadTemplateContent,
  getTemplatesByType,
  getAllTemplates,
  transformForTool,
  applyTransforms,
  normalizePathsForTool,
  extractPlaceholders,
  validatePlaceholders,
  makeAgnostic,
} from './core/templates/index.js';

// Backup
export {
  getBackupsDir,
  generateBackupName,
  createBackup,
  listBackups,
  restoreBackup,
  deleteBackup,
  getFilesToBackup,
} from './core/backup/manager.js';
