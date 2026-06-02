import { browserManager } from "../browser.js";

export async function navigate(url: string): Promise<string> {
  const page = await browserManager.getPage();
  const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
  const status = response?.status() ?? 0;
  const title = await page.title();
  return `Navigated to ${url} (HTTP ${status}) — "${title}"`;
}
