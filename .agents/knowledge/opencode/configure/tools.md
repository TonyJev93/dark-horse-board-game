# Tools Configuration

## Built-in Tools

| Tool | Description |
|------|-------------|
| `read` | Read file contents (supports line ranges) |
| `write` | Write/create files |
| `edit` | Edit existing files |
| `bash` | Execute shell commands |
| `glob` | Find files by pattern |
| `grep` | Search file contents (regex) |
| `webfetch` | Fetch web content |
| `task` | Spawn subagent tasks |

## Enable/Disable Tools Globally

```json
{
  "$schema": "https://opencode.ai/config.json",
  "tools": {
    "write": true,
    "bash": true,
    "webfetch": false
  }
}
```

## Per-Agent Tool Configuration

```json
{
  "agent": {
    "plan": {
      "tools": {
        "write": false,
        "edit": false,
        "bash": false
      }
    }
  }
}
```

Agent-specific settings **override** global settings.

## Wildcard Patterns

Disable all tools from an MCP server:
```json
{
  "tools": {
    "mymcp_*": false
  }
}
```

Enable for specific agent:
```json
{
  "agent": {
    "my-agent": {
      "tools": {
        "mymcp_*": true
      }
    }
  }
}
```

## Mode-Based Tools

```json
{
  "mode": {
    "readonly": {
      "tools": {
        "write": false,
        "edit": false,
        "bash": false,
        "read": true,
        "grep": true,
        "glob": true
      }
    }
  }
}
```

## Markdown Mode Definition

`~/.config/opencode/modes/refactor.md`:
```markdown
---
model: anthropic/claude-sonnet-4-20250514
temperature: 0.2
tools:
  edit: true
  read: true
  grep: true
  glob: true
---

You are in refactoring mode. Focus on improving code quality.
```

---
*Context7: `query-docs(/anomalyco/opencode, "tools configuration enable disable")`*
