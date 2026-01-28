import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./smokeCloudLoadUtils.js";
import { allure } from "allure-playwright";

describe("cloudSave_autobuyer", () => {
  test(
    "buys autobuyer and validates rate + hydrogen increases over time",
    async () => {
      const pioneerId = "smoke_save_autobuyer_v1";
      const rootDir = path.resolve(process.cwd());
      let server, port, browser, context, page;

      await allure.step("Setup test environment", async () => {
        const serverResult = await startStaticServer({ rootDir });
        server = serverResult.server;
        port = serverResult.port;

        browser = await chromium.launch({
          headless: process.env.HEADLESS === "1"
        });

        await allure.step("Initialize browser and page", async () => {
          context = await browser.newContext();
          page = await context.newPage();

          await allure.step("Create cloud loaded game", async () => {
            await createCloudLoadedGame({ page, port, pioneerId });
          });

          await allure.step("Navigate to hydrogen tab", async () => {
            await page.click("#tab1");
            await page.click("#hydrogenOption");
          });
        });
      });

      try {
        await allure.step("Get autobuyer tier data", async () => {
          const { tier1Rate, tier1Price } = await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            const tier1 = mod.resourceData?.resources?.hydrogen?.upgrades?.autoBuyer?.tier1;
            return {
              tier1Rate: tier1?.rate ?? 0,
              tier1Price: tier1?.price ?? 0
            };
          });

          await allure.step("Reset autobuyer quantities", async () => {
            await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              mod.resourceData.resources.hydrogen.upgrades.autoBuyer.tier1.quantity = 0;
              mod.resourceData.resources.hydrogen.upgrades.autoBuyer.tier2.quantity = 0;
              mod.resourceData.resources.hydrogen.upgrades.autoBuyer.tier3.quantity = 0;
              mod.resourceData.resources.hydrogen.upgrades.autoBuyer.tier4.quantity = 0;
              mod.resourceData.resources.hydrogen.upgrades.autoBuyer.tier1.active = true;
              mod.resourceData.resources.hydrogen.upgrades.autoBuyer.tier2.active = true;
              mod.resourceData.resources.hydrogen.upgrades.autoBuyer.tier3.active = true;
              mod.resourceData.resources.hydrogen.upgrades.autoBuyer.tier4.active = true;
              mod.resourceData.resources.hydrogen.rate = 0;
            });
          });

          await allure.step("Set sufficient hydrogen balance", async () => {
            await page.evaluate(async (price) => {
              const mod = await import("/resourceDataObject.js");
              const required = Math.max(0, price);
              mod.resourceData.resources.hydrogen.quantity = Math.max(mod.resourceData.resources.hydrogen.quantity, required);
            }, tier1Price);
          });

          await allure.step("Purchase tier 1 autobuyer", async () => {
            await page.waitForSelector("#hydrogenAutoBuyer1Row button[data-auto-buyer-tier='tier1']", { timeout: 60000 });
            await page.click("#hydrogenAutoBuyer1Row button[data-auto-buyer-tier='tier1']");

            await page.waitForFunction(() => {
              return document.getElementById("hydrogenAB1Quantity")?.textContent?.includes("1");
            }, null, { timeout: 60000 });
          });

          await allure.step("Validate purchase results", async () => {
            const { tier1Quantity, hydrogenRate } = await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              return {
                tier1Quantity: mod.resourceData?.resources?.hydrogen?.upgrades?.autoBuyer?.tier1?.quantity ?? 0,
                hydrogenRate: mod.resourceData?.resources?.hydrogen?.rate ?? 0
              };
            });

            expect(tier1Quantity).toBe(1);
            expect(tier1Rate).toBeGreaterThan(0);
            expect(hydrogenRate).toBeGreaterThan(0);
          });

          await allure.step("Verify hydrogen production over time", async () => {
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
          });
        });
      } finally {
        if (browser) await browser.close();
        if (server) await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
