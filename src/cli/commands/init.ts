import { Command } from 'commander';
import { writeFile, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { stringify as stringifyYaml } from 'yaml';
import { detectInstalledTools } from '../../core/adapters/index.js';
import { selectTools, confirmAction } from '../ui/prompts.js';
import {
  createSpinner,
  printHeader,
  printSuccess,
  printError,
  printWarning,
  printInfo,
  printKeyValue,
} from '../ui/spinner.js';
import type { ToolType, MindkitConfig } from '../../types/index.js';

interface InitCommandOptions {
  force?: boolean;
}

export function createInitCommand(): Command {
  return new Command('init')
    .description('Initialize mindkit in the current project')
    .option('-f, --force', 'Overwrite existing configuration')
    .action(async (options: InitCommandOptions) => {
      await runInit(options);
    });
}

async function runInit(options: InitCommandOptions): Promise<void> {
  printHeader('mindkit init');

  const cwd = process.cwd();
  const configDir = join(cwd, '.mindkit');
  const configPath = join(configDir, 'config.yaml');

  // Check if already initialized
  try {
    await access(configPath);
    if (!options.force) {
      const overwrite = await confirmAction(
        'mindkit is already initialized in this project. Overwrite?'
      );
      if (!overwrite) {
        printInfo('Init cancelled.');
        return;
      }
    }
  } catch {
    // Config doesn't exist, proceed
  }

  // Detect tools
  const spinner = createSpinner('Detecting installed tools...');
  spinner.start();

  const installedTools = await detectInstalledTools();
  spinner.stop();

  // Show detected tools
  const detected: ToolType[] = [];
  for (const [tool, isInstalled] of installedTools) {
    if (isInstalled) {
      detected.push(tool);
      printSuccess(`Detected: ${tool}`);
    }
  }

  if (detected.length === 0) {
    printWarning('No AI tools detected. Please install Claude, Cursor, or Codex first.');
    return;
  }

  // Select tools to use
  console.log();
  const selectedTools = await selectTools(installedTools);

  if (selectedTools.length === 0) {
    printWarning('No tools selected. Exiting.');
    return;
  }

  // Create configuration
  const config: MindkitConfig = {
    version: 1,
    tools: selectedTools,
  };

  // Write configuration
  const writeSpinner = createSpinner('Creating configuration...');
  writeSpinner.start();

  try {
    await mkdir(configDir, { recursive: true });
    await writeFile(configPath, stringifyYaml(config), 'utf-8');

    // Create .gitignore in .mindkit
    await writeFile(
      join(configDir, '.gitignore'),
      '# Ignore backups and cache\nbackups/\ncache/\n',
      'utf-8'
    );

    writeSpinner.succeed('Configuration created');
  } catch (error) {
    writeSpinner.fail('Failed to create configuration');
    printError(error instanceof Error ? error.message : 'Unknown error');
    return;
  }

  // Print summary
  console.log();
  printHeader('Project Initialized');
  printKeyValue('Config', configPath);
  printKeyValue('Tools', selectedTools.join(', '));
  console.log();
  printInfo('Next steps:');
  printInfo('  mindkit install   - Install AI configs');
  printInfo('  mindkit list      - List available components');
  console.log();
}
