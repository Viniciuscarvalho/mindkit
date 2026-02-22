import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { ToolType, ComponentType, TemplateConfig, TargetConfig } from '../../types/index.js';

/**
 * Parses the YAML frontmatter from a markdown file's content.
 * @param content The content of the markdown file.
 * @returns A record of the parsed frontmatter, or an empty object if none is found.
 */
function parseFrontmatter(content: string): Record<string, any> {
  const match = content.match(/^---([\s\S]+?)---/);
  if (match && match[1]) {
    try {
      return parseYaml(match[1]);
    } catch (e) {
      return {}; // Return empty if YAML is invalid
    }
  }
  return {};
}

/**
 * Generates the installation targets for a given template based on its type and name.
 * @param name The name of the template (e.g., 'architect').
 * @param type The component type ('agents', 'commands', etc.).
 * @returns A partial record of target configurations for each tool.
 */
function generateTargets(name: string, type: ComponentType): Partial<Record<ToolType, TargetConfig>> {
  // Helper to create a user-friendly header from a camelCase or kebab-case name
  const createHeader = (str: string) =>
    str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  switch (type) {
    case 'agents':
      return {
        claude: { path: `~/.claude/agents/${name}.md` },
        cursor: { path: `.cursor/rules/${name}.mdc` },
        codex: { path: '~/.codex/AGENTS.md', merge: true, sectionHeader: createHeader(name) },
        gemini: { path: `~/.gemini/skills/${name}/SKILL.md` },
      };
    case 'commands':
      return {
        claude: { path: `~/.claude/commands/${name}.md` },
        cursor: { path: `.cursor/rules/${name}.mdc` },
        codex: { path: '~/.codex/AGENTS.md', merge: true, sectionHeader: createHeader(name) },
        gemini: { path: `~/.gemini/skills/${name}/SKILL.md` },
      };
    default:
      return {};
  }
}

/**
 * Scans a directory for markdown files, parses their frontmatter, and builds
 * an array of TemplateConfig objects.
 * @param dirPath The absolute path to the directory to scan.
 * @param type The component type to assign to the discovered templates.
 * @returns An array of TemplateConfig objects.
 */
export function discoverTemplatesInDir(dirPath: string, type: ComponentType): TemplateConfig[] {
  const templates: TemplateConfig[] = [];
  try {
    const files = readdirSync(dirPath).filter(file => file.endsWith('.md'));

    for (const file of files) {
      const filePath = join(dirPath, file);
      const content = readFileSync(filePath, 'utf-8');
      const frontmatter = parseFrontmatter(content);

      // Use the name from frontmatter, or derive from filename
      const name = frontmatter.name || file.replace('.md', '');
      const description = frontmatter.description || `The ${name} ${type.slice(0, -1)}.`;
      
      const source = join(type, file);

      templates.push({
        name,
        source: source,
        type,
        description,
        targets: generateTargets(name, type),
      });
    }
  } catch (error) {
    // Directory might not exist, which is fine.
    if (error.code !== 'ENOENT') {
      console.warn(`Warning: Could not discover templates in ${dirPath}.`, error);
    }
  }

  return templates;
}
