# browser-mcp

A minimal, reliable browser control MCP server for LLM agents.

Built to fix the most common pain points with Playwright MCP: too many tools, zombie processes, memory leaks, and fragile setup.

## Features

- **9 focused tools** instead of 25+ — reduces agent confusion
- **Auto-cleanup** on exit — no zombie Chrome processes
- **Auto-reset** if memory exceeds 500MB — no runaway leaks
- **Fuzzy matching** — click and type by visible text or label, not just CSS selectors
- **One-command setup**

## Install

```bash
npx browser-mcp install
```

Or manually:

```bash
git clone https://github.com/obsoul/browser-mcp
cd browser-mcp
npm install
npx playwright install chromium
npm run build
```

## Add to Claude Code

Add this to your `~/.claude.json` under `mcpServers`:

```json
"browser": {
  "command": "node",
  "args": ["C:/path/to/browser-mcp/dist/index.js"],
  "type": "stdio"
}
```

Or if published to npm:

```json
"browser": {
  "command": "npx",
  "args": ["browser-mcp"],
  "type": "stdio"
}
```

## Tools

| Tool | Description |
|---|---|
| `navigate` | Go to a URL |
| `snapshot` | Get page title, headings, and interactive elements |
| `click` | Click by CSS selector, text, or aria-label |
| `type` | Type into a field by selector, placeholder, or label |
| `extract` | Extract tables, links, or text from the page |
| `screenshot` | Capture the current page |
| `wait` | Wait for a selector, text, or N milliseconds |
| `reset` | Kill browser and start a fresh clean session |
| `status` | Get current URL, title, and connection state |

## Example usage in Claude Code

```
navigate to https://news.ycombinator.com
snapshot
extract links
```

## Why not just use Playwright MCP?

| Problem | This server |
|---|---|
| 25+ tools confuse agents | 9 tools only |
| Zombie Chrome processes | Cleanup on SIGINT/SIGTERM/exit |
| 24GB memory leaks | Auto-reset at 500MB |
| Profile lock errors | Single managed context, no user profile |
| Opaque failures | Returns what it actually matched |

## License

MIT
