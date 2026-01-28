import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./smokeCloudLoadUtils.js";

describe("cloudSave_autobuyer", () => {
  test(
    "buys autobuyer and validates rate + hydrogen increases over time",
    async () => {
      const pioneerId = "smoke_save_autobuyer_v1";
      const rootDir = path.resolve(process.cwd());
      let server, port, browser, context, page;

      // Initialize test environment
      const serverResult = await startStaticServer({ rootDir });
      server = serverResult.server;
      port = serverResult.port;

      browser = await chromium.launch({
        headless: process.env.HEADLESS === "1"
      });
      context = await browser.newContext();
      page = await context.newPage();

      try {
        // Load game state
        await createCloudLoadedGame({ page, port, pioneerId });

        // Navigate to hydrogen tab
        await page.click("#tab1");
        await page.click("#hydrogenOption");

        // Get autobuyer configuration
        const { tier1Rate, tier1Price } = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          const tier1 = mod.resourceData?.resources?.hydrogen?.upgrades?.autoBuyer?.tier1;
          return {
            tier1Rate: tier1?.rate ?? 0,
            tier1Price: tier1?.price ?? 0
          };
        });

        console.log(`Tier 1 Rate: ${tier1Rate}, Price: ${tier1Price}`);

        // Reset autobuyer state
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

        // Set sufficient hydrogen balance
        await page.evaluate(async (price) => {
          const mod = await import("/resourceDataObject.js");
          const required = Math.max(0, price);
          mod.resourceData.resources.hydrogen.quantity = Math.max(mod.resourceData.resources.hydrogen.quantity, required);
        }, tier1Price);

        // Purchase tier 1 autobuyer
        await page.waitForSelector("#hydrogenAutoBuyer1Row button[data-auto-buyer-tier='tier1']", { timeout: 60000 });
        await page.click("#hydrogenAutoBuyer1Row button[data-auto-buyer-tier='tier1']");

        await page.waitForFunction(() => {
          return document.getElementById("hydrogenAB1Quantity")?.textContent?.includes("1");
        }, null, { timeout: 60000 });

        // Validate purchase results
        const { tier1Quantity, hydrogenRate } = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          return {
            tier1Quantity: mod.resourceData?.resources?.hydrogen?.upgrades?.autoBuyer?.tier1?.quantity ?? 0,
            hydrogenRate: mod.resourceData?.resources?.hydrogen?.rate ?? 0
          };
        });

        console.log(`Auto-buyer Quantity: ${tier1Quantity}, Hydrogen Rate: ${hydrogenRate}`);

        expect(tier1Quantity).toBe(1);
        expect(tier1Rate).toBeGreaterThan(0);
        expect(hydrogenRate).toBeGreaterThan(0);

        // Verify hydrogen production over time
        const h1 = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          return mod.resourceData?.resources?.hydrogen?.quantity ?? 0;
        });

        console.log(`Initial Hydrogen: ${h1}`);

        await page.waitForTimeout(3000);

        const h2 = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          return mod.resourceData?.resources?.hydrogen?.quantity ?? 0;
        });

        console.log(`Final Hydrogen: ${h2}, Increase: ${h2 - h1}`);

        expect(h2).toBeGreaterThan(h1);
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
