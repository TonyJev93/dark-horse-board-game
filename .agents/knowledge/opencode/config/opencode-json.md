# opencode.json Configuration

## File Locations

| Location | Scope | Priority |
|----------|-------|----------|
| `./opencode.json` | Project | Highest |
| `~/.config/opencode/opencode.json` | Global | Fallback |

Supports both JSON and JSONC (with comments).

## Core Properties

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5",
  "theme": "opencode",
  "autoupdate": true,
  "share": "manual",
  "default_agent": "build"
}
```

| Property | Type | Description |
|----------|------|-------------|
| `model` | string | Default model for primary agents |
| `small_model` | string | Model for lightweight tasks |
| `theme` | string | UI theme name |
| `autoupdate` | boolean | Auto-update OpenCode |
| `share` | string | Sharing mode: `"manual"` or `"auto"` |
| `default_agent` | string | Default agent on startup |

## Top-Level Sections

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {},       // Custom LLM providers
  "mcp": {},            // MCP server configurations
  "agent": {},          // Agent definitions
  "tools": {},          // Tool enable/disable
  "permission": {},     // Global permissions
  "mode": {},           // Custom modes
  "keybinds": {},       // Keyboard shortcuts
  "formatter": {},      // Code formatters
  "instructions": [],   // Additional instruction files
  "server": {}          // Web server settings
}
```

## Instructions Field

Include additional instruction files:

```json
{
  "instructions": [
    "CONTRIBUTING.md",
    "docs/guidelines.md",
    ".cursor/rules/*.md"
  ]
}
```

Supports:
- Local file paths (relative to config)
- Glob patterns (`*.md`)
- Remote URLs

## Server Configuration

```json
{
  "server": {
    "port": 4096,
    "hostname": "0.0.0.0",
    "mdns": true,
    "cors": ["https://example.com"]
  }
}
```

## Dynamic Values

### Environment Variables
```json
{
  "apiKey": "{env:ANTHROPIC_API_KEY}"
}
```

### File Contents
```json
{
  "prompt": "{file:./prompts/system.txt}"
}
```

---
*Context7: `query-docs(/anomalyco/opencode, "opencode.json configuration")`*
