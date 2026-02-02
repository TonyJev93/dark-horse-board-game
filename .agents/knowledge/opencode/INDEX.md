# OpenCode Knowledge Base

OpenCode configuration reference. For detailed queries, use Context7: `/anomalyco/opencode`

## Quick Reference

| Config Location | Scope |
|-----------------|-------|
| `opencode.json` (project root) | Project-specific |
| `~/.config/opencode/opencode.json` | Global |
| `AGENTS.md` (project root) | Project instructions |
| `~/.config/opencode/AGENTS.md` | Global instructions |

## Configuration Schema

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5",
  "theme": "opencode",
  "autoupdate": true,
  "share": "manual"
}
```

## Document Index

| Topic | File | Description |
|-------|------|-------------|
| **Config Schema** | [config/opencode-json.md](config/opencode-json.md) | Full opencode.json structure |
| **Providers** | [config/providers.md](config/providers.md) | API keys, custom providers |
| **Tools** | [configure/tools.md](configure/tools.md) | Built-in tools, permissions |
| **Agents** | [configure/agents.md](configure/agents.md) | Custom agents, modes |
| **MCP Servers** | [configure/mcp-servers.md](configure/mcp-servers.md) | Local/remote MCP integration |
| **Permissions** | [configure/permissions.md](configure/permissions.md) | Granular access control |

## Key Patterns

### Environment Variables in Config
```json
{
  "apiKey": "{env:ANTHROPIC_API_KEY}",
  "headers": {
    "Authorization": "Bearer {env:MY_TOKEN}"
  }
}
```

### File References in Config
```json
{
  "prompt": "{file:./prompts/build.txt}"
}
```

### Wildcard Patterns
```json
{
  "tools": {
    "my-mcp*": false
  },
  "permission": {
    "bash": {
      "git *": "ask"
    }
  }
}
```

## Context7 Query Examples

```
query-docs(/anomalyco/opencode, "MCP server OAuth configuration")
query-docs(/anomalyco/opencode, "agent permission bash commands")
query-docs(/anomalyco/opencode, "custom tools TypeScript plugin")
```

---
*For real-time documentation: Context7 `/anomalyco/opencode`*
