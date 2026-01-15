import { homedir } from 'node:os';
import type { PathTransform, ToolType } from '../../types/index.js';

/**
 * Default path mappings for each tool
 */
const TOOL_PATH_MAPPINGS: Record<ToolType, Record<string, string>> = {
  claude: {
    DOCS: './docs',
    PROJECT: '.',
    HOME: homedir(),
    CONFIG: `${homedir()}/.claude`,
  },
  cursor: {
    DOCS: '.cursor/docs',
    PROJECT: '.',
    HOME: homedir(),
    CONFIG: `${homedir()}/.cursor`,
  },
  codex: {
    DOCS: './docs',
    PROJECT: '.',
    HOME: homedir(),
    CONFIG: `${homedir()}/.codex`,
  },
};

/**
 * Transform placeholders in content for a specific tool
 */
export function transformForTool(
  content: string,
  tool: ToolType,
  projectRoot?: string
): string {
  const mappings = { ...TOOL_PATH_MAPPINGS[tool] };

  if (projectRoot) {
    mappings.PROJECT = projectRoot;
  }

  let result = content;

  // Replace all placeholders
  for (const [key, value] of Object.entries(mappings)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }

  return result;
}

/**
 * Apply custom transforms to content
 */
export function applyTransforms(content: string, transforms: PathTransform[]): string {
  let result = content;

  for (const transform of transforms) {
    if (transform.type === 'path') {
      result = result.replaceAll(transform.from, transform.to);
    } else if (transform.type === 'variable') {
      result = result.replaceAll(`{{${transform.from}}}`, transform.to);
    }
  }

  return result;
}

/**
 * Convert relative paths in content to work with a specific tool
 */
export function normalizePathsForTool(
  content: string,
  tool: ToolType,
  projectRoot?: string
): string {
  // First, convert tool-agnostic placeholders to tool-specific values
  let result = transformForTool(content, tool, projectRoot);

  // Tool-specific path adjustments
  if (tool === 'cursor') {
    // Cursor uses .cursor/ prefix for project-level files
    result = result.replaceAll('./docs/', '.cursor/docs/');
  }

  return result;
}

/**
 * Extract placeholders from content
 */
export function extractPlaceholders(content: string): string[] {
  const regex = /\{\{([A-Z_]+)\}\}/g;
  const placeholders: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (!placeholders.includes(match[1])) {
      placeholders.push(match[1]);
    }
  }

  return placeholders;
}

/**
 * Validate that all placeholders in content can be resolved
 */
export function validatePlaceholders(content: string, tool: ToolType): string[] {
  const placeholders = extractPlaceholders(content);
  const mappings = TOOL_PATH_MAPPINGS[tool];
  const unresolved: string[] = [];

  for (const placeholder of placeholders) {
    if (!(placeholder in mappings)) {
      unresolved.push(placeholder);
    }
  }

  return unresolved;
}

/**
 * Make content tool-agnostic by replacing specific paths with placeholders
 */
export function makeAgnostic(content: string, tool: ToolType): string {
  const mappings = TOOL_PATH_MAPPINGS[tool];
  let result = content;

  // Sort by value length descending to replace longer paths first
  const sortedEntries = Object.entries(mappings).sort(
    ([, a], [, b]) => b.length - a.length
  );

  for (const [key, value] of sortedEntries) {
    if (value !== '.' && value !== homedir()) {
      result = result.replaceAll(value, `{{${key}}}`);
    }
  }

  return result;
}
