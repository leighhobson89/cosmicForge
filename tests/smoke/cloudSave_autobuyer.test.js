import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./smokeCloudLoadUtils.js";

describe("cloudSave_autobuyer", () => {
  globalThis.smokeTest(
    "buys autobuyer and validates rate + hydrogen increases over time",
    async () => {
      const pioneerId = "smoke_save_autobuyer_v1";
      const rootDir = path.resolve(process.cwd());
      let server, port, browser, context, page;

      await globalThis.smokeStep("start static server", async () => {
        const serverResult = await startStaticServer({ rootDir });
        server = serverResult.server;
        port = serverResult.port;
      }, { input: { rootDir } });

      await globalThis.smokeStep("launch browser", async () => {
        browser = await chromium.launch({
          headless: process.env.HEADLESS === "1"
        });
        context = await browser.newContext();
        page = await context.newPage();
      }, { input: { headless: process.env.HEADLESS === "1" } });

      try {
        await globalThis.smokeStep(
          "cloud-load save",
          async () => {
            await createCloudLoadedGame({ page, port, pioneerId });
          },
          { input: { pioneerId } }
        );

        await globalThis.smokeStep("open Hydrogen pane", async () => {
          await page.click("#tab1");
          await page.click("#hydrogenOption");
        }, { input: { selectors: ["#tab1", "#hydrogenOption"] } });

        const { tier1Rate, tier1Price } = await globalThis.smokeStep("read tier1 autobuyer config", async () => {
          return await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            const tier1 = mod.resourceData?.resources?.hydrogen?.upgrades?.autoBuyer?.tier1;
            return {
              tier1Rate: tier1?.rate ?? 0,
              tier1Price: tier1?.price ?? 0
            };
          });
        });

        await globalThis.smokeStep(
          "reset autobuyer state (all tiers qty=0, active=true, hydrogen.rate=0)",
          async () => {
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
          },
          { input: { tier1Rate, tier1Price } }
        );

        await globalThis.smokeStep(
          "ensure enough hydrogen to afford tier1",
          async () => {
            await page.evaluate(async (price) => {
              const mod = await import("/resourceDataObject.js");
              const required = Math.max(0, price);
              mod.resourceData.resources.hydrogen.quantity = Math.max(
                mod.resourceData.resources.hydrogen.quantity,
                required
              );
            }, tier1Price);
          },
          { input: { requiredHydrogen: tier1Price } }
        );

        await globalThis.smokeStep(
          "buy tier1 autobuyer via UI",
          async () => {
            await page.waitForSelector("#hydrogenAutoBuyer1Row button[data-auto-buyer-tier='tier1']", { timeout: 60000 });
            await page.click("#hydrogenAutoBuyer1Row button[data-auto-buyer-tier='tier1']");
            await page.waitForFunction(() => {
              return document.getElementById("hydrogenAB1Quantity")?.textContent?.includes("1");
            }, null, { timeout: 60000 });
          },
          { input: { selector: "#hydrogenAutoBuyer1Row button[data-auto-buyer-tier='tier1']" } }
        );

        const { tier1Quantity, hydrogenRate } = await globalThis.smokeStep(
          "read autobuyer quantity + hydrogen rate",
          async () => {
            return await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              return {
                tier1Quantity: mod.resourceData?.resources?.hydrogen?.upgrades?.autoBuyer?.tier1?.quantity ?? 0,
                hydrogenRate: mod.resourceData?.resources?.hydrogen?.rate ?? 0
              };
            });
          }
        );

        await globalThis.smokeStep(
          "assert autobuyer purchased and rate positive",
          async () => {
            expect(tier1Quantity).toBe(1);
            expect(tier1Rate).toBeGreaterThan(0);
            expect(hydrogenRate).toBeGreaterThan(0);
          },
          { input: { tier1Quantity, tier1Rate, hydrogenRate } }
        );

        const h1 = await globalThis.smokeStep("read hydrogen quantity (t0)", async () => {
          return await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return mod.resourceData?.resources?.hydrogen?.quantity ?? 0;
          });
        });

        await globalThis.smokeStep("wait 3 seconds", async () => {
          await page.waitForTimeout(3000);
        }, { input: { ms: 3000 } });

        const h2 = await globalThis.smokeStep("read hydrogen quantity (t+3s)", async () => {
          return await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return mod.resourceData?.resources?.hydrogen?.quantity ?? 0;
          });
        });

        await globalThis.smokeStep(
          "assert hydrogen increased",
          async () => {
            expect(h2).toBeGreaterThan(h1);
          },
          { input: { h1, h2, delta: h2 - h1 } }
        );
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
