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
} from './loader.js';

export {
  transformForTool,
  applyTransforms,
  normalizePathsForTool,
  extractPlaceholders,
  validatePlaceholders,
  makeAgnostic,
} from './transformer.js';
