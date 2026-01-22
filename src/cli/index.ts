import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createInstallCommand } from './commands/install.js';
import { createBackupCommand } from './commands/backup.js';
import { createListCommand } from './commands/list.js';
import { createInitCommand } from './commands/init.js';
import { createSyncCommand } from './commands/sync.js';
import { printLogo, theme } from './ui/spinner.js';

// Get version from package.json
function getVersion(): string {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    let currentDir = __dirname;

    while (currentDir !== dirname(currentDir)) {
      try {
        const pkgPath = join(currentDir, 'package.json');
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        if (pkg.version) {
          return pkg.version;
        }
      } catch {
        // Continue searching
      }
      currentDir = dirname(currentDir);
    }
  } catch {
    return '1.0.2'
  }
  return '0.0.0';
}

const program = new Command();

program
  .name('mindkit')
  .description(theme.dim('Forge your AI development mind'))
  .version(getVersion())
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
