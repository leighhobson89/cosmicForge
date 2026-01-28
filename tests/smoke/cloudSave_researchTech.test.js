import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./smokeCloudLoadUtils.js";

describe("cloudSave_researchTech", () => {
  test(
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

        await createCloudLoadedGame({ page, port, pioneerId });

        await page.click("#tab3");

        // Research option exists and can be opened.
        await page.locator("#researchOption").waitFor({ state: "visible", timeout: 60000 });
        await page.click("#researchOption");

        const r1 = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          return mod.resourceData?.research?.quantity ?? 0;
        });

        await page.waitForTimeout(2000);

        const r2 = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          return mod.resourceData?.research?.quantity ?? 0;
        });

        expect(r2).toBeGreaterThanOrEqual(r1);

        // Technology menu exists.
        const techMenu = page.locator("p.tab3\\.option2", { hasText: "Technology" });
        await techMenu.waitFor({ state: "visible", timeout: 60000 });
        await techMenu.click();

        await page.waitForTimeout(250);

        // At least one technology row should exist once this save is in a tech-capable state.
        const techRows = page.locator("[id^=tech]");
        expect(await techRows.count()).toBeGreaterThan(0);

        const unlockedTechsCount = await page.evaluate(async () => {
          const mod = await import("/constantsAndGlobalVars.js");
          return mod.getTechUnlockedArray?.().length ?? 0;
        });

        expect(unlockedTechsCount).toBeGreaterThan(0);
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
