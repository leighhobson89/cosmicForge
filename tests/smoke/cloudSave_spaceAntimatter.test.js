import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./smokeCloudLoadUtils.js";

describe("cloudSave_spaceAntimatter", () => {
  test(
    "loads space/antimatter save and validates mining UI + antimatter quantity",
    async () => {
      const pioneerId = "smoke_save_space_antimatter_v1";

      const rootDir = path.resolve(process.cwd());
      const { server, port } = await startStaticServer({ rootDir });

      const browser = await chromium.launch({
        headless: process.env.HEADLESS === "1"
      });

      try {
        const context = await browser.newContext();
        const page = await context.newPage();

        await createCloudLoadedGame({ page, port, pioneerId });

        // Space Mining tab
        await page.click("#tab6");

        await page.locator("#miningQuantity").waitFor({ state: "visible", timeout: 60000 });

        const a1 = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          return mod.resourceData?.antimatter?.quantity ?? 0;
        });

        // If a rocket is actively mining, antimatter should rise over time.
        await page.waitForTimeout(3000);

        const a2 = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          return mod.resourceData?.antimatter?.quantity ?? 0;
        });

        const miningText = ((await page.locator("#miningQuantity").textContent()) ?? "").trim();
        expect(miningText.length).toBeGreaterThan(0);

        // Allow equal in case the save is set up with mining UI unlocked but rockets idle.
        expect(a2).toBeGreaterThanOrEqual(a1);

        // Sanity: launch pad/asteroids UI should exist once this save is in space-mining state.
        await page.locator("#spaceTelescopeOption").waitFor({ state: "visible", timeout: 60000 });
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
