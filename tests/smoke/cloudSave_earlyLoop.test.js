import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./smokeCloudLoadUtils.js";

describe("cloudSave_earlyLoop", () => {
  globalThis.smokeTest(
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

        await globalThis.smokeStep(
          "cloud-load save",
          async () => {
            await createCloudLoadedGame({ page, port, pioneerId });
          },
          { input: { pioneerId } }
        );

        await globalThis.smokeStep("open Resources tab", async () => {
          await page.click("#tab1");
        }, { input: { selector: "#tab1" } });

        await globalThis.smokeStep("open Hydrogen option", async () => {
          await page.click("#hydrogenOption");
        }, { input: { selector: "#hydrogenOption" } });

        const before = await globalThis.smokeStep("snapshot starting quantities", async () => {
          return await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return {
              h: mod.resourceData?.resources?.hydrogen?.quantity ?? 0,
              cap: mod.resourceData?.resources?.hydrogen?.storageCapacity ?? 0,
              cash: mod.resourceData?.currency?.cash ?? 0
            };
          });
        });

        await globalThis.smokeStep(
          "click Gain 1 Hydrogen",
          async () => {
            await page.locator("#hydrogenGainRow button").click();
          },
          { input: { selector: "#hydrogenGainRow button" } }
        );

        await globalThis.smokeStep(
          "wait for hydrogen to increase by 1",
          async () => {
            await page.waitForFunction(
              async (prev) => {
                const mod = await import("/resourceDataObject.js");
                const now = mod.resourceData?.resources?.hydrogen?.quantity ?? 0;
                return now >= prev + 1;
              },
              before.h,
              { timeout: 60000 }
            );
          },
          { input: { prevHydrogen: before.h } }
        );

        const cashBeforeSell = await globalThis.smokeStep("snapshot cash before Sell", async () => {
          return await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return mod.resourceData?.currency?.cash ?? 0;
          });
        });

        await globalThis.smokeStep(
          "click Sell Hydrogen",
          async () => {
            const sellButton = page.locator("#hydrogenSellRow").getByRole("button", { name: "Sell" });
            await sellButton.waitFor({ state: "visible", timeout: 60000 });
            await sellButton.click();
          },
          { input: { selector: "#hydrogenSellRow button[name=Sell]" } }
        );

        await globalThis.smokeStep(
          "wait for cash to be >= previous",
          async () => {
            await page.waitForFunction(
              async (prevCash) => {
                const mod = await import("/resourceDataObject.js");
                const cashNow = mod.resourceData?.currency?.cash ?? 0;
                return cashNow >= prevCash;
              },
              cashBeforeSell,
              { timeout: 60000 }
            );
          },
          { input: { prevCash: cashBeforeSell } }
        );

        const isFull = await globalThis.smokeStep("check if hydrogen storage is full", async () => {
          return await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            const q = mod.resourceData?.resources?.hydrogen?.quantity ?? 0;
            const cap = mod.resourceData?.resources?.hydrogen?.storageCapacity ?? 0;
            return cap > 0 && Math.floor(q) >= Math.floor(cap);
          });
        });

        if (isFull) {
          const capBefore = await globalThis.smokeStep("snapshot hydrogen capacity before Increase Storage", async () => {
            return await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              return mod.resourceData?.resources?.hydrogen?.storageCapacity ?? 0;
            });
          });

          await globalThis.smokeStep(
            "click Increase Storage",
            async () => {
              await page.getByRole("button", { name: "Increase Storage" }).click();
            },
            { input: { selector: "button[name=Increase Storage]" } }
          );

          await globalThis.smokeStep(
            "wait for storage capacity to increase",
            async () => {
              await page.waitForFunction(
                async (prevCap) => {
                  const mod = await import("/resourceDataObject.js");
                  const capNow = mod.resourceData?.resources?.hydrogen?.storageCapacity ?? 0;
                  return capNow > prevCap;
                },
                capBefore,
                { timeout: 60000 }
              );
            },
            { input: { prevCap: capBefore } }
          );
        }

        const after = await globalThis.smokeStep("snapshot end quantities", async () => {
          return await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return {
              h: mod.resourceData?.resources?.hydrogen?.quantity ?? 0,
              cap: mod.resourceData?.resources?.hydrogen?.storageCapacity ?? 0,
              cash: mod.resourceData?.currency?.cash ?? 0
            };
          });
        });

        await globalThis.smokeStep(
          "assert storage capacity positive and cash not decreased",
          async () => {
            expect(after.cap).toBeGreaterThan(0);
            expect(after.cash).toBeGreaterThanOrEqual(before.cash);
          },
          { input: { before, after } }
        );
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
