import { browserManager } from "../browser.js";

export async function extract(what: string): Promise<string> {
  const page = await browserManager.getPage();

  const lower = what.toLowerCase();

  if (lower.includes("table")) {
    const tables = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("table")).map((table) => {
        const rows = Array.from(table.querySelectorAll("tr")).map((row) =>
          Array.from(row.querySelectorAll("th,td"))
            .map((cell) => cell.textContent?.trim() || "")
            .join(" | ")
        );
        return rows.join("\n");
      });
    });
    return tables.length ? tables.join("\n\n---\n\n") : "No tables found on page.";
  }

  if (lower.includes("link")) {
    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]"))
        .map((a) => `${a.textContent?.trim()} → ${a.getAttribute("href")}`)
        .filter((s) => s.trim().length > 3)
        .slice(0, 50)
    );
    return links.join("\n");
  }

  // Default: extract visible text matching the query
  const text = await page.evaluate((query) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const lines: string[] = [];
    let node;
    while ((node = walker.nextNode())) {
      const val = node.textContent?.trim() || "";
      if (val.length > 10 && val.toLowerCase().includes(query.toLowerCase())) {
        lines.push(val);
      }
    }
    return lines.slice(0, 30).join("\n");
  }, what);

  return text || `No content found matching "${what}"`;
}
