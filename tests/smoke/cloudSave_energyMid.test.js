import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./smokeCloudLoadUtils.js";

describe("cloudSave_energyMid", () => {
  test(
    "loads mid-energy save and validates energy UI is active",
    async () => {
      const pioneerId = "smoke_save_energy_mid_v1";

      const rootDir = path.resolve(process.cwd());
      const { server, port } = await startStaticServer({ rootDir });

      const browser = await chromium.launch({
        headless: process.env.HEADLESS === "1"
      });

      try {
        const context = await browser.newContext();
        const page = await context.newPage();

        await createCloudLoadedGame({ page, port, pioneerId });

        await page.click("#tab2");

        await page.locator("#energyRate").waitFor({ state: "visible", timeout: 60000 });
        await page.locator("#energyQuantity").waitFor({ state: "visible", timeout: 60000 });

        const energy = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          return {
            qty: mod.resourceData?.buildings?.energy?.quantity ?? 0,
            cap: mod.resourceData?.buildings?.energy?.storageCapacity ?? 0,
            rate: mod.resourceData?.buildings?.energy?.rate ?? 0,
            consumption: mod.resourceData?.buildings?.energy?.consumption ?? 0
          };
        });

        expect(energy.cap).toBeGreaterThan(0);

        const energyRateText = ((await page.locator("#energyRate").textContent()) ?? "").trim();
        expect(energyRateText.length).toBeGreaterThan(0);

        // Either we're generating, consuming, or on infinite power; in all cases this save should have the energy system unlocked.
        expect(
          Math.abs(Number(energy.rate)) + Math.abs(Number(energy.consumption)) + Math.abs(Number(energy.qty))
        ).toBeGreaterThan(0);
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
