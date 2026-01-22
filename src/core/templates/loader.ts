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

/**
 * Load the default template registry
 */
export function getDefaultRegistry(): TemplateRegistry {
  return {
    version: 1,
    templates: [
      // Commands
      {
        name: 'create-prd',
        source: 'commands/create-prd.md',
        type: 'commands',
        description: 'Generate Product Requirements Documents',
        targets: {
          claude: { path: '~/.claude/commands/create-prd.md' },
          cursor: { path: '.cursor/rules/create-prd.mdc' },
          codex: { path: '~/.codex/AGENTS.md', merge: true, sectionHeader: 'PRD Creation' },
        },
        transforms: [
          { type: 'path', from: './docs/', to: '{{DOCS}}/' },
        ],
      },
      {
        name: 'generate-spec',
        source: 'commands/generate-spec.md',
        type: 'commands',
        description: 'Create technical specifications from PRDs',
        targets: {
          claude: { path: '~/.claude/commands/generate-spec.md' },
          cursor: { path: '.cursor/rules/generate-spec.mdc' },
          codex: { path: '~/.codex/AGENTS.md', merge: true, sectionHeader: 'Tech Spec Generation' },
        },
        transforms: [
          { type: 'path', from: './docs/', to: '{{DOCS}}/' },
        ],
      },
      {
        name: 'generate-tasks',
        source: 'commands/generate-tasks.md',
        type: 'commands',
        description: 'Break down specs into implementable tasks',
        targets: {
          claude: { path: '~/.claude/commands/generate-tasks.md' },
          cursor: { path: '.cursor/rules/generate-tasks.mdc' },
          codex: { path: '~/.codex/AGENTS.md', merge: true, sectionHeader: 'Task Generation' },
        },
        transforms: [
          { type: 'path', from: './docs/', to: '{{DOCS}}/' },
        ],
      },
      // Agents
      {
        name: 'swift-expert',
        source: 'agents/swift-expert.md',
        type: 'agents',
        description: 'Senior Swift developer agent',
        targets: {
          claude: { path: '~/.claude/agents/swift-expert.md' },
          cursor: { path: '.cursor/rules/swift-expert.mdc' },
          codex: { path: '~/.codex/AGENTS.md', merge: true, sectionHeader: 'Swift Expert' },
        },
      },
      {
        name: 'backend-developer',
        source: 'agents/backend-developer.md',
        type: 'agents',
        description: 'Backend engineer agent',
        targets: {
          claude: { path: '~/.claude/agents/backend-developer.md' },
          cursor: { path: '.cursor/rules/backend-developer.mdc' },
          codex: { path: '~/.codex/AGENTS.md', merge: true, sectionHeader: 'Backend Developer' },
        },
      },
      {
        name: 'ui-designer',
        source: 'agents/ui-designer.md',
        type: 'agents',
        description: 'UI/UX designer agent',
        targets: {
          claude: { path: '~/.claude/agents/ui-designer.md' },
          cursor: { path: '.cursor/rules/ui-designer.mdc' },
          codex: { path: '~/.codex/AGENTS.md', merge: true, sectionHeader: 'UI Designer' },
        },
      },
      {
        name: 'typescript-pro',
        source: 'agents/typescript-pro.md',
        type: 'agents',
        description: 'TypeScript expert agent',
        targets: {
          claude: { path: '~/.claude/agents/typescript-pro.md' },
          cursor: { path: '.cursor/rules/typescript-pro.mdc' },
          codex: { path: '~/.codex/AGENTS.md', merge: true, sectionHeader: 'TypeScript Pro' },
        },
      },
      // Templates
      {
        name: 'prd-template',
        source: 'docs/specs/prd-template.md',
        type: 'templates',
        description: 'Product Requirements Document template',
        targets: {
          claude: { path: '{{DOCS}}/specs/prd-template.md' },
          cursor: { path: '.cursor/docs/specs/prd-template.md' },
          codex: { path: './docs/specs/prd-template.md' },
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
        },
      },
    ],
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
