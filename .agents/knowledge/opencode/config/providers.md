# Providers Configuration

## Authentication Methods

### 1. CLI Login (Recommended)
```bash
opencode auth login
```
Stores credentials in `~/.local/share/opencode/auth.json`

### 2. TUI Connect
```
/connect
```
Select provider → Follow prompts

### 3. Environment Variables
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
```

### 4. .env File
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

## Built-in Providers

| Provider | Auth Methods |
|----------|--------------|
| Anthropic | Claude Pro/Max, API Key |
| OpenAI | ChatGPT Plus/Pro, API Key |
| Google | API Key |
| OpenCode Zen | OpenCode account |

## Custom Provider Configuration

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "myprovider": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "My AI Provider",
      "options": {
        "baseURL": "https://api.myprovider.com/v1",
        "apiKey": "{env:MY_PROVIDER_API_KEY}",
        "headers": {
          "Authorization": "Bearer custom-token"
        }
      },
      "models": {
        "my-model-name": {
          "name": "My Model Display Name",
          "limit": {
            "context": 200000,
            "output": 65536
          }
        }
      }
    }
  }
}
```

## Provider Options

| Field | Type | Description |
|-------|------|-------------|
| `npm` | string | AI SDK package name |
| `name` | string | Display name |
| `options.baseURL` | string | API endpoint |
| `options.apiKey` | string | API key (supports `{env:VAR}`) |
| `options.headers` | object | Custom HTTP headers |
| `models` | object | Model definitions with limits |

## Model Limits

```json
{
  "models": {
    "model-id": {
      "name": "Display Name",
      "limit": {
        "context": 200000,
        "output": 65536
      }
    }
  }
}
```

Accurate limits ensure proper token tracking.

## SDK Authentication

```javascript
await client.auth.set({
  path: { id: "anthropic" },
  body: { type: "api", key: "your-api-key" },
})
```

---
*Context7: `query-docs(/anomalyco/opencode, "provider configuration API keys")`*
