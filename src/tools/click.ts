import { browserManager } from "../browser.js";

export async function click(target: string): Promise<string> {
  const page = await browserManager.getPage();

  // Try CSS selector first
  try {
    await page.click(target, { timeout: 3000 });
    return `Clicked element matching selector: "${target}"`;
  } catch {
    // Fall through to text/label matching
  }

  // Fuzzy match: find clickable element by visible text or aria-label
  const clicked = await page.evaluate((label) => {
    const candidates = Array.from(
      document.querySelectorAll("a,button,input[type=submit],[role=button],[tabindex]")
    );
    const lower = label.toLowerCase();
    const match = candidates.find((el) => {
      const text = (el as HTMLElement).innerText?.toLowerCase() || "";
      const aria = el.getAttribute("aria-label")?.toLowerCase() || "";
      const val = (el as HTMLInputElement).value?.toLowerCase() || "";
      return text.includes(lower) || aria.includes(lower) || val.includes(lower);
    });
    if (match) {
      (match as HTMLElement).click();
      return (match as HTMLElement).innerText?.trim() || match.tagName;
    }
    return null;
  }, target);

  if (clicked) {
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    return `Clicked element with text/label matching "${target}" (found: "${clicked}")`;
  }

  throw new Error(`No clickable element found matching "${target}"`);
}
