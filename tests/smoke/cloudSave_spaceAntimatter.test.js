import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./smokeCloudLoadUtils.js";

describe("cloudSave_spaceAntimatter", () => {
  globalThis.smokeTest(
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

        await globalThis.smokeStep(
          "cloud-load save",
          async () => {
            await createCloudLoadedGame({ page, port, pioneerId });
          },
          { input: { pioneerId } }
        );

        // Space Mining tab
        await globalThis.smokeStep("open Space Mining tab", async () => {
          await page.click("#tab6");
        }, { input: { selector: "#tab6" } });

        await globalThis.smokeStep("wait for mining UI", async () => {
          await page.locator("#miningQuantity").waitFor({ state: "visible", timeout: 60000 });
        }, { input: { selector: "#miningQuantity" } });

        const a1 = await globalThis.smokeStep("snapshot antimatter quantity (t0)", async () => {
          return await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return mod.resourceData?.antimatter?.quantity ?? 0;
          });
        });

        // If a rocket is actively mining, antimatter should rise over time.
        await globalThis.smokeStep("wait 3 seconds", async () => {
          await page.waitForTimeout(3000);
        }, { input: { ms: 3000 } });

        const a2 = await globalThis.smokeStep("snapshot antimatter quantity (t+3s)", async () => {
          return await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return mod.resourceData?.antimatter?.quantity ?? 0;
          });
        });

        const miningText = await globalThis.smokeStep("read miningQuantity text", async () => {
          return ((await page.locator("#miningQuantity").textContent()) ?? "").trim();
        });
        await globalThis.smokeStep(
          "assert miningQuantity text is non-empty",
          async () => {
            expect(miningText.length).toBeGreaterThan(0);
          },
          { input: { miningText } }
        );

        // Allow equal in case the save is set up with mining UI unlocked but rockets idle.
        await globalThis.smokeStep(
          "assert antimatter did not decrease",
          async () => {
            expect(a2).toBeGreaterThanOrEqual(a1);
          },
          { input: { a1, a2 } }
        );

        // Sanity: launch pad/asteroids UI should exist once this save is in space-mining state.
        await globalThis.smokeStep("wait for Space Telescope option", async () => {
          await page.locator("#spaceTelescopeOption").waitFor({ state: "visible", timeout: 60000 });
        }, { input: { selector: "#spaceTelescopeOption" } });
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
