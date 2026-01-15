import type { ToolAdapter, ToolType } from '../../types/index.js';
import { ClaudeAdapter } from './claude.js';
import { CursorAdapter } from './cursor.js';
import { CodexAdapter } from './codex.js';

export { BaseAdapter } from './base.js';
export { ClaudeAdapter } from './claude.js';
export { CursorAdapter } from './cursor.js';
export { CodexAdapter } from './codex.js';

/**
 * Get adapter instance for a specific tool
 */
export function getAdapter(tool: ToolType): ToolAdapter {
  switch (tool) {
    case 'claude':
      return new ClaudeAdapter();
    case 'cursor':
      return new CursorAdapter();
    case 'codex':
      return new CodexAdapter();
  }
}

/**
 * Get all available adapters
 */
export function getAllAdapters(): ToolAdapter[] {
  return [new ClaudeAdapter(), new CursorAdapter(), new CodexAdapter()];
}

/**
 * Detect all installed tools
 */
export async function detectInstalledTools(): Promise<Map<ToolType, boolean>> {
  const adapters = getAllAdapters();
  const results = new Map<ToolType, boolean>();

  await Promise.all(
    adapters.map(async (adapter) => {
      const detection = await adapter.detect();
      results.set(adapter.tool, detection.installed);
    })
  );

  return results;
}
