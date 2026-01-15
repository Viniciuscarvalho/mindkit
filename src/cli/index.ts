import { Command } from 'commander';
import { createInstallCommand } from './commands/install.js';
import { createBackupCommand } from './commands/backup.js';
import { createListCommand } from './commands/list.js';
import { createInitCommand } from './commands/init.js';
import { createSyncCommand } from './commands/sync.js';
import { printLogo, theme } from './ui/spinner.js';

const program = new Command();

program
  .name('mindkit')
  .description(theme.dim('Forge your AI development mind'))
  .version('0.1.0')
  .hook('preAction', () => {
    printLogo();
  });

// Add commands
program.addCommand(createInstallCommand());
program.addCommand(createBackupCommand());
program.addCommand(createListCommand());
program.addCommand(createInitCommand());
program.addCommand(createSyncCommand());

// Default action (no command)
program.action(() => {
  program.help();
});

// Parse arguments
program.parse();
