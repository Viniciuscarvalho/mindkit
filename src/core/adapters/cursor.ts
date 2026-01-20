import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { BaseAdapter } from './base.js';
import type {
  ToolDetection,
  TemplateConfig,
  InstallResult,
  ComponentType,
  PathTransform,
} from '../../types/index.js';

/**
 * Adapter for Cursor IDE
 *
 * Structure:
 * - .cursor/rules/*.mdc - Project rules (new format)
 * - .cursorrules - Legacy project rules
 * - .cursor/docs/ - Project documentation
 */
export class CursorAdapter extends BaseAdapter {
  readonly tool = 'cursor' as const;
  readonly name = 'Cursor';
  readonly description = 'Cursor AI IDE';

  private readonly globalDir = join(homedir(), '.cursor');

  getGlobalConfigDir(): string {
    return this.globalDir;
  }

  getProjectConfigPath(projectRoot: string): string {
    return join(projectRoot, '.cursor', 'rules');
  }

  async detect(): Promise<ToolDetection> {
    // Check for Cursor app on macOS (multiple possible locations)
    const macAppPaths = [
      '/Applications/Cursor.app',
      join(homedir(), 'Applications/Cursor.app'),
    ];
    let appExists = false;
    for (const appPath of macAppPaths) {
      if (await this.pathExists(appPath)) {
        appExists = true;
        break;
      }
    }

    // Check for config directory
    const configExists = await this.pathExists(this.globalDir);

    // Check if 'cursor' command exists in PATH
    const commandExists = this.commandExists('cursor');

    // Tool is installed if command exists, app exists, or config directory exists
    const installed = commandExists || appExists || configExists;

    return {
      tool: this.tool,
      installed,
      configPath: configExists ? this.globalDir : null,
    };
  }

  protected getDefaultTransforms(projectRoot?: string): PathTransform[] {
    return [
      { type: 'variable', from: 'DOCS', to: '.cursor/docs' },
      { type: 'variable', from: 'PROJECT', to: projectRoot || '.' },
      { type: 'variable', from: 'HOME', to: homedir() },
      { type: 'variable', from: 'CONFIG', to: this.globalDir },
    ];
  }

  /**
   * Convert markdown to MDC format for Cursor rules
   */
  private convertToMdc(content: string, name: string): string {
    // MDC format has a frontmatter-like header
    const header = `---
description: ${name} rule for Cursor
globs:
alwaysApply: true
---

`;
    return header + content;
  }

  async install(
    template: TemplateConfig,
    content: string,
    projectRoot?: string
  ): Promise<InstallResult> {
    const target = template.targets.cursor;
    if (!target) {
      return {
        template,
        tool: this.tool,
        success: false,
        targetPath: '',
        error: 'No Cursor target configured for this template',
      };
    }

    try {
      // Apply transforms
      const transforms = [
        ...this.getDefaultTransforms(projectRoot),
        ...(template.transforms || []),
      ];
      const transformedContent = this.transformContent(content, transforms);

      // Convert to MDC if target is a .mdc file
      const finalContent = target.path.endsWith('.mdc')
        ? this.convertToMdc(transformedContent, template.name)
        : transformedContent;

      // Expand target path
      let targetPath = target.path;
      if (projectRoot && !targetPath.startsWith('/') && !targetPath.startsWith('~')) {
        targetPath = join(projectRoot, targetPath);
      }
      targetPath = this.expandPath(targetPath);

      await this.writeConfig(targetPath, finalContent);

      return {
        template,
        tool: this.tool,
        success: true,
        targetPath,
      };
    } catch (error) {
      return {
        template,
        tool: this.tool,
        success: false,
        targetPath: target.path,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async listInstalled(_type: ComponentType): Promise<string[]> {
    // Cursor primarily uses rules for everything
    // We'll look in a hypothetical project's .cursor/rules
    const cwd = process.cwd();
    const rulesDir = join(cwd, '.cursor', 'rules');

    if (!(await this.pathExists(rulesDir))) {
      return [];
    }

    try {
      const entries = await readdir(rulesDir, { withFileTypes: true });
      return entries
        .filter((e) => e.isFile() && (e.name.endsWith('.mdc') || e.name.endsWith('.md')))
        .map((e) => e.name.replace(/\.(mdc|md)$/, ''));
    } catch {
      return [];
    }
  }
}
