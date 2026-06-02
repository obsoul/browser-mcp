import { browserManager } from "../browser.js";

export async function snapshot(): Promise<string> {
  const page = await browserManager.getPage();
  const title = await page.title();
  const url = page.url();

  // Return a simplified, LLM-friendly DOM summary instead of raw HTML
  const summary = await page.evaluate(() => {
    const results: string[] = [];

    // Headings
    document.querySelectorAll("h1,h2,h3").forEach((el) => {
      results.push(`[${el.tagName}] ${el.textContent?.trim()}`);
    });

    // Interactive elements
    document.querySelectorAll("a[href],button,input,select,textarea").forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const text = (el as HTMLElement).innerText?.trim() ||
        (el as HTMLInputElement).placeholder ||
        (el as HTMLInputElement).value ||
        el.getAttribute("aria-label") ||
        el.getAttribute("name") || "";
      const href = el.getAttribute("href") || "";
      if (text || href) {
        results.push(`[${tag}${href ? " href=" + href : ""}] ${text}`);
      }
    });

    return results.slice(0, 60).join("\n");
  });

  return `URL: ${url}\nTitle: ${title}\n\n${summary}`;
}
