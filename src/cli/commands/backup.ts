import { Command } from 'commander';
import { detectInstalledTools } from '../../core/adapters/index.js';
import {
  createBackup,
  listBackups,
  restoreBackup,
  deleteBackup,
  getFilesToBackup,
} from '../../core/backup/manager.js';
import { selectTools, selectBackup, confirmAction } from '../ui/prompts.js';
import {
  createSpinner,
  printHeader,
  printSuccess,
  printError,
  printWarning,
  printInfo,
  printListItem,
  printKeyValue,
} from '../ui/spinner.js';
import type { ToolType } from '../../types/index.js';

export function createBackupCommand(): Command {
  const backup = new Command('backup')
    .description('Manage configuration backups');

  backup
    .command('create')
    .description('Create a new backup')
    .option('-t, --tools <tools>', 'Comma-separated list of tools to backup')
    .action(async (options: { tools?: string }) => {
      await runCreateBackup(options);
    });

  backup
    .command('list')
    .description('List all backups')
    .action(async () => {
      await runListBackups();
    });

  backup
    .command('restore [name]')
    .description('Restore a backup')
    .action(async (name?: string) => {
      await runRestoreBackup(name);
    });

  backup
    .command('delete [name]')
    .description('Delete a backup')
    .action(async (name?: string) => {
      await runDeleteBackup(name);
    });

  return backup;
}

async function runCreateBackup(options: { tools?: string }): Promise<void> {
  printHeader('Create Backup');

  // Select tools to backup
  let selectedTools: ToolType[];

  if (options.tools) {
    selectedTools = options.tools.split(',').map((t) => t.trim() as ToolType);
  } else {
    const installedTools = await detectInstalledTools();
    selectedTools = await selectTools(installedTools);
  }

  if (selectedTools.length === 0) {
    printWarning('No tools selected. Exiting.');
    return;
  }

  const spinner = createSpinner('Creating backup...');
  spinner.start();

  try {
    const filesToBackup = getFilesToBackup(selectedTools);
    const { backupPath, meta } = await createBackup(filesToBackup, selectedTools);

    spinner.succeed('Backup created successfully');
    console.log();
    printKeyValue('Location', backupPath);
    printKeyValue('Files', meta.files.length.toString());
    printKeyValue('Tools', meta.tools.join(', '));
  } catch (error) {
    spinner.fail('Backup failed');
    printError(error instanceof Error ? error.message : 'Unknown error');
  }
}

async function runListBackups(): Promise<void> {
  printHeader('Available Backups');

  const spinner = createSpinner('Loading backups...');
  spinner.start();

  const backups = await listBackups();
  spinner.stop();

  if (backups.length === 0) {
    printInfo('No backups found.');
    return;
  }

  for (const backup of backups) {
    console.log();
    printSuccess(backup.name);
    printKeyValue('  Date', new Date(backup.meta.timestamp).toLocaleString());
    printKeyValue('  Tools', backup.meta.tools.join(', '));
    printKeyValue('  Files', backup.meta.files.length.toString());
  }

  console.log();
}

async function runRestoreBackup(name?: string): Promise<void> {
  printHeader('Restore Backup');

  const backups = await listBackups();

  if (backups.length === 0) {
    printWarning('No backups available.');
    return;
  }

  let selectedBackup: string;

  if (name) {
    const exists = backups.some((b) => b.name === name);
    if (!exists) {
      printError(`Backup "${name}" not found.`);
      return;
    }
    selectedBackup = name;
  } else {
    const selection = await selectBackup(
      backups.map((b) => ({
        name: b.name,
        timestamp: b.meta.timestamp,
        files: b.meta.files.length,
      }))
    );

    if (!selection) {
      printWarning('No backup selected. Exiting.');
      return;
    }
    selectedBackup = selection;
  }

  const confirmed = await confirmAction(
    `Restore backup "${selectedBackup}"? This will overwrite existing files.`
  );

  if (!confirmed) {
    printInfo('Restore cancelled.');
    return;
  }

  const spinner = createSpinner('Restoring backup...');
  spinner.start();

  try {
    const restoredFiles = await restoreBackup(selectedBackup);
    spinner.succeed(`Restored ${restoredFiles.length} files`);

    console.log();
    for (const file of restoredFiles) {
      printListItem(file);
    }
  } catch (error) {
    spinner.fail('Restore failed');
    printError(error instanceof Error ? error.message : 'Unknown error');
  }
}

async function runDeleteBackup(name?: string): Promise<void> {
  printHeader('Delete Backup');

  const backups = await listBackups();

  if (backups.length === 0) {
    printWarning('No backups available.');
    return;
  }

  let selectedBackup: string;

  if (name) {
    const exists = backups.some((b) => b.name === name);
    if (!exists) {
      printError(`Backup "${name}" not found.`);
      return;
    }
    selectedBackup = name;
  } else {
    const selection = await selectBackup(
      backups.map((b) => ({
        name: b.name,
        timestamp: b.meta.timestamp,
        files: b.meta.files.length,
      }))
    );

    if (!selection) {
      printWarning('No backup selected. Exiting.');
      return;
    }
    selectedBackup = selection;
  }

  const confirmed = await confirmAction(
    `Delete backup "${selectedBackup}"? This cannot be undone.`
  );

  if (!confirmed) {
    printInfo('Delete cancelled.');
    return;
  }

  try {
    await deleteBackup(selectedBackup);
    printSuccess(`Deleted backup: ${selectedBackup}`);
  } catch (error) {
    printError(error instanceof Error ? error.message : 'Unknown error');
  }
}
