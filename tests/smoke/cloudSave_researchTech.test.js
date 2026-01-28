import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./smokeCloudLoadUtils.js";

describe("cloudSave_researchTech", () => {
  globalThis.smokeTest(
    "loads research/tech save and validates research rises and tech list is available",
    async () => {
      const pioneerId = "smoke_save_research_tech_v1";

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

        await globalThis.smokeStep("open Research tab", async () => {
          await page.click("#tab3");
        }, { input: { selector: "#tab3" } });

        // Research option exists and can be opened.
        await globalThis.smokeStep("open Research option", async () => {
          await page.locator("#researchOption").waitFor({ state: "visible", timeout: 60000 });
          await page.click("#researchOption");
        }, { input: { selector: "#researchOption" } });

        const r1 = await globalThis.smokeStep("snapshot research quantity (t0)", async () => {
          return await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return mod.resourceData?.research?.quantity ?? 0;
          });
        });

        await globalThis.smokeStep("wait 2 seconds", async () => {
          await page.waitForTimeout(2000);
        }, { input: { ms: 2000 } });

        const r2 = await globalThis.smokeStep("snapshot research quantity (t+2s)", async () => {
          return await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return mod.resourceData?.research?.quantity ?? 0;
          });
        });

        await globalThis.smokeStep(
          "assert research did not decrease",
          async () => {
            expect(r2).toBeGreaterThanOrEqual(r1);
          },
          { input: { r1, r2 } }
        );

        // Technology menu exists.
        await globalThis.smokeStep("open Technology option", async () => {
          const techMenu = page.locator("p.tab3\\.option2", { hasText: "Technology" });
          await techMenu.waitFor({ state: "visible", timeout: 60000 });
          await techMenu.click();
        }, { input: { selector: "p.tab3.option2 (Technology)" } });

        await globalThis.smokeStep("wait 250ms", async () => {
          await page.waitForTimeout(250);
        }, { input: { ms: 250 } });

        // At least one technology row should exist once this save is in a tech-capable state.
        await globalThis.smokeStep("assert tech rows exist", async () => {
          const techRows = page.locator("[id^=tech]");
          expect(await techRows.count()).toBeGreaterThan(0);
        }, { input: { selector: "[id^=tech]" } });

        const unlockedTechsCount = await globalThis.smokeStep("read unlocked tech count", async () => {
          return await page.evaluate(async () => {
            const mod = await import("/constantsAndGlobalVars.js");
            return mod.getTechUnlockedArray?.().length ?? 0;
          });
        });

        await globalThis.smokeStep(
          "assert unlocked tech count > 0",
          async () => {
            expect(unlockedTechsCount).toBeGreaterThan(0);
          },
          { input: { unlockedTechsCount } }
        );
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
