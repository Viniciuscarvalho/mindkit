import { checkbox, confirm, select } from '@inquirer/prompts';
import type { ToolType, ComponentType, TemplateConfig } from '../../types/index.js';

export interface ToolChoice {
  name: string;
  value: ToolType;
  disabled?: string;
}

export interface ComponentChoice {
  name: string;
  value: ComponentType;
  description?: string;
}

/**
 * Prompt user to select target tools
 */
export async function selectTools(
  available: Map<ToolType, boolean>
): Promise<ToolType[]> {
  const choices: ToolChoice[] = [
    {
      name: 'Claude Code',
      value: 'claude',
      disabled: available.get('claude') ? undefined : '(not detected)',
    },
    {
      name: 'Cursor',
      value: 'cursor',
      disabled: available.get('cursor') ? undefined : '(not detected)',
    },
    {
      name: 'Codex',
      value: 'codex',
      disabled: available.get('codex') ? undefined : '(not detected)',
    },
  ];

  const selected = await checkbox({
    message: 'Select target tools:',
    choices: choices.map((c) => ({
      name: c.name,
      value: c.value,
      disabled: c.disabled,
    })),
  });

  return selected;
}

/**
 * Prompt user to select component types
 */
export async function selectComponents(): Promise<ComponentType[]> {
  const choices: ComponentChoice[] = [
    {
      name: 'Commands (create-prd, generate-spec, generate-tasks)',
      value: 'commands',
      description: 'Workflow automation commands',
    },
    {
      name: 'Agents (swift-expert, backend-developer, ui-designer)',
      value: 'agents',
      description: 'AI persona definitions',
    },
    {
      name: 'Templates (prd, techspec, task)',
      value: 'templates',
      description: 'Document templates',
    },
    {
      name: 'Skills',
      value: 'skills',
      description: 'Reusable skill modules',
    },
  ];

  const selected = await checkbox({
    message: 'Select components to install:',
    choices: choices.map((c) => ({
      name: c.name,
      value: c.value,
    })),
  });

  return selected;
}

/**
 * Prompt user to select specific templates
 */
export async function selectTemplates(
  templates: TemplateConfig[]
): Promise<TemplateConfig[]> {
  if (templates.length === 0) {
    return [];
  }

  const choices = templates.map((t) => ({
    name: `${t.name}${t.description ? ` - ${t.description}` : ''}`,
    value: t,
    checked: true,
  }));

  const selected = await checkbox({
    message: 'Select templates to install:',
    choices,
  });

  return selected;
}

/**
 * Prompt for confirmation
 */
export async function confirmAction(message: string): Promise<boolean> {
  return confirm({
    message,
    default: true,
  });
}

/**
 * Prompt to select a backup
 */
export async function selectBackup(
  backups: Array<{ name: string; timestamp: string; files: number }>
): Promise<string | null> {
  if (backups.length === 0) {
    return null;
  }

  const choices = backups.map((b) => ({
    name: `${b.name} (${b.files} files, ${new Date(b.timestamp).toLocaleString()})`,
    value: b.name,
  }));

  const selected = await select({
    message: 'Select a backup to restore:',
    choices,
  });

  return selected;
}

/**
 * Prompt to select sync source
 */
export async function selectSyncSource(
  available: ToolType[]
): Promise<ToolType> {
  const choices = available.map((tool) => ({
    name: tool.charAt(0).toUpperCase() + tool.slice(1),
    value: tool,
  }));

  const selected = await select({
    message: 'Select sync source:',
    choices,
  });

  return selected;
}

/**
 * Prompt to select sync targets
 */
export async function selectSyncTargets(
  available: ToolType[],
  exclude: ToolType
): Promise<ToolType[]> {
  const choices = available
    .filter((t) => t !== exclude)
    .map((tool) => ({
      name: tool.charAt(0).toUpperCase() + tool.slice(1),
      value: tool,
    }));

  const selected = await checkbox({
    message: 'Select sync targets:',
    choices,
  });

  return selected;
}
