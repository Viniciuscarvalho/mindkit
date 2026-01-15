import { Command } from 'commander';
import { watch } from 'chokidar';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { detectInstalledTools, getAdapter, getAllAdapters } from '../../core/adapters/index.js';
import { getAllTemplates, loadTemplateContent } from '../../core/templates/index.js';
import { selectSyncSource, selectSyncTargets, confirmAction } from '../ui/prompts.js';
import {
  createSpinner,
  printHeader,
  printSuccess,
  printError,
  printWarning,
  printInfo,
  theme,
} from '../ui/spinner.js';
import type { ToolType, TemplateConfig } from '../../types/index.js';

interface SyncCommandOptions {
  source?: string;
  target?: string;
  watch?: boolean;
}

export function createSyncCommand(): Command {
  return new Command('sync')
    .description('Sync configurations between tools')
    .option('-s, --source <tool>', 'Source tool (claude, cursor, codex)')
    .option('-t, --target <tools>', 'Comma-separated target tools')
    .option('-w, --watch', 'Watch for changes and sync automatically')
    .action(async (options: SyncCommandOptions) => {
      await runSync(options);
    });
}

async function runSync(options: SyncCommandOptions): Promise<void> {
  printHeader('mindkit sync');

  // Detect installed tools
  const spinner = createSpinner('Detecting installed tools...');
  spinner.start();

  const installedTools = await detectInstalledTools();
  spinner.stop();

  const availableTools = Array.from(installedTools.entries())
    .filter(([, installed]) => installed)
    .map(([tool]) => tool);

  if (availableTools.length < 2) {
    printWarning('At least 2 tools must be installed to sync.');
    return;
  }

  // Select source
  let source: ToolType;
  if (options.source) {
    source = options.source as ToolType;
  } else {
    source = await selectSyncSource(availableTools);
  }

  // Select targets
  let targets: ToolType[];
  if (options.target) {
    targets = options.target.split(',').map((t) => t.trim() as ToolType);
  } else {
    targets = await selectSyncTargets(availableTools, source);
  }

  if (targets.length === 0) {
    printWarning('No targets selected. Exiting.');
    return;
  }

  printInfo(`Syncing from ${source} to ${targets.join(', ')}`);

  if (options.watch) {
    await runWatchSync(source, targets);
  } else {
    await runOneTimeSync(source, targets);
  }
}

async function runOneTimeSync(source: ToolType, targets: ToolType[]): Promise<void> {
  const syncSpinner = createSpinner('Syncing configurations...');
  syncSpinner.start();

  try {
    const sourceAdapter = getAdapter(source);
    const templates = await getAllTemplates();
    const allTemplates = Object.values(templates).flat();

    let synced = 0;
    let failed = 0;

    for (const template of allTemplates) {
      // Check if source has this template
      if (!template.targets[source]) {
        continue;
      }

      try {
        const content = await loadTemplateContent(template);

        for (const target of targets) {
          if (!template.targets[target]) {
            continue;
          }

          const targetAdapter = getAdapter(target);
          const result = await targetAdapter.install(template, content);

          if (result.success) {
            synced++;
          } else {
            failed++;
          }
        }
      } catch {
        failed++;
      }
    }

    syncSpinner.succeed(`Synced ${synced} configurations, ${failed} failed`);
  } catch (error) {
    syncSpinner.fail('Sync failed');
    printError(error instanceof Error ? error.message : 'Unknown error');
  }
}

async function runWatchSync(source: ToolType, targets: ToolType[]): Promise<void> {
  const sourceAdapter = getAdapter(source);
  const watchPaths = getWatchPaths(source);

  printInfo(`Watching ${source} for changes...`);
  printInfo('Press Ctrl+C to stop');
  console.log();

  const watcher = watch(watchPaths, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100,
    },
  });

  watcher.on('change', async (path) => {
    console.log(theme.secondary(`[${new Date().toLocaleTimeString()}]`), `Changed: ${path}`);

    // Find matching template
    const templates = await getAllTemplates();
    const allTemplates = Object.values(templates).flat();

    for (const template of allTemplates) {
      const sourceTarget = template.targets[source];
      if (!sourceTarget) continue;

      // Check if this path matches the template
      const expandedPath = sourceTarget.path.replace('~', homedir());
      if (path.includes(template.name) || path === expandedPath) {
        try {
          const content = await loadTemplateContent(template);

          for (const target of targets) {
            if (!template.targets[target]) continue;

            const targetAdapter = getAdapter(target);
            const result = await targetAdapter.install(template, content);

            if (result.success) {
              printSuccess(`Synced ${template.name} to ${target}`);
            } else {
              printError(`Failed to sync ${template.name} to ${target}: ${result.error}`);
            }
          }
        } catch (error) {
          printError(`Error syncing: ${error instanceof Error ? error.message : 'Unknown'}`);
        }
        break;
      }
    }
  });

  watcher.on('error', (error) => {
    printError(`Watch error: ${error.message}`);
  });

  // Keep process alive
  process.on('SIGINT', () => {
    printInfo('\nStopping watch...');
    watcher.close();
    process.exit(0);
  });

  // Prevent Node from exiting
  await new Promise(() => {});
}

function getWatchPaths(tool: ToolType): string[] {
  const home = homedir();

  switch (tool) {
    case 'claude':
      return [
        join(home, '.claude', 'commands'),
        join(home, '.claude', 'agents'),
        join(home, '.claude', 'skills'),
        join(home, '.claude', 'docs'),
      ];
    case 'cursor':
      return [join(home, '.cursor', 'rules')];
    case 'codex':
      return [join(home, '.codex')];
  }
}
