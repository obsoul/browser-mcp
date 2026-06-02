import { chromium, Browser, Page } from "playwright";

const MEMORY_LIMIT_MB = 500;

class BrowserManager {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private callCount = 0;

  async getPage(): Promise<Page> {
    if (!this.browser || !this.browser.isConnected()) {
      await this.launch();
    }
    if (!this.page || this.page.isClosed()) {
      this.page = await this.browser!.newPage();
    }
    await this.checkMemory();
    return this.page;
  }

  private async launch() {
    this.browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    this.browser.on("disconnected", () => {
      this.browser = null;
      this.page = null;
    });
    this.page = await this.browser.newPage();
    this.callCount = 0;
  }

  private async checkMemory() {
    // Auto-reset if memory exceeds threshold
    try {
      const metrics = await this.page!.evaluate(() => {
        const perf = (performance as any).memory;
        return perf ? perf.usedJSHeapSize : 0;
      });
      const mb = metrics / 1024 / 1024;
      if (mb > MEMORY_LIMIT_MB) {
        await this.reset();
      }
    } catch {
      // Non-fatal: some pages block performance.memory
    }
  }

  async reset(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
      }
    } catch {
      // Already closed
    }
    this.browser = null;
    this.page = null;
    await this.launch();
  }

  async status(): Promise<{ url: string; title: string; connected: boolean }> {
    if (!this.page || this.page.isClosed() || !this.browser?.isConnected()) {
      return { url: "none", title: "none", connected: false };
    }
    return {
      url: this.page.url(),
      title: await this.page.title(),
      connected: true,
    };
  }

  async cleanup() {
    try {
      if (this.browser) {
        await this.browser.close();
      }
    } catch {
      // Ignore
    }
    this.browser = null;
    this.page = null;
  }
}

export const browserManager = new BrowserManager();
