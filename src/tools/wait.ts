import { browserManager } from "../browser.js";

export async function wait(target: string, timeoutMs = 5000): Promise<string> {
  const page = await browserManager.getPage();

  // If it looks like a number, just wait that many ms
  const ms = parseInt(target, 10);
  if (!isNaN(ms)) {
    await page.waitForTimeout(Math.min(ms, 10000));
    return `Waited ${ms}ms`;
  }

  // Otherwise wait for a selector or text to appear
  try {
    await page.waitForSelector(target, { timeout: timeoutMs });
    return `Element "${target}" appeared`;
  } catch {
    // Try waiting for text
    try {
      await page.waitForFunction(
        (text) => document.body.innerText.includes(text),
        target,
        { timeout: timeoutMs }
      );
      return `Text "${target}" appeared on page`;
    } catch {
      throw new Error(`Timed out waiting for "${target}" after ${timeoutMs}ms`);
    }
  }
}
