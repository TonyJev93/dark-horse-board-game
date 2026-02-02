# Agents Configuration

## Agent Modes

| Mode | Description |
|------|-------------|
| `primary` | User-facing, switchable with Tab |
| `subagent` | Invoked via Task tool |

## Built-in Agents

| Agent | Mode | Purpose |
|-------|------|---------|
| `build` | primary | Default coding agent |
| `plan` | primary | Read-only planning |

## Custom Agent (JSON)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "code-reviewer": {
      "description": "Reviews code for best practices",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4-5",
      "temperature": 0.1,
      "maxSteps": 10,
      "prompt": "You are a code reviewer. Focus on security, performance, and maintainability.",
      "tools": {
        "write": false,
        "edit": false,
        "bash": false
      },
      "permission": {
        "bash": {
          "*": "deny",
          "git diff": "allow",
          "git log*": "allow"
        }
      }
    }
  }
}
```

## Agent Properties

| Property | Type | Description |
|----------|------|-------------|
| `description` | string | Shown in agent list |
| `mode` | string | `"primary"` or `"subagent"` |
| `model` | string | Override default model |
| `temperature` | number | 0.0 - 1.0 |
| `maxSteps` | number | Max tool invocations |
| `prompt` | string | System prompt or `{file:path}` |
| `tools` | object | Tool enable/disable |
| `permission` | object | Granular permissions |

## Custom Agent (Markdown)

`~/.config/opencode/agents/reviewer.md` or `.opencode/agents/reviewer.md`:

```markdown
---
description: Code review without edits
mode: subagent
model: anthropic/claude-sonnet-4-5
permission:
  edit: deny
  bash:
    "*": ask
    "git diff": allow
    "git log*": allow
---

Only analyze code and suggest changes. Never modify files directly.
```

## File-Based Prompt

```json
{
  "agent": {
    "build": {
      "prompt": "{file:./prompts/build.txt}"
    }
  }
}
```

Path relative to config file location.

## CLI Agent Creation

```bash
opencode agent create
```

Interactive wizard for custom agent setup.

---
*Context7: `query-docs(/anomalyco/opencode, "custom agent configuration")`*
