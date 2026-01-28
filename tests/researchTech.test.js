import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./cloudLoadUtils.js";

describe("cloudSave_researchTech", () => {
  globalThis.smokeTest(
    "loads research/tech save and validates research rises and tech list is available",
    async () => {
      const pioneerId = "smoke_save_research_tech_v1";

      const initialResearch = 300;
      const initialCash = 1000000;

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

        await globalThis.smokeStep(
          "set deterministic starting state (research/cash/no techs/no science buildings)",
          async () => {
            return await page.evaluate(
              async ({ initialResearch, initialCash }) => {
                const globals = await import("/constantsAndGlobalVars.js");
                const mod = await import("/resourceDataObject.js");

                mod.setResourceDataObject(initialResearch, "research", ["quantity"]);
                mod.setResourceDataObject(initialCash, "currency", ["cash"]);

                mod.setResourceDataObject(0, "research", ["upgrades", "scienceKit", "quantity"]);
                mod.setResourceDataObject(true, "research", ["upgrades", "scienceKit", "active"]);
                mod.setResourceDataObject(0, "research", ["upgrades", "scienceClub", "quantity"]);
                mod.setResourceDataObject(true, "research", ["upgrades", "scienceClub", "active"]);

                if (globals.setTechUnlockedArrayDirect) {
                  globals.setTechUnlockedArrayDirect(["apAwardedThisRun"]);
                }
                if (globals.setBlackHoleAlwaysOn) {
                  globals.setBlackHoleAlwaysOn(false);
                }
                if (globals.setTimeWarpMultiplier) {
                  globals.setTimeWarpMultiplier(1);
                }

                const kitRate = mod.resourceData?.research?.upgrades?.scienceKit?.rate ?? 0;
                const clubRate = mod.resourceData?.research?.upgrades?.scienceClub?.rate ?? 0;

                return {
                  research: mod.resourceData?.research?.quantity ?? 0,
                  cash: mod.resourceData?.currency?.cash ?? 0,
                  techUnlockedCount: globals.getTechUnlockedArray?.().length ?? 0,
                  scienceKit: {
                    qty: mod.resourceData?.research?.upgrades?.scienceKit?.quantity ?? 0,
                    rate: kitRate
                  },
                  scienceClub: {
                    qty: mod.resourceData?.research?.upgrades?.scienceClub?.quantity ?? 0,
                    rate: clubRate
                  }
                };
              },
              { initialResearch, initialCash }
            );
          },
          { input: { initialResearch, initialCash } }
        );

        await globalThis.smokeStep("open Research tab", async () => {
          await page.click("#tab3");
        }, { input: { selector: "#tab3" } });

        // Research option exists and can be opened.
        await globalThis.smokeStep("open Research option", async () => {
          await page.locator("#researchOption").waitFor({ state: "visible", timeout: 60000 });
          await page.click("#researchOption");
        }, { input: { selector: "#researchOption" } });

        await globalThis.smokeStep(
          "assert Science Club row hidden before Knowledge Sharing",
          async () => {
            const state = await page.evaluate(() => {
              const row = document.getElementById("researchScienceClubRow");
              return {
                exists: Boolean(row),
                invisible: row?.classList.contains("invisible") ?? null
              };
            });

            expect(state.exists).toBe(true);
            expect(state.invisible).toBe(true);
            return state;
          }
        );

        await globalThis.smokeStep(
          "buy 3 Science Kits",
          async () => {
            const before = await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              return {
                cash: mod.resourceData?.currency?.cash ?? 0,
                scienceKitQty: mod.resourceData?.research?.upgrades?.scienceKit?.quantity ?? 0
              };
            });

            const btn = page.locator("#researchScienceKitRow button").first();
            await btn.waitFor({ state: "visible", timeout: 60000 });
            await btn.click();
            await btn.click();
            await btn.click();

            await page.waitForFunction(async () => {
              const mod = await import("/resourceDataObject.js");
              return (mod.resourceData?.research?.upgrades?.scienceKit?.quantity ?? 0) >= 3;
            }, null, { timeout: 60000 });

            const after = await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              return {
                cash: mod.resourceData?.currency?.cash ?? 0,
                scienceKitQty: mod.resourceData?.research?.upgrades?.scienceKit?.quantity ?? 0
              };
            });

            expect(after.scienceKitQty).toBeGreaterThanOrEqual(3);

            return { before, after };
          },
          { input: { qty: 3 } }
        );

        await globalThis.smokeStep(
          "verify research gain matches expected rate (Science Kits)",
          async () => {
            const baseline = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mod = await import("/resourceDataObject.js");

              const kit = mod.resourceData?.research?.upgrades?.scienceKit;
              const club = mod.resourceData?.research?.upgrades?.scienceClub;

              const timerRatio = globals.getTimerRateRatio?.() ?? 100;
              const warpMultiplier = (globals.getBlackHoleAlwaysOn?.() ? globals.getBlackHolePower?.() : globals.getTimeWarpMultiplier?.()) ?? 1;

              const expectedPerSecond = (
                (kit?.active ? (kit?.rate ?? 0) * (kit?.quantity ?? 0) : 0) +
                (club?.active ? (club?.rate ?? 0) * (club?.quantity ?? 0) : 0)
              ) * timerRatio * warpMultiplier;

              const displayed = (document.getElementById("researchRate")?.textContent ?? "").trim();
              const researchQty = mod.resourceData?.research?.quantity ?? 0;

              return {
                expectedPerSecond,
                researchQty,
                displayed,
                kit: { qty: kit?.quantity ?? 0, rate: kit?.rate ?? 0, active: kit?.active ?? false },
                club: { qty: club?.quantity ?? 0, rate: club?.rate ?? 0, active: club?.active ?? false }
              };
            });

            const t0 = Date.now();
            const r0 = baseline.researchQty;

            await page.waitForTimeout(2000);

            const after = await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              return mod.resourceData?.research?.quantity ?? 0;
            });

            const elapsedSec = (Date.now() - t0) / 1000;
            const delta = after - r0;
            const observedPerSecond = elapsedSec > 0 ? delta / elapsedSec : 0;

            expect(observedPerSecond).toBeGreaterThanOrEqual(baseline.expectedPerSecond * 0.75);
            expect(observedPerSecond).toBeLessThanOrEqual(baseline.expectedPerSecond * 1.25);

            return {
              baseline,
              afterResearchQty: after,
              elapsedSec,
              delta,
              observedPerSecond
            };
          }
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

        await globalThis.smokeStep(
          "assert tech rows exist",
          async () => {
            const techRows = page.locator("[id^=tech]");
            expect(await techRows.count()).toBeGreaterThan(0);
          },
          { input: { selector: "[id^=tech]" } }
        );

        await globalThis.smokeStep(
          "verify Knowledge Sharing is disabled when not enough research points",
          async () => {
            await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              mod.setResourceDataObject(100, "research", ["quantity"]);
            });

            await page.waitForTimeout(250);

            const state = await page.evaluate(() => {
              const row = document.getElementById("techKnowledgeSharingRow");
              const button = row?.querySelector("button");
              return {
                researchQtyText: String((window.resourceData?.research?.quantity ?? "") || ""),
                buttonText: button?.textContent ?? "",
                classList: button ? Array.from(button.classList) : []
              };
            });

            expect(state.buttonText).toContain("Research");
            expect(state.classList).toContain("red-disabled-text");

            return state;
          },
          { input: { researchQty: 100 } }
        );

        await globalThis.smokeStep(
          "verify Fusion Theory remains disabled when prerequisite is missing",
          async () => {
            await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              mod.setResourceDataObject(1000, "research", ["quantity"]);
            });

            await page.waitForTimeout(250);

            const state = await page.evaluate(() => {
              const row = document.getElementById("techFusionTheoryRow");
              const button = row?.querySelector("button");
              return {
                rowExists: Boolean(row),
                rowInvisible: row?.classList.contains("invisible") ?? null,
                buttonText: button?.textContent ?? "",
                classList: button ? Array.from(button.classList) : []
              };
            });

            expect(state.rowExists).toBe(true);
            expect(state.buttonText).toContain("Research");
            expect(state.classList).toContain("red-disabled-text");

            return state;
          }
        );

        await globalThis.smokeStep(
          "set research points high enough to research Knowledge Sharing",
          async () => {
            return await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              const before = mod.resourceData?.research?.quantity ?? 0;
              mod.setResourceDataObject(300, "research", ["quantity"]);
              const after = mod.resourceData?.research?.quantity ?? 0;
              return { before, after };
            });
          },
          { input: { researchQty: 300 } }
        );

        await globalThis.smokeStep(
          "research Knowledge Sharing",
          async () => {
            const before = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mod = await import("/resourceDataObject.js");
              const button = document.querySelector("#techKnowledgeSharingRow button");
              return {
                researchQty: mod.resourceData?.research?.quantity ?? 0,
                unlocked: globals.getTechUnlockedArray?.().includes("knowledgeSharing") ?? false,
                buttonText: button?.textContent ?? "",
                classList: button ? Array.from(button.classList) : []
              };
            });

            const btn = page.locator("#techKnowledgeSharingRow button").first();
            await btn.waitFor({ state: "visible", timeout: 60000 });
            await btn.click();

            await page.waitForFunction(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              return globals.getTechUnlockedArray?.().includes("knowledgeSharing") ?? false;
            }, null, { timeout: 60000 });

            const after = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mod = await import("/resourceDataObject.js");
              const button = document.querySelector("#techKnowledgeSharingRow button");
              const style = button ? getComputedStyle(button) : null;
              return {
                researchQty: mod.resourceData?.research?.quantity ?? 0,
                unlocked: globals.getTechUnlockedArray?.().includes("knowledgeSharing") ?? false,
                buttonText: button?.textContent ?? "",
                classList: button ? Array.from(button.classList) : [],
                pointerEvents: style?.pointerEvents ?? null
              };
            });

            expect(after.unlocked).toBe(true);
            expect(after.buttonText).toContain("Researched");
            expect(after.classList).toContain("green-ready-text");
            expect(after.pointerEvents).toBe("none");

            return { before, after };
          }
        );

        await globalThis.smokeStep(
          "handle Knowledge Sharing unlocked modal popup",
          async () => {
            await page.waitForTimeout(300);

            const modalConfirm = page.locator("#modalConfirm");
            const isVisible = await modalConfirm.isVisible({ timeout: 3000 }).catch(() => false);
            if (!isVisible) return { shown: false };

            const headerText = ((await page.locator(".modal-header h4").textContent()) ?? "").trim().toLowerCase();
            const bodyText = ((await page.locator(".modal-content p").textContent()) ?? "").trim().toLowerCase();

            const looksLikeKnowledgeSharing = headerText.includes("knowledge") || bodyText.includes("science clubs");
            if (!looksLikeKnowledgeSharing) {
              return { shown: true, dismissed: false, headerText, bodyText };
            }

            await modalConfirm.click();
            await page.locator("#overlay").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});

            return { shown: true, dismissed: true, headerText, bodyText };
          },
          { input: {} }
        );

        await globalThis.smokeStep(
          "verify Fusion Theory becomes visible but disabled when not enough research points",
          async () => {
            await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              mod.setResourceDataObject(600, "research", ["quantity"]);
            });
            await page.locator("#techFusionTheoryRow").waitFor({ state: "visible", timeout: 60000 });
            await page.waitForTimeout(250);

            const state = await page.evaluate(() => {
              const row = document.getElementById("techFusionTheoryRow");
              const button = row?.querySelector("button");
              return {
                rowInvisible: row?.classList.contains("invisible") ?? null,
                buttonText: button?.textContent ?? "",
                classList: button ? Array.from(button.classList) : []
              };
            });

            expect(state.rowInvisible).toBe(false);
            expect(state.buttonText).toContain("Research");
            expect(state.classList).toContain("red-disabled-text");

            return state;
          },
          { input: { researchQty: 600 } }
        );

        await globalThis.smokeStep(
          "research Fusion Theory",
          async () => {
            await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              mod.setResourceDataObject(1000, "research", ["quantity"]);
            });

            await page.waitForTimeout(250);

            await page.locator("#overlay").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});

            const before = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mod = await import("/resourceDataObject.js");
              const button = document.querySelector("#techFusionTheoryRow button");
              return {
                researchQty: mod.resourceData?.research?.quantity ?? 0,
                unlocked: globals.getTechUnlockedArray?.().includes("fusionTheory") ?? false,
                buttonText: button?.textContent ?? "",
                classList: button ? Array.from(button.classList) : []
              };
            });

            const btn = page.locator("#techFusionTheoryRow button").first();
            await btn.waitFor({ state: "visible", timeout: 60000 });
            await btn.click();

            await page.waitForFunction(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              return globals.getTechUnlockedArray?.().includes("fusionTheory") ?? false;
            }, null, { timeout: 60000 });

            const after = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mod = await import("/resourceDataObject.js");
              const button = document.querySelector("#techFusionTheoryRow button");
              const style = button ? getComputedStyle(button) : null;
              return {
                researchQty: mod.resourceData?.research?.quantity ?? 0,
                unlocked: globals.getTechUnlockedArray?.().includes("fusionTheory") ?? false,
                buttonText: button?.textContent ?? "",
                classList: button ? Array.from(button.classList) : [],
                pointerEvents: style?.pointerEvents ?? null
              };
            });

            expect(after.unlocked).toBe(true);
            expect(after.buttonText).toContain("Researched");
            expect(after.pointerEvents).toBe("none");

            return { before, after };
          }
        );

        await globalThis.smokeStep(
          "open Tech Tree option",
          async () => {
            const techTreeMenu = page.locator("p.tab3\\.option3", { hasText: "Tech Tree" });
            await techTreeMenu.waitFor({ state: "visible", timeout: 60000 });
            await techTreeMenu.click();
            await page.locator("#techTreeNativeContainer").waitFor({ state: "visible", timeout: 60000 });
          },
          { input: { selector: "p.tab3.option3 (Tech Tree)" } }
        );

        await globalThis.smokeStep(
          "verify Tech Tree fusionTheory node is researched and styled correctly",
          async () => {
            const state = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              await globals.getTechTreeDataAndDraw?.();
              const node = document.querySelector('.native-tech-node[data-tech-key="fusionTheory"]');
              const statusTag = node?.querySelector('.native-tech-status')?.textContent ?? null;
              const title = node?.querySelector('.native-tech-title')?.textContent ?? null;
              return {
                exists: Boolean(node),
                classList: node ? Array.from(node.classList) : [],
                statusTag,
                title
              };
            });

            expect(state.exists).toBe(true);
            expect(state.classList).toContain("native-tech-researched");
            expect(state.statusTag).toBe("RESEARCHED");

            return state;
          }
        );

        await globalThis.smokeStep(
          "open Research option (after Knowledge Sharing) and buy 2 Science Clubs",
          async () => {
            await page.click("#researchOption");

            const clubRowState = await page.evaluate(() => {
              const row = document.getElementById("researchScienceClubRow");
              return {
                exists: Boolean(row),
                invisible: row?.classList.contains("invisible") ?? null
              };
            });

            expect(clubRowState.exists).toBe(true);
            expect(clubRowState.invisible).toBe(false);

            const btn = page.locator("#researchScienceClubRow button").first();
            await btn.waitFor({ state: "visible", timeout: 60000 });

            const before = await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              return {
                cash: mod.resourceData?.currency?.cash ?? 0,
                scienceClubQty: mod.resourceData?.research?.upgrades?.scienceClub?.quantity ?? 0,
                researchQty: mod.resourceData?.research?.quantity ?? 0
              };
            });

            await btn.click();
            await btn.click();

            await page.waitForFunction(async () => {
              const mod = await import("/resourceDataObject.js");
              return (mod.resourceData?.research?.upgrades?.scienceClub?.quantity ?? 0) >= 2;
            }, null, { timeout: 60000 });

            const after = await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              return {
                cash: mod.resourceData?.currency?.cash ?? 0,
                scienceClubQty: mod.resourceData?.research?.upgrades?.scienceClub?.quantity ?? 0,
                researchQty: mod.resourceData?.research?.quantity ?? 0,
                researchRateText: (document.getElementById("researchRate")?.textContent ?? "").trim()
              };
            });

            expect(after.scienceClubQty).toBeGreaterThanOrEqual(2);
            return { clubRowState, before, after };
          },
          { input: { qty: 2 } }
        );

        await globalThis.smokeStep(
          "verify research gain matches expected rate (Science Kits + Clubs)",
          async () => {
            const baseline = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mod = await import("/resourceDataObject.js");

              const kit = mod.resourceData?.research?.upgrades?.scienceKit;
              const club = mod.resourceData?.research?.upgrades?.scienceClub;

              const timerRatio = globals.getTimerRateRatio?.() ?? 100;
              const warpMultiplier = (globals.getBlackHoleAlwaysOn?.() ? globals.getBlackHolePower?.() : globals.getTimeWarpMultiplier?.()) ?? 1;

              const expectedPerSecond = (
                (kit?.active ? (kit?.rate ?? 0) * (kit?.quantity ?? 0) : 0) +
                (club?.active ? (club?.rate ?? 0) * (club?.quantity ?? 0) : 0)
              ) * timerRatio * warpMultiplier;

              const researchQty = mod.resourceData?.research?.quantity ?? 0;
              const displayed = (document.getElementById("researchRate")?.textContent ?? "").trim();
              return {
                expectedPerSecond,
                researchQty,
                displayed,
                kit: { qty: kit?.quantity ?? 0, rate: kit?.rate ?? 0, active: kit?.active ?? false },
                club: { qty: club?.quantity ?? 0, rate: club?.rate ?? 0, active: club?.active ?? false }
              };
            });

            const t0 = Date.now();
            const r0 = baseline.researchQty;

            await page.waitForTimeout(1000);

            const after = await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              return mod.resourceData?.research?.quantity ?? 0;
            });

            const elapsedSec = (Date.now() - t0) / 1000;
            const delta = after - r0;
            const observedPerSecond = elapsedSec > 0 ? delta / elapsedSec : 0;

            expect(observedPerSecond).toBeGreaterThanOrEqual(baseline.expectedPerSecond * 0.8);
            expect(observedPerSecond).toBeLessThanOrEqual(baseline.expectedPerSecond * 1.2);

            return {
              baseline,
              afterResearchQty: after,
              elapsedSec,
              delta,
              observedPerSecond
            };
          }
        );
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
