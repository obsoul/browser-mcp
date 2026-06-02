import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { navigate } from "./tools/navigate.js";
import { snapshot } from "./tools/snapshot.js";
import { click } from "./tools/click.js";
import { type } from "./tools/type.js";
import { extract } from "./tools/extract.js";
import { screenshot } from "./tools/screenshot.js";
import { wait } from "./tools/wait.js";
import { browserManager } from "./browser.js";

const server = new McpServer({
  name: "browser-mcp",
  version: "0.1.0",
});

server.tool(
  "navigate",
  "Go to a URL and wait for the page to load",
  { url: z.string().describe("The full URL to navigate to") },
  async ({ url }) => ({ content: [{ type: "text", text: await navigate(url) }] })
);

server.tool(
  "snapshot",
  "Get a simplified summary of the current page: title, URL, headings, and interactive elements",
  {},
  async () => ({ content: [{ type: "text", text: await snapshot() }] })
);

server.tool(
  "click",
  "Click an element by CSS selector, visible text, or aria-label",
  { target: z.string().describe("CSS selector, button text, or label to click") },
  async ({ target }) => ({ content: [{ type: "text", text: await click(target) }] })
);

server.tool(
  "type",
  "Type text into an input field, found by CSS selector, placeholder, or label",
  {
    selector: z.string().describe("CSS selector, placeholder text, or field label"),
    text: z.string().describe("The text to type"),
  },
  async ({ selector, text }) => ({ content: [{ type: "text", text: await type(selector, text) }] })
);

server.tool(
  "extract",
  "Extract content from the page: tables, links, or text matching a query",
  { what: z.string().describe("What to extract: 'tables', 'links', or a search term") },
  async ({ what }) => ({ content: [{ type: "text", text: await extract(what) }] })
);

server.tool(
  "screenshot",
  "Take a screenshot of the current page",
  {},
  async () => {
    const img = await screenshot();
    return { content: [{ type: "image", data: img.data, mimeType: img.mimeType }] };
  }
);

server.tool(
  "wait",
  "Wait for a CSS selector, text to appear, or a number of milliseconds",
  { target: z.string().describe("CSS selector, text to wait for, or milliseconds as a number") },
  async ({ target }) => ({ content: [{ type: "text", text: await wait(target) }] })
);

server.tool(
  "reset",
  "Kill the current browser session and start a fresh clean browser",
  {},
  async () => {
    await browserManager.reset();
    return { content: [{ type: "text", text: "Browser reset. Fresh session ready." }] };
  }
);

server.tool(
  "status",
  "Get the current browser status: URL, page title, and connection state",
  {},
  async () => {
    const s = await browserManager.status();
    const text = s.connected
      ? `Connected\nURL: ${s.url}\nTitle: ${s.title}`
      : "No active browser session";
    return { content: [{ type: "text", text }] };
  }
);

// Clean up browser on exit — no zombie processes
process.on("SIGINT", async () => { await browserManager.cleanup(); process.exit(0); });
process.on("SIGTERM", async () => { await browserManager.cleanup(); process.exit(0); });
process.on("exit", () => { browserManager.cleanup(); });

const transport = new StdioServerTransport();
await server.connect(transport);
