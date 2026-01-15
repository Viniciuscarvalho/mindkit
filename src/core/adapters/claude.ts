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
 * Adapter for Claude Code CLI
 *
 * Structure:
 * - ~/.claude/commands/*.md (Custom commands)
 * - ~/.claude/agents/*.md (Agent definitions)
 * - ~/.claude/skills/SKILL.md (Skill definitions)
 * - ~/.claude/docs/ (Documentation templates)
 * - CLAUDE.md (Project-level instructions)
 */
export class ClaudeAdapter extends BaseAdapter {
  readonly tool = 'claude' as const;
  readonly name = 'Claude Code';
  readonly description = 'Anthropic Claude Code CLI';

  private readonly globalDir = join(homedir(), '.claude');

  getGlobalConfigDir(): string {
    return this.globalDir;
  }

  getProjectConfigPath(projectRoot: string): string {
    return join(projectRoot, 'CLAUDE.md');
  }

  async detect(): Promise<ToolDetection> {
    const configExists = await this.pathExists(this.globalDir);
    const settingsPath = join(this.globalDir, 'settings.json');
    const settingsExist = await this.pathExists(settingsPath);

    return {
      tool: this.tool,
      installed: configExists && settingsExist,
      configPath: configExists ? this.globalDir : null,
    };
  }

  protected getDefaultTransforms(projectRoot?: string): PathTransform[] {
    return [
      { type: 'variable', from: 'DOCS', to: './docs' },
      { type: 'variable', from: 'PROJECT', to: projectRoot || '.' },
      { type: 'variable', from: 'HOME', to: homedir() },
      { type: 'variable', from: 'CONFIG', to: this.globalDir },
    ];
  }

  async install(
    template: TemplateConfig,
    content: string,
    projectRoot?: string
  ): Promise<InstallResult> {
    const target = template.targets.claude;
    if (!target) {
      return {
        template,
        tool: this.tool,
        success: false,
        targetPath: '',
        error: 'No Claude target configured for this template',
      };
    }

    try {
      // Apply transforms
      const transforms = [
        ...this.getDefaultTransforms(projectRoot),
        ...(template.transforms || []),
      ];
      const transformedContent = this.transformContent(content, transforms);

      // Expand target path
      let targetPath = target.path;
      if (targetPath.startsWith('~')) {
        targetPath = targetPath.replace('~', homedir());
      } else if (projectRoot && !targetPath.startsWith('/')) {
        targetPath = join(projectRoot, targetPath);
      }

      await this.writeConfig(targetPath, transformedContent);

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

  async listInstalled(type: ComponentType): Promise<string[]> {
    const dirMap: Record<ComponentType, string> = {
      commands: join(this.globalDir, 'commands'),
      agents: join(this.globalDir, 'agents'),
      skills: join(this.globalDir, 'skills'),
      templates: join(this.globalDir, 'docs'),
    };

    const dir = dirMap[type];
    if (!(await this.pathExists(dir))) {
      return [];
    }

    try {
      const entries = await readdir(dir, { withFileTypes: true });

      if (type === 'skills') {
        // Skills are directories with SKILL.md inside
        return entries
          .filter((e) => e.isDirectory())
          .map((e) => e.name);
      }

      // Commands and agents are .md files
      return entries
        .filter((e) => e.isFile() && e.name.endsWith('.md'))
        .map((e) => e.name.replace('.md', ''));
    } catch {
      return [];
    }
  }
}
