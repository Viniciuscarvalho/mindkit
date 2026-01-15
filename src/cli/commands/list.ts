import { Command } from 'commander';
import { getAllAdapters, detectInstalledTools } from '../../core/adapters/index.js';
import { getAllTemplates } from '../../core/templates/index.js';
import {
  printHeader,
  printSuccess,
  printInfo,
  printWarning,
  printListItem,
  printKeyValue,
  theme,
} from '../ui/spinner.js';
import type { ComponentType, ToolType } from '../../types/index.js';

export function createListCommand(): Command {
  const list = new Command('list')
    .description('List available and installed components')
    .argument('[type]', 'Component type (commands, agents, templates, skills, tools)')
    .option('--installed', 'Show only installed components')
    .action(async (type?: string, options?: { installed?: boolean }) => {
      await runList(type as ComponentType | 'tools' | undefined, options?.installed);
    });

  return list;
}

async function runList(
  type?: ComponentType | 'tools',
  installedOnly?: boolean
): Promise<void> {
  if (type === 'tools') {
    await listTools();
    return;
  }

  if (type) {
    await listByType(type as ComponentType, installedOnly);
    return;
  }

  // List everything
  await listAllComponents(installedOnly);
}

async function listTools(): Promise<void> {
  printHeader('Detected Tools');

  const installed = await detectInstalledTools();
  const adapters = getAllAdapters();

  for (const adapter of adapters) {
    const detection = await adapter.detect();
    const status = detection.installed
      ? theme.success('✓ installed')
      : theme.dim('not detected');

    console.log(`  ${theme.bold(adapter.name)} ${status}`);
    if (detection.configPath) {
      printKeyValue('    Config', detection.configPath);
    }
  }

  console.log();
}

async function listByType(
  type: ComponentType,
  installedOnly?: boolean
): Promise<void> {
  printHeader(`${type.charAt(0).toUpperCase() + type.slice(1)}`);

  const allTemplates = await getAllTemplates();
  const templates = allTemplates[type];

  if (templates.length === 0) {
    printInfo(`No ${type} available.`);
    return;
  }

  if (installedOnly) {
    // Show installed per tool
    const adapters = getAllAdapters();

    for (const adapter of adapters) {
      const installed = await adapter.listInstalled(type);
      if (installed.length > 0) {
        console.log();
        console.log(theme.secondary(adapter.name));
        for (const item of installed) {
          printListItem(item, 1);
        }
      }
    }
  } else {
    // Show available templates
    for (const template of templates) {
      console.log();
      console.log(theme.primary.bold(template.name));
      if (template.description) {
        console.log(`  ${theme.dim(template.description)}`);
      }

      const tools = Object.keys(template.targets) as ToolType[];
      printKeyValue('  Targets', tools.join(', '));
    }
  }

  console.log();
}

async function listAllComponents(installedOnly?: boolean): Promise<void> {
  const componentTypes: ComponentType[] = ['commands', 'agents', 'templates', 'skills'];

  for (const type of componentTypes) {
    await listByType(type, installedOnly);
  }
}
