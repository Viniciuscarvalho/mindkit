import { mkdir, readdir, readFile, writeFile, cp, rm, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import type { BackupMeta, ToolType } from '../../types/index.js';

/**
 * Get the backups directory
 */
export function getBackupsDir(): string {
  return join(homedir(), '.mindkit', 'backups');
}

/**
 * Generate a timestamp-based backup name
 */
export function generateBackupName(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Create a new backup
 */
export async function createBackup(
  files: string[],
  tools: ToolType[]
): Promise<{ backupPath: string; meta: BackupMeta }> {
  const backupsDir = getBackupsDir();
  const backupName = generateBackupName();
  const backupPath = join(backupsDir, backupName);

  await mkdir(backupPath, { recursive: true });

  const backedUpFiles: string[] = [];

  for (const file of files) {
    try {
      const fileStat = await stat(file);
      if (fileStat.isFile()) {
        const relativeName = file.replace(homedir(), '').replace(/^\//, '');
        const destPath = join(backupPath, relativeName);

        await mkdir(dirname(destPath), { recursive: true });
        await cp(file, destPath);
        backedUpFiles.push(file);
      }
    } catch {
      // File doesn't exist, skip
    }
  }

  const meta: BackupMeta = {
    timestamp: new Date().toISOString(),
    tools,
    files: backedUpFiles,
  };

  await writeFile(join(backupPath, 'meta.json'), JSON.stringify(meta, null, 2), 'utf-8');

  return { backupPath, meta };
}

/**
 * List all backups
 */
export async function listBackups(): Promise<Array<{ name: string; meta: BackupMeta }>> {
  const backupsDir = getBackupsDir();

  try {
    const entries = await readdir(backupsDir, { withFileTypes: true });
    const backups: Array<{ name: string; meta: BackupMeta }> = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const metaPath = join(backupsDir, entry.name, 'meta.json');
          const metaContent = await readFile(metaPath, 'utf-8');
          const meta = JSON.parse(metaContent) as BackupMeta;
          backups.push({ name: entry.name, meta });
        } catch {
          // Invalid backup, skip
        }
      }
    }

    // Sort by timestamp descending
    backups.sort((a, b) => b.meta.timestamp.localeCompare(a.meta.timestamp));

    return backups;
  } catch {
    return [];
  }
}

/**
 * Restore a backup
 */
export async function restoreBackup(backupName: string): Promise<string[]> {
  const backupsDir = getBackupsDir();
  const backupPath = join(backupsDir, backupName);

  const metaPath = join(backupPath, 'meta.json');
  const metaContent = await readFile(metaPath, 'utf-8');
  const meta = JSON.parse(metaContent) as BackupMeta;

  const restoredFiles: string[] = [];

  for (const originalPath of meta.files) {
    const relativeName = originalPath.replace(homedir(), '').replace(/^\//, '');
    const backupFilePath = join(backupPath, relativeName);

    try {
      await mkdir(dirname(originalPath), { recursive: true });
      await cp(backupFilePath, originalPath);
      restoredFiles.push(originalPath);
    } catch {
      // Backup file doesn't exist, skip
    }
  }

  return restoredFiles;
}

/**
 * Delete a backup
 */
export async function deleteBackup(backupName: string): Promise<void> {
  const backupsDir = getBackupsDir();
  const backupPath = join(backupsDir, backupName);
  await rm(backupPath, { recursive: true, force: true });
}

/**
 * Get files that would be backed up for given tools
 */
export function getFilesToBackup(tools: ToolType[]): string[] {
  const files: string[] = [];
  const home = homedir();

  for (const tool of tools) {
    switch (tool) {
      case 'claude':
        files.push(
          join(home, '.claude', 'commands'),
          join(home, '.claude', 'agents'),
          join(home, '.claude', 'skills'),
          join(home, '.claude', 'docs')
        );
        break;
      case 'cursor':
        files.push(join(home, '.cursor', 'rules'));
        break;
      case 'codex':
        files.push(join(home, '.codex', 'AGENTS.md'));
        break;
    }
  }

  return files;
}

export { BackupMeta };
