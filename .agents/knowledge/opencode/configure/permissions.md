# Permissions Configuration

## Permission Levels

| Level | Behavior |
|-------|----------|
| `allow` | Execute immediately |
| `ask` | Prompt user for approval |
| `deny` | Block execution |

## Global Permissions

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "bash": "allow",
    "read": "allow",
    "write": "ask",
    "edit": "ask"
  }
}
```

## Granular Bash Permissions

```json
{
  "permission": {
    "bash": {
      "*": "ask",
      "git *": "allow",
      "git commit *": "deny",
      "git push *": "deny",
      "npm *": "allow",
      "rm *": "deny",
      "grep *": "allow"
    }
  }
}
```

**Rule evaluation**: Last matching rule wins.

## Pattern Syntax

| Pattern | Matches |
|---------|---------|
| `*` | Any command |
| `git *` | All git commands |
| `git log*` | `git log`, `git log --oneline` |
| `grep *` | All grep commands |

## Path-Based Edit Permissions

```json
{
  "permission": {
    "edit": {
      "*": "deny",
      "packages/web/src/content/docs/*.mdx": "allow"
    }
  }
}
```

## Per-Agent Permissions

```json
{
  "permission": {
    "bash": {
      "*": "ask"
    }
  },
  "agent": {
    "build": {
      "permission": {
        "bash": {
          "*": "ask",
          "git *": "allow",
          "git commit *": "ask",
          "git push *": "deny"
        }
      }
    }
  }
}
```

Agent permissions **override** global permissions.

## Markdown Agent Permissions

```markdown
---
description: Code review without edits
mode: subagent
permission:
  edit: deny
  webfetch: deny
  bash:
    "*": ask
    "git diff": allow
    "git log*": allow
    "grep *": allow
---
```

## Skill Permissions

```json
{
  "permission": {
    "skill": {
      "*": "ask",
      "internal-*": "deny",
      "my-skill": "allow"
    }
  }
}
```

| Level | Skill Behavior |
|-------|----------------|
| `allow` | Load immediately |
| `ask` | Prompt before loading |
| `deny` | Hidden from agent |

---
*Context7: `query-docs(/anomalyco/opencode, "permissions bash allow deny")`*
