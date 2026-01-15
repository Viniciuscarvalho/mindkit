import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { dirname } from 'node:path';
import { homedir } from 'node:os';
import type {
  ToolAdapter,
  ToolType,
  ToolDetection,
  TemplateConfig,
  InstallResult,
  ComponentType,
  PathTransform,
} from '../../types/index.js';

/**
 * Base adapter with common functionality for all tool adapters
 */
export abstract class BaseAdapter implements ToolAdapter {
  abstract readonly tool: ToolType;
  abstract readonly name: string;
  abstract readonly description: string;

  /**
   * Expand ~ to home directory
   */
  protected expandPath(path: string): string {
    if (path.startsWith('~')) {
      return path.replace('~', homedir());
    }
    return path;
  }

  /**
   * Check if a path exists
   */
  protected async pathExists(path: string): Promise<boolean> {
    try {
      await access(this.expandPath(path));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read a file, returning null if it doesn't exist
   */
  async readConfig(path: string): Promise<string | null> {
    try {
      const content = await readFile(this.expandPath(path), 'utf-8');
      return content;
    } catch {
      return null;
    }
  }

  /**
   * Write content to a file, creating directories as needed
   */
  protected async writeConfig(path: string, content: string): Promise<void> {
    const expandedPath = this.expandPath(path);
    await mkdir(dirname(expandedPath), { recursive: true });
    await writeFile(expandedPath, content, 'utf-8');
  }

  /**
   * Transform content by replacing placeholders
   */
  transformContent(content: string, transforms: PathTransform[]): string {
    let result = content;

    for (const transform of transforms) {
      if (transform.type === 'path') {
        result = result.replaceAll(transform.from, transform.to);
      } else if (transform.type === 'variable') {
        result = result.replaceAll(`{{${transform.from}}}`, transform.to);
      }
    }

    return result;
  }

  /**
   * Get the default transforms for this adapter
   */
  protected abstract getDefaultTransforms(projectRoot?: string): PathTransform[];

  /**
   * Detect if tool is installed
   */
  abstract detect(): Promise<ToolDetection>;

  /**
   * Get global config directory
   */
  abstract getGlobalConfigDir(): string;

  /**
   * Get project config path
   */
  abstract getProjectConfigPath(projectRoot: string): string;

  /**
   * Install a template
   */
  abstract install(
    template: TemplateConfig,
    content: string,
    projectRoot?: string
  ): Promise<InstallResult>;

  /**
   * List installed components
   */
  abstract listInstalled(type: ComponentType): Promise<string[]>;
}
