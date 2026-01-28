import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./smokeCloudLoadUtils.js";

describe("cloudSave_autobuyer", () => {
  test(
    "loads autobuyer save and validates hydrogen increases over time",
    async () => {
      const pioneerId = "smoke_save_autobuyer_v1";

      const rootDir = path.resolve(process.cwd());
      const { server, port } = await startStaticServer({ rootDir });

      const browser = await chromium.launch({
        headless: process.env.HEADLESS === "1"
      });

      try {
        const context = await browser.newContext();
        const page = await context.newPage();

        await createCloudLoadedGame({ page, port, pioneerId });

        await page.click("#tab1");
        await page.click("#hydrogenOption");

        const h1 = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          return mod.resourceData?.resources?.hydrogen?.quantity ?? 0;
        });

        await page.waitForTimeout(3000);

        const h2 = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          return mod.resourceData?.resources?.hydrogen?.quantity ?? 0;
        });

        expect(h2).toBeGreaterThan(h1);
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
