import { browserManager } from "../browser.js";

export async function type(selector: string, text: string): Promise<string> {
  const page = await browserManager.getPage();

  // Try selector first, then placeholder/label match
  try {
    await page.fill(selector, text, { timeout: 3000 });
    return `Typed into "${selector}"`;
  } catch {
    // Fall through
  }

  const filled = await page.evaluate(({ label, value }) => {
    const inputs = Array.from(document.querySelectorAll("input,textarea"));
    const lower = label.toLowerCase();
    const match = inputs.find((el) => {
      const ph = (el as HTMLInputElement).placeholder?.toLowerCase() || "";
      const name = el.getAttribute("name")?.toLowerCase() || "";
      const ariaLabel = el.getAttribute("aria-label")?.toLowerCase() || "";
      return ph.includes(lower) || name.includes(lower) || ariaLabel.includes(lower);
    }) as HTMLInputElement | null;
    if (match) {
      match.focus();
      match.value = value;
      match.dispatchEvent(new Event("input", { bubbles: true }));
      match.dispatchEvent(new Event("change", { bubbles: true }));
      return match.name || match.placeholder || "field";
    }
    return null;
  }, { label: selector, value: text });

  if (filled) {
    return `Typed into field "${filled}"`;
  }

  throw new Error(`No input field found matching "${selector}"`);
}
