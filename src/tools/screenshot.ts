import { browserManager } from "../browser.js";

export async function screenshot(): Promise<{ type: "image"; data: string; mimeType: string }> {
  const page = await browserManager.getPage();
  const buffer = await page.screenshot({ type: "png", fullPage: false });
  return {
    type: "image",
    data: buffer.toString("base64"),
    mimeType: "image/png",
  };
}
