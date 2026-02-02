# MCP Servers Configuration

Model Context Protocol (MCP) servers extend OpenCode with external tools.

## Local MCP Server

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "everything": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-everything"],
      "enabled": true,
      "environment": {
        "DEBUG": "true"
      }
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `"local"` |
| `command` | array | Command + args |
| `enabled` | boolean | Enable/disable |
| `environment` | object | Environment variables |

## Remote MCP Server

```json
{
  "mcp": {
    "sentry": {
      "type": "remote",
      "url": "https://mcp.sentry.dev/mcp",
      "oauth": {}
    },
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}"
      }
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `"remote"` |
| `url` | string | MCP endpoint URL |
| `oauth` | object | OAuth configuration |
| `headers` | object | Custom headers |

## Disable MCP Tool Globally

```json
{
  "mcp": {
    "my-mcp": {
      "type": "local",
      "command": ["bun", "x", "my-mcp-command"]
    }
  },
  "tools": {
    "my-mcp*": false
  }
}
```

## Enable MCP Tool Per-Agent

```json
{
  "tools": {
    "my-mcp*": false
  },
  "agent": {
    "my-agent": {
      "tools": {
        "my-mcp*": true
      }
    }
  }
}
```

Global disable + agent-specific enable.

## Tool Naming Convention

MCP tools are prefixed with server name:
- Server: `my-mcp`
- Tool: `my-mcp_toolname`

Wildcard: `my-mcp*` matches all tools from that server.

---
*Context7: `query-docs(/anomalyco/opencode, "MCP server configuration")`*
