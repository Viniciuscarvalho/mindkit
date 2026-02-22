import { readFile, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { parse as parseYaml } from 'yaml';
import type { TemplateConfig, TemplateRegistry, ComponentType } from '../../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function findPackageRoot(startDir: string): string {
  let currentDir = startDir;

  while (currentDir !== dirname(currentDir)) {
    const pkgPath = join(currentDir, 'package.json');
    if (existsSync(pkgPath)) {
      return currentDir;
    }
    currentDir = dirname(currentDir);
  }

  return join(__dirname, '..');
}

/**
 * Get the path to built-in templates
 */
export function getBuiltinTemplatesDir(): string {
  // Find package root (where package.json is) then navigate to templates/
  const packageRoot = findPackageRoot(__dirname);
  return join(packageRoot, 'templates');
}

/**
 * Get the user's custom templates directory
 */
export function getUserTemplatesDir(): string {
  return join(homedir(), '.mindkit', 'templates');
}

/**
 * Get the user's registry file path
 */
export function getRegistryPath(): string {
  return join(homedir(), '.mindkit', 'registry.yaml');
}

/**
 * Check if a path exists
 */
async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

import { discoverTemplatesInDir } from './discovery.js';

/**
 * Load the default template registry by discovering templates dynamically.
 */
export function getDefaultRegistry(): TemplateRegistry {
  const builtinTemplatesDir = getBuiltinTemplatesDir();
  
  // Dynamically discover agents and commands
  const agentTemplates = discoverTemplatesInDir(join(builtinTemplatesDir, 'agents'), 'agents');
  const commandTemplates = discoverTemplatesInDir(join(builtinTemplatesDir, 'commands'), 'commands');

  // Keep doc templates hardcoded for now as their paths are more complex
  const docTemplates: TemplateConfig[] = [
    {
      name: 'prd-template',
      source: 'docs/specs/prd-template.md',
      type: 'templates',
      description: 'Product Requirements Document template',
      targets: {
        claude: { path: '{{DOCS}}/specs/prd-template.md' },
        cursor: { path: '.cursor/docs/specs/prd-template.md' },
        codex: { path: './docs/specs/prd-template.md' },
        gemini: { path: '{{DOCS}}/specs/prd-template.md' },
      },
    },
    {
      name: 'techspec-template',
      source: 'docs/specs/techspec-template.md',
      type: 'templates',
      description: 'Technical Specification template',
      targets: {
        claude: { path: '{{DOCS}}/specs/techspec-template.md' },
        cursor: { path: '.cursor/docs/specs/techspec-template.md' },
        codex: { path: './docs/specs/techspec-template.md' },
        gemini: { path: '{{DOCS}}/specs/techspec-template.md' },
      },
    },
    {
      name: 'task-template',
      source: 'docs/tasks/task-template.md',
      type: 'templates',
      description: 'Individual task template',
      targets: {
        claude: { path: '{{DOCS}}/tasks/task-template.md' },
        cursor: { path: '.cursor/docs/tasks/task-template.md' },
        codex: { path: './docs/tasks/task-template.md' },
        gemini: { path: '{{DOCS}}/tasks/task-template.md' },
      },
    },
  ];

  return {
    version: 1,
    templates: [...commandTemplates, ...agentTemplates, ...docTemplates],
  };
}

/**
 * Load user's custom registry if it exists
 */
export async function loadUserRegistry(): Promise<TemplateRegistry | null> {
  const registryPath = getRegistryPath();

  if (!(await pathExists(registryPath))) {
    return null;
  }

  try {
    const content = await readFile(registryPath, 'utf-8');
    return parseYaml(content) as TemplateRegistry;
  } catch {
    return null;
  }
}

/**
 * Get merged registry (builtin + user)
 */
export async function getMergedRegistry(): Promise<TemplateRegistry> {
  const builtin = getDefaultRegistry();
  const user = await loadUserRegistry();

  if (!user) {
    return builtin;
  }

  // Merge user templates, overriding builtin ones with same name
  const templateMap = new Map<string, TemplateConfig>();

  for (const template of builtin.templates) {
    templateMap.set(template.name, template);
  }

  for (const template of user.templates) {
    templateMap.set(template.name, template);
  }

  return {
    version: Math.max(builtin.version, user.version),
    templates: Array.from(templateMap.values()),
  };
}

/**
 * Load template content from source
 */
export async function loadTemplateContent(template: TemplateConfig): Promise<string> {
  // Try user templates first
  const userPath = join(getUserTemplatesDir(), template.source);
  if (await pathExists(userPath)) {
    return readFile(userPath, 'utf-8');
  }

  // Fall back to builtin templates
  const builtinPath = join(getBuiltinTemplatesDir(), template.source);
  if (await pathExists(builtinPath)) {
    return readFile(builtinPath, 'utf-8');
  }

  throw new Error(`Template not found: ${template.source}`);
}

/**
 * Get templates by type
 */
export async function getTemplatesByType(type: ComponentType): Promise<TemplateConfig[]> {
  const registry = await getMergedRegistry();
  return registry.templates.filter((t) => t.type === type);
}

/**
 * Get all available templates grouped by type
 */
export async function getAllTemplates(): Promise<Record<ComponentType, TemplateConfig[]>> {
  const registry = await getMergedRegistry();

  const grouped: Record<ComponentType, TemplateConfig[]> = {
    commands: [],
    agents: [],
    templates: [],
    skills: [],
  };

  for (const template of registry.templates) {
    grouped[template.type].push(template);
  }

  return grouped;
}
