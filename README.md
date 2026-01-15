<p align="center">
  <pre align="center">
   ╭─────╮
  ╭┤ ◉ ◉ ├╮
  │╰──┬──╯│
  ╰───┴───╯
  </pre>
</p>

<h1 align="center">mindkit</h1>

<p align="center">
  <strong>Forge your AI development mind</strong>
</p>

<p align="center">
  Install and sync your AI development configurations across <strong>Claude Code</strong>, <strong>Cursor</strong>, and <strong>OpenAI Codex</strong> with a single command.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/mindkit"><img src="https://img.shields.io/npm/v/mindkit.svg?style=flat-square&color=7C3AED" alt="npm version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-06B6D4.svg?style=flat-square" alt="License: MIT"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-F59E0B?style=flat-square" alt="Node.js"></a>
</p>

---

## Quick Install

**Run instantly** (no installation):

```bash
npx mindkit install
```

**Install globally**:

```bash
npm install -g mindkit
```

**Via Homebrew** (coming soon):

```bash
brew tap viniciuscarvalho/mindkit
brew install mindkit
```

---

## What it does

mindkit solves the pain of maintaining consistent AI configurations across multiple tools. Define your commands, agents, and templates once, then deploy everywhere.

```
┌─────────────┐     ┌──────────────┐
│  mindkit    │────▶│ Claude Code  │  ~/.claude/commands/
│  templates  │────▶│ Cursor       │  .cursor/rules/
│             │────▶│ Codex        │  ~/.codex/AGENTS.md
└─────────────┘     └──────────────┘
```

## Usage

### Install configs to your AI tools

```bash
# Interactive mode - select tools and components
mindkit install

# Quick install to specific tools
mindkit install --tools claude,cursor

# Preview what would be installed
mindkit install --dry-run
```

### Initialize in a project

```bash
# Detect installed tools and create config
mindkit init
```

### Sync between tools

```bash
# One-time sync from Claude to Cursor
mindkit sync --source claude --target cursor

# Watch mode - auto-sync on changes
mindkit sync --watch
```

### Manage backups

```bash
# Create backup before making changes
mindkit backup create

# List available backups
mindkit backup list

# Restore from backup
mindkit backup restore
```

### List components

```bash
# List all available templates
mindkit list

# List by type
mindkit list commands
mindkit list agents

# Show detected tools
mindkit list tools
```

---

## Built-in Templates

### Commands
| Name | Description |
|------|-------------|
| `create-prd` | Generate Product Requirements Documents |
| `generate-spec` | Create technical specifications from PRDs |
| `generate-tasks` | Break down specs into implementable tasks |

### Agents
| Name | Description |
|------|-------------|
| `swift-expert` | Senior Swift developer with SwiftUI expertise |
| `backend-developer` | Backend engineer for APIs and microservices |
| `ui-designer` | Visual designer for interfaces and design systems |
| `typescript-pro` | TypeScript expert for full-stack development |

---

## Tool Mapping

mindkit automatically translates configurations for each tool:

| Concept | Claude Code | Cursor | Codex |
|---------|-------------|--------|-------|
| Commands | `~/.claude/commands/*.md` | `.cursor/rules/*.mdc` | `~/.codex/AGENTS.md` |
| Agents | `~/.claude/agents/*.md` | Embedded in rules | Merged in AGENTS.md |
| Project config | `CLAUDE.md` | `.cursorrules` | `AGENTS.md` |

---

## Template Placeholders

Templates use placeholders that resolve correctly for each tool:

```markdown
Use template from {{DOCS}}/specs/prd-template.md
Output to {{PROJECT}}/docs/tasks/prd-{{feature}}/prd.md
```

| Placeholder | Description |
|-------------|-------------|
| `{{DOCS}}` | Documentation directory |
| `{{PROJECT}}` | Project root |
| `{{HOME}}` | User home directory |
| `{{CONFIG}}` | Tool's global config |

---

## Custom Templates

Add your own templates:

```
~/.mindkit/
├── templates/
│   ├── commands/
│   │   └── my-command.md
│   └── agents/
│       └── my-agent.md
└── registry.yaml
```

```yaml
# ~/.mindkit/registry.yaml
version: 1
templates:
  - name: my-command
    source: commands/my-command.md
    type: commands
    targets:
      claude:
        path: ~/.claude/commands/my-command.md
      cursor:
        path: .cursor/rules/my-command.mdc
```

---

## Programmatic API

```typescript
import { getAdapter, detectInstalledTools, getAllTemplates } from 'mindkit';

// Detect installed tools
const tools = await detectInstalledTools();
// Map { 'claude' => true, 'cursor' => true, 'codex' => false }

// Get adapter and install
const claude = getAdapter('claude');
const templates = await getAllTemplates();
await claude.install(templates.commands[0], content);
```

---

## Contributing

```bash
git clone https://github.com/viniciuscarvalho/mindkit.git
cd mindkit
npm install
npm run build
npm link  # Link for local testing
```

---

## License

MIT

---

<p align="center">
  <sub>Built with care for the AI-assisted development community</sub>
</p>
