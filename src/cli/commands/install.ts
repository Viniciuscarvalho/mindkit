import { Command } from 'commander';
import { detectInstalledTools, getAdapter } from '../../core/adapters/index.js';
import { getAllTemplates, loadTemplateContent } from '../../core/templates/index.js';
import { createBackup, getFilesToBackup } from '../../core/backup/manager.js';
import { selectTools, selectComponents, selectTemplates, confirmAction } from '../ui/prompts.js';
import {
  createSpinner,
  printHeader,
  printSuccess,
  printError,
  printWarning,
  printInfo,
  printInstallSummary,
} from '../ui/spinner.js';
import type { ToolType, ComponentType, InstallResult } from '../../types/index.js';

interface InstallCommandOptions {
  tools?: string;
  components?: string;
  dryRun?: boolean;
  force?: boolean;
  noBackup?: boolean;
}

export function createInstallCommand(): Command {
  return new Command('install')
    .description('Install AI configs to selected tools')
    .option('-t, --tools <tools>', 'Comma-separated list of tools (claude,cursor,codex)')
    .option('-c, --components <components>', 'Comma-separated list of components (commands,agents,templates,skills)')
    .option('--dry-run', 'Show what would be installed without making changes')
    .option('-f, --force', 'Overwrite existing files without prompting')
    .option('--no-backup', 'Skip automatic backup')
    .action(async (options: InstallCommandOptions) => {
      await runInstall(options);
    });
}

async function runInstall(options: InstallCommandOptions): Promise<void> {
  printHeader('mindkit install');

  // Detect installed tools
  const spinner = createSpinner('Detecting installed tools...');
  spinner.start();

  const installedTools = await detectInstalledTools();
  spinner.stop();

  // Select tools
  let selectedTools: ToolType[];

  if (options.tools) {
    selectedTools = options.tools.split(',').map((t) => t.trim() as ToolType);
  } else {
    selectedTools = await selectTools(installedTools);
  }

  if (selectedTools.length === 0) {
    printWarning('No tools selected. Exiting.');
    return;
  }

  printInfo(`Selected tools: ${selectedTools.join(', ')}`);

  // Select components
  let selectedComponents: ComponentType[];

  if (options.components) {
    selectedComponents = options.components.split(',').map((c) => c.trim() as ComponentType);
  } else {
    selectedComponents = await selectComponents();
  }

  if (selectedComponents.length === 0) {
    printWarning('No components selected. Exiting.');
    return;
  }

  printInfo(`Selected components: ${selectedComponents.join(', ')}`);

  // Get templates
  const allTemplates = await getAllTemplates();
  const templatesToInstall = selectedComponents.flatMap((type) => allTemplates[type]);

  if (templatesToInstall.length === 0) {
    printWarning('No templates found for selected components.');
    return;
  }

  // Let user select specific templates
  const selectedTemplates = await selectTemplates(templatesToInstall);

  if (selectedTemplates.length === 0) {
    printWarning('No templates selected. Exiting.');
    return;
  }

  // Dry run mode
  if (options.dryRun) {
    printHeader('Dry Run - Would install:');
    for (const template of selectedTemplates) {
      for (const tool of selectedTools) {
        const target = template.targets[tool];
        if (target) {
          console.log(`  ${template.name} → ${tool}: ${target.path}`);
        }
      }
    }
    return;
  }

  // Backup before installation
  if (!options.noBackup) {
    const backupSpinner = createSpinner('Creating backup...');
    backupSpinner.start();

    try {
      const filesToBackup = getFilesToBackup(selectedTools);
      const { backupPath, meta } = await createBackup(filesToBackup, selectedTools);

      if (meta.files.length > 0) {
        backupSpinner.succeed(`Backup created: ${backupPath}`);
      } else {
        backupSpinner.info('No existing files to backup');
      }
    } catch (error) {
      backupSpinner.warn('Backup failed, continuing without backup');
    }
  }

  // Install templates
  const results: InstallResult[] = [];
  const installSpinner = createSpinner('Installing templates...');
  installSpinner.start();

  for (const template of selectedTemplates) {
    for (const tool of selectedTools) {
      if (!template.targets[tool]) {
        continue;
      }

      try {
        const content = await loadTemplateContent(template);
        const adapter = getAdapter(tool);
        const result = await adapter.install(template, content);
        results.push(result);

        if (result.success) {
          installSpinner.text = `Installed ${template.name} to ${tool}`;
        }
      } catch (error) {
        results.push({
          template,
          tool,
          success: false,
          targetPath: template.targets[tool]?.path || '',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  installSpinner.stop();

  // Print results
  const summary = selectedTools.map((tool) => {
    const toolResults = results.filter((r) => r.tool === tool);
    return {
      tool: tool.charAt(0).toUpperCase() + tool.slice(1),
      success: toolResults.filter((r) => r.success).length,
      failed: toolResults.filter((r) => !r.success).length,
    };
  });

  printInstallSummary(summary);

  // Print any errors
  const errors = results.filter((r) => !r.success);
  if (errors.length > 0) {
    printHeader('Errors');
    for (const error of errors) {
      printError(`${error.template.name} (${error.tool}): ${error.error}`);
    }
  }

  // Print success details
  const successes = results.filter((r) => r.success);
  if (successes.length > 0) {
    printHeader('Installed Files');
    for (const result of successes) {
      printSuccess(`${result.template.name} → ${result.targetPath}`);
    }
  }
}
