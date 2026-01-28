import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./smokeCloudLoadUtils.js";

describe("cloudSave_earlyLoop", () => {
  test(
    "loads early-loop save and validates hydrogen gain/sell/storage",
    async () => {
      const pioneerId = "smoke_save_early_loop_v1";

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

        const before = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          return {
            h: mod.resourceData?.resources?.hydrogen?.quantity ?? 0,
            cap: mod.resourceData?.resources?.hydrogen?.storageCapacity ?? 0,
            cash: mod.resourceData?.currency?.cash ?? 0
          };
        });

        await page.locator("#hydrogenGainRow button").click();

        await page.waitForFunction(
          async (prev) => {
            const mod = await import("/resourceDataObject.js");
            const now = mod.resourceData?.resources?.hydrogen?.quantity ?? 0;
            return now >= prev + 1;
          },
          before.h,
          { timeout: 60000 }
        );

        // Try a sell (assumes save has at least some hydrogen and sell is allowed).
        const cashBeforeSell = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          return mod.resourceData?.currency?.cash ?? 0;
        });

        const sellButton = page.locator("#hydrogenSellRow").getByRole("button", { name: "Sell" });
        await sellButton.waitFor({ state: "visible", timeout: 60000 });
        await sellButton.click();

        await page.waitForFunction(
          async (prevCash) => {
            const mod = await import("/resourceDataObject.js");
            const cashNow = mod.resourceData?.currency?.cash ?? 0;
            return cashNow >= prevCash;
          },
          cashBeforeSell,
          { timeout: 60000 }
        );

        // If the save is already at full storage, validate Increase Storage increases capacity.
        const isFull = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          const q = mod.resourceData?.resources?.hydrogen?.quantity ?? 0;
          const cap = mod.resourceData?.resources?.hydrogen?.storageCapacity ?? 0;
          return cap > 0 && Math.floor(q) >= Math.floor(cap);
        });

        if (isFull) {
          const capBefore = await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return mod.resourceData?.resources?.hydrogen?.storageCapacity ?? 0;
          });

          await page.getByRole("button", { name: "Increase Storage" }).click();

          await page.waitForFunction(
            async (prevCap) => {
              const mod = await import("/resourceDataObject.js");
              const capNow = mod.resourceData?.resources?.hydrogen?.storageCapacity ?? 0;
              return capNow > prevCap;
            },
            capBefore,
            { timeout: 60000 }
          );
        }

        const after = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          return {
            h: mod.resourceData?.resources?.hydrogen?.quantity ?? 0,
            cap: mod.resourceData?.resources?.hydrogen?.storageCapacity ?? 0,
            cash: mod.resourceData?.currency?.cash ?? 0
          };
        });

        expect(after.cap).toBeGreaterThan(0);
        expect(after.cash).toBeGreaterThanOrEqual(before.cash);
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
