# mindkit 🧠 - Forge your AI development mind

![mindkit Banner](assets/mindkit-banner.svg)

[![npm version](https://img.shields.io/npm/v/mindkit?style=flat-square&color=7C3AED&logo=npm)](https://www.npmjs.com/package/mindkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-06B6D4?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-F59E0B?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-7C3AED?style=flat-square)](https://github.com/Viniciuscarvalho/mindkit/pulls)

**Install and sync your AI development configurations across Claude Code, Cursor, and OpenAI Codex with a single command.**

Define your commands, agents, and templates once — deploy everywhere.

---

## ✨ Features

- 🔄 **Multi-tool Sync** — Claude Code, Cursor, and Codex support built-in
- 🎯 **Interactive CLI** — Beautiful TUI for selecting tools and components
- 📦 **Template System** — Customizable commands, agents, and doc templates
- 💾 **Auto Backup** — Never lose your configurations
- 🔀 **Watch Mode** — Real-time sync on file changes
- 🛠️ **Path Placeholders** — Tool-agnostic paths that work everywhere

---

## 🚀 Quick Start

**Run instantly** (no installation):
```bash
npx mindkit install
```

**Install globally**:
```bash
npm install -g mindkit
```

**Via Homebrew**:
```bash
brew tap viniciuscarvalho/mindkit
brew install mindkit
```

---

## 📖 Usage

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
mindkit init
```

### Sync between tools

```bash
# One-time sync
mindkit sync --source claude --target cursor

# Watch mode - auto-sync on changes
mindkit sync --watch
```

### Manage backups

```bash
mindkit backup create    # Create backup
mindkit backup list      # List backups
mindkit backup restore   # Restore from backup
```

### List components

```bash
mindkit list            # All components
mindkit list commands   # Commands only
mindkit list agents     # Agents only
mindkit list tools      # Detected tools
```

---

## 🗺️ Tool Mapping

mindkit automatically translates configurations for each tool:

| Concept | Claude Code | Cursor | Codex |
|---------|-------------|--------|-------|
| **Commands** | `~/.claude/commands/*.md` | `.cursor/rules/*.mdc` | `~/.codex/AGENTS.md` |
| **Agents** | `~/.claude/agents/*.md` | Embedded in rules | Merged in AGENTS.md |
| **Project config** | `CLAUDE.md` | `.cursorrules` | `AGENTS.md` |

---

## 📦 Built-in Templates

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

## 🔧 Template Placeholders

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

## 📁 Custom Templates

Add your own templates in `~/.mindkit/templates/`:

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

## 💻 Programmatic API

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

## 📋 Releases

See the [CHANGELOG](CHANGELOG.md) for a complete history of changes.

| Version | Date | Highlights |
|---------|------|------------|
| [1.0.1](https://github.com/Viniciuscarvalho/mindkit/releases/tag/v1.0.1) | 2026-01-20 | Improved tool detection via PATH |
| [1.0.0](https://github.com/Viniciuscarvalho/mindkit/releases/tag/v1.0.0) | 2026-01-19 | Initial release |

---

## 🤝 Contributing

```bash
git clone https://github.com/Viniciuscarvalho/mindkit.git
cd mindkit
npm install
npm run build
npm link  # Link for local testing
```

---

## 📄 License

MIT © [Vinicius Carvalho](https://github.com/Viniciuscarvalho)

---

<p align="center">
  <img src="assets/mindkit-logo.svg" width="60" alt="mindkit logo">
  <br>
  <sub>Built with 🧠 for the AI-assisted development community</sub>
</p>
