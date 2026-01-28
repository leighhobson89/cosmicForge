import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./smokeCloudLoadUtils.js";

describe("cloudSave_autobuyer", () => {
  globalThis.smokeTest(
    "buys autobuyers for all resources/compounds and validates rate/quantity + toggle effects",
    async () => {
      const pioneerId = "smoke_save_autobuyer_v1";
      const rootDir = path.resolve(process.cwd());
      let server, port, browser, context, page;

      const RESOURCES = ["hydrogen", "helium", "carbon", "neon", "oxygen", "silicon", "sodium", "iron"];
      const COMPOUNDS = ["diesel", "water", "glass", "concrete", "steel", "titanium"];

      const WAIT_PANE_MS = 150;
      const WAIT_TOGGLE_MS = 250;
      const WAIT_SETTLE_MS = 250;
      const SAMPLE_DELTA_MS = 600;

      const openPane = async (tabSelector, optionSelector) => {
        await page.click(tabSelector);
        await page.waitForSelector(optionSelector, { timeout: 60000, state: "attached" });

        await page.evaluate((optionSelector) => {
          const option = document.querySelector(optionSelector);
          if (!option) {
            throw new Error(`Option not found: ${optionSelector}`);
          }

          option.classList.remove("invisible");
          const row = option.closest(".row-side-menu");
          row?.classList.remove("invisible");
        }, optionSelector);

        await page.evaluate((optionSelector) => {
          const option = document.querySelector(optionSelector);
          option?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        }, optionSelector);

        await page.waitForTimeout(WAIT_PANE_MS);
      };

      const bootstrapSmokeModules = async () => {
        await page.evaluate(async () => {
          globalThis.__smokeMods = {
            rdo: await import("/resourceDataObject.js"),
            cg: await import("/constantsAndGlobalVars.js")
          };
        });
      };

      const stabilisePower = async () => {
        await page.evaluate(() => {
          const rdo = globalThis.__smokeMods?.rdo;
          const cg = globalThis.__smokeMods?.cg;
          if (!rdo || !cg) {
            throw new Error("Smoke modules not bootstrapped");
          }

          const energy = rdo.resourceData?.buildings?.energy;
          if (energy) {
            energy.batteryBoughtYet = true;
            energy.storageCapacity = 1000000000;
            energy.quantity = 1000000000;
            energy.rate = Math.max(energy.rate ?? 0, 1000000);
            energy.consumption = 0;

            const upgrades = energy.upgrades || {};
            // IMPORTANT: keep fossil-fuel plants OFF so the test doesn't consume carbon/diesel and make
            // resource quantity deltas negative.
            if (upgrades.powerPlant1) {
              upgrades.powerPlant1.quantity = Math.max(upgrades.powerPlant1.quantity ?? 0, 0);
              upgrades.powerPlant1.purchasedRate = 0;
            }
            if (upgrades.powerPlant2) {
              upgrades.powerPlant2.quantity = Math.max(upgrades.powerPlant2.quantity ?? 0, 1000);
              upgrades.powerPlant2.purchasedRate = Math.max(upgrades.powerPlant2.purchasedRate ?? 0, 1000000);
            }
            if (upgrades.powerPlant3) {
              upgrades.powerPlant3.quantity = Math.max(upgrades.powerPlant3.quantity ?? 0, 0);
              upgrades.powerPlant3.purchasedRate = 0;
            }
          }

          // Solar fuel is free, but make sure it exists anyway.
          const solar = rdo.resourceData?.resources?.solar;
          if (solar) {
            solar.storageCapacity = Math.max(solar.storageCapacity ?? 0, 1000000000);
            solar.quantity = Math.max(solar.quantity ?? 0, 1000000);
          }

          if (typeof cg.setTrippedStatus === "function") {
            cg.setTrippedStatus(false);
          }
          if (typeof cg.setPowerOnOff === "function") {
            cg.setPowerOnOff(true);
          }
          if (typeof cg.setBuildingTypeOnOff === "function") {
            cg.setBuildingTypeOnOff("powerPlant1", false);
            cg.setBuildingTypeOnOff("powerPlant2", true);
            cg.setBuildingTypeOnOff("powerPlant3", false);
          }
        });
      };

      const setTierActiveDirect = async (type, key, tier, active) => {
        await page.evaluate(({ type, key, tier, active }) => {
          const mod = globalThis.__smokeMods?.rdo;
          const entry = mod?.resourceData?.[type]?.[key];
          const tierKey = `tier${tier}`;
          if (entry?.upgrades?.autoBuyer?.[tierKey]) {
            entry.upgrades.autoBuyer[tierKey].active = Boolean(active);
          }
        }, { type, key, tier, active });
      };

      const assertPowerIsOn = async (label) => {
        const state = await page.evaluate(() => {
          const rdo = globalThis.__smokeMods?.rdo;
          const cg = globalThis.__smokeMods?.cg;
          return {
            powerOnOff: typeof cg?.getPowerOnOff === "function" ? Boolean(cg.getPowerOnOff()) : null,
            trippedStatus: typeof cg?.getTrippedStatus === "function" ? Boolean(cg.getTrippedStatus()) : null,
            battery: rdo?.resourceData?.buildings?.energy?.quantity ?? null,
            batteryCap: rdo?.resourceData?.buildings?.energy?.storageCapacity ?? null,
            consumption: rdo?.resourceData?.buildings?.energy?.consumption ?? null
          };
        });

        expect({ label, ...state }.trippedStatus).toBe(false);
        expect({ label, ...state }.powerOnOff).toBe(true);
        expect({ label, ...state }.battery).toBeGreaterThan(0);
      };

      const forceUnlockForTest = async () => {
        await page.evaluate(async ({ resources, compounds }) => {
          const cg = globalThis.__smokeMods?.cg || await import("/constantsAndGlobalVars.js");

          if (typeof cg.setTechUnlockedArrayDirect === "function") {
            const current = Array.isArray(cg.getTechUnlockedArray?.()) ? cg.getTechUnlockedArray() : [];
            const merged = Array.from(new Set([...current, "compounds"]));
            cg.setTechUnlockedArrayDirect(merged);
          }

          if (typeof cg.setUnlockedResourcesArray === "function") {
            resources.forEach((r) => cg.setUnlockedResourcesArray(r));
          }

          if (typeof cg.setUnlockedCompoundsArray === "function") {
            compounds.forEach((c) => cg.setUnlockedCompoundsArray(c));
          }
        }, { resources: RESOURCES, compounds: COMPOUNDS });
      };

      const readAutoBuyerTierConfig = async (type, key, tier) => {
        return await page.evaluate(async ({ type, key, tier }) => {
          const mod = globalThis.__smokeMods?.rdo || await import("/resourceDataObject.js");
          const entry = mod.resourceData?.[type]?.[key];
          const tierKey = `tier${tier}`;
          const tierInfo = entry?.upgrades?.autoBuyer?.[tierKey];
          return {
            rate: tierInfo?.rate ?? 0,
            price: tierInfo?.price ?? 0,
            energyUse: tierInfo?.energyUse ?? 0,
            currentTierLevel: entry?.upgrades?.autoBuyer?.currentTierLevel ?? 0,
            normalProgression: entry?.upgrades?.autoBuyer?.normalProgression ?? false
          };
        }, { type, key, tier });
      };

      const readState = async (type, key) => {
        return await page.evaluate(async ({ type, key }) => {
          const mod = globalThis.__smokeMods?.rdo || await import("/resourceDataObject.js");
          const cg = globalThis.__smokeMods?.cg || await import("/constantsAndGlobalVars.js");
          const entry = mod.resourceData?.[type]?.[key];
          return {
            quantity: entry?.quantity ?? 0,
            rate: entry?.rate ?? 0,
            energyConsumption: mod.resourceData?.buildings?.energy?.consumption ?? 0,
            totalEnergyUse: typeof cg.getTotalEnergyUse === "function" ? (cg.getTotalEnergyUse() ?? 0) : null
          };
        }, { type, key });
      };

      const setTierLevelDirect = async (type, key, value) => {
        await page.evaluate(async ({ type, key, value }) => {
          const mod = globalThis.__smokeMods?.rdo || await import("/resourceDataObject.js");
          const entry = mod.resourceData?.[type]?.[key];
          if (entry?.upgrades?.autoBuyer) {
            entry.upgrades.autoBuyer.currentTierLevel = value;
          }
        }, { type, key, value });

        await page.waitForTimeout(WAIT_SETTLE_MS);
      };

      const resetEconomyAndAutoBuyers = async () => {
        await page.evaluate(async ({ resources, compounds }) => {
          const mod = globalThis.__smokeMods?.rdo || await import("/resourceDataObject.js");
          const safeSet = (obj, path, value) => {
            let ref = obj;
            for (let i = 0; i < path.length - 1; i += 1) {
              if (!ref[path[i]]) ref[path[i]] = {};
              ref = ref[path[i]];
            }
            ref[path[path.length - 1]] = value;
          };

          safeSet(mod.resourceData, ["currency", "cash"], 1000000000);
          safeSet(mod.resourceData, ["buildings", "energy", "consumption"], 0);

          const wipe = (type, key) => {
            const entry = mod.resourceData?.[type]?.[key];
            if (!entry) return;
            entry.storageCapacity = 1000000000;
            entry.quantity = 1000000;
            if (entry.upgrades?.autoBuyer) {
              const ab = entry.upgrades.autoBuyer;
              ["tier1", "tier2", "tier3", "tier4"].forEach((tierKey) => {
                if (ab[tierKey]) {
                  ab[tierKey].quantity = 0;
                  ab[tierKey].active = true;
                }
              });
              if (ab.normalProgression === true) {
                ab.currentTierLevel = 4;
              }
            }
            entry.rate = 0;
          };

          resources.forEach((key) => wipe("resources", key));
          compounds.forEach((key) => wipe("compounds", key));
        }, { resources: RESOURCES, compounds: COMPOUNDS });
      };

      const ensureAffordable = async (type, key, price) => {
        await page.evaluate(async ({ type, key, price }) => {
          const mod = globalThis.__smokeMods?.rdo || await import("/resourceDataObject.js");
          const entry = mod.resourceData?.[type]?.[key];
          if (!entry) return;
          const p = Math.max(0, price ?? 0);
          entry.storageCapacity = Math.max(entry.storageCapacity ?? 0, 1000000000);
          entry.quantity = Math.max(entry.quantity ?? 0, p + 1000000);

          if (mod.resourceData?.currency) {
            mod.resourceData.currency.cash = Math.max(mod.resourceData.currency.cash ?? 0, p + 1000000);
          }
        }, { type, key, price });
      };

      const topUpAfterPurchase = async (type, key) => {
        await page.evaluate(async ({ type, key }) => {
          const mod = globalThis.__smokeMods?.rdo || await import("/resourceDataObject.js");
          const entry = mod.resourceData?.[type]?.[key];
          if (!entry) return;
          entry.storageCapacity = Math.max(entry.storageCapacity ?? 0, 1000000000);
          entry.quantity = Math.max(entry.quantity ?? 0, 0) + 1000000;

          if (mod.resourceData?.currency) {
            mod.resourceData.currency.cash = Math.max(mod.resourceData.currency.cash ?? 0, 0) + 1000000;
          }
        }, { type, key });
      };

      const buyTierViaUi = async (key, tier) => {
        const rowSelector = `#${key}AutoBuyer${tier}Row`;
        const buttonSelector = `${rowSelector} button[data-auto-buyer-tier='tier${tier}']`;
        const qtySelector = `#${key}AB${tier}Quantity`;

        await page.waitForSelector(buttonSelector, { timeout: 60000 });
        await page.click(buttonSelector);
        await page.waitForFunction(
          ({ qtySelector }) => {
            const text = document.querySelector(qtySelector)?.textContent ?? "";
            return text.includes("1");
          },
          { qtySelector },
          { timeout: 60000 }
        );

        await page.waitForTimeout(WAIT_SETTLE_MS);
      };

      const toggleTierViaUi = async (key, tier, enabled) => {
        const toggleSelector = `#${key}${tier}Toggle`;
        await page.waitForSelector(toggleSelector, { timeout: 60000, state: "attached" });

        await page.evaluate(({ toggleSelector, enabled }) => {
          const el = document.querySelector(toggleSelector);
          if (!el) {
            throw new Error(`Toggle not found: ${toggleSelector}`);
          }
          el.checked = Boolean(enabled);
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }, { toggleSelector, enabled });

        await page.waitForTimeout(WAIT_TOGGLE_MS);
      };

      const readQuantityOnly = async (type, key) => {
        return await page.evaluate(({ type, key }) => {
          const mod = globalThis.__smokeMods?.rdo;
          const entry = mod?.resourceData?.[type]?.[key];
          return entry?.quantity ?? 0;
        }, { type, key });
      };

      const readRateOnly = async (type, key) => {
        return await page.evaluate(({ type, key }) => {
          const mod = globalThis.__smokeMods?.rdo;
          const entry = mod?.resourceData?.[type]?.[key];
          return entry?.rate ?? 0;
        }, { type, key });
      };

      const readTierQuantity = async (type, key, tier) => {
        return await page.evaluate(({ type, key, tier }) => {
          const mod = globalThis.__smokeMods?.rdo;
          const entry = mod?.resourceData?.[type]?.[key];
          const tierKey = `tier${tier}`;
          return entry?.upgrades?.autoBuyer?.[tierKey]?.quantity ?? 0;
        }, { type, key, tier });
      };

      const readTierActive = async (type, key, tier) => {
        return await page.evaluate(({ type, key, tier }) => {
          const mod = globalThis.__smokeMods?.rdo;
          const entry = mod?.resourceData?.[type]?.[key];
          const tierKey = `tier${tier}`;
          return Boolean(entry?.upgrades?.autoBuyer?.[tierKey]?.active);
        }, { type, key, tier });
      };

      const measureQuantityDelta = async (type, key, ms) => {
        const q1 = await readQuantityOnly(type, key);
        await page.waitForTimeout(ms);
        const q2 = await readQuantityOnly(type, key);
        return { q1, q2, delta: q2 - q1 };
      };

      const waitForEnergyConsumptionDelta = async (expectedDelta, baseline, timeoutMs = 1000) => {
        if (!expectedDelta) {
          return baseline;
        }

        try {
          await page.waitForFunction(
            ({ expectedDelta, baseline }) => {
              const mod = globalThis.__smokeMods?.rdo;
              const current = mod?.resourceData?.buildings?.energy?.consumption ?? 0;
              const actual = (baseline ?? 0) - current;
              return Math.abs(actual - expectedDelta) < 0.01;
            },
            { expectedDelta, baseline },
            { timeout: timeoutMs }
          );
        } catch {
          // ignore; we'll do a best-effort assertion below
        }

        return await page.evaluate(() => {
          const mod = globalThis.__smokeMods?.rdo;
          return mod?.resourceData?.buildings?.energy?.consumption ?? 0;
        });
      };

      const assertTierToggleEffects = async (type, key, tier) => {
        const tierCfg = await readAutoBuyerTierConfig(type, key, tier);
        await page.waitForTimeout(WAIT_SETTLE_MS);

        // Assume newly bought tiers are ON; enforce it to avoid flakiness.
        await setTierActiveDirect(type, key, tier, true);
        await page.waitForTimeout(WAIT_SETTLE_MS);
        await assertPowerIsOn(`${type}:${key}:tier${tier}:onChecks`);

        const onState = await readState(type, key);
        const activeOn = await readTierActive(type, key, tier);
        expect(activeOn).toBe(true);

        const onDelta = type === "resources"
          ? await measureQuantityDelta(type, key, SAMPLE_DELTA_MS)
          : null;

        // Single transition: ON -> OFF, then do OFF checks and leave it OFF.
        await toggleTierViaUi(key, tier, false);
        await page.waitForTimeout(WAIT_SETTLE_MS);
        await assertPowerIsOn(`${type}:${key}:tier${tier}:offChecks`);

        const offState = await readState(type, key);
        const activeOff = await readTierActive(type, key, tier);
        expect(activeOff).toBe(false);

        const expectedConsumptionDelta = (tierCfg.energyUse ?? 0) * 1;
        const offConsumptionFinal = await waitForEnergyConsumptionDelta(
          expectedConsumptionDelta,
          onState.energyConsumption ?? 0,
          1000
        );
        const actualConsumptionDelta = (onState.energyConsumption ?? 0) - (offConsumptionFinal ?? 0);
        expect(actualConsumptionDelta).toBeGreaterThanOrEqual(0);
        if (expectedConsumptionDelta > 0) {
          expect(actualConsumptionDelta).toBeLessThanOrEqual(expectedConsumptionDelta + 0.05);
        }

        if (type === "resources") {
          const offDelta = await measureQuantityDelta(type, key, SAMPLE_DELTA_MS);
          expect(offDelta.delta).toBeLessThan(onDelta.delta);

          const expectedDropFloor = (tierCfg.rate ?? 0) * (SAMPLE_DELTA_MS / 1000) * 0.2;
          const actualDrop = onDelta.delta - offDelta.delta;
          if (expectedDropFloor > 0) {
            expect(actualDrop).toBeGreaterThan(expectedDropFloor);
          }
        }

        // Leave OFF.
        const finalActive = await readTierActive(type, key, tier);
        expect(finalActive).toBe(false);
      };

      const assertQuantityIncreases = async (type, key) => {
        await page.evaluate(async ({ type, key }) => {
          const mod = globalThis.__smokeMods?.rdo || await import("/resourceDataObject.js");
          const entry = mod.resourceData?.[type]?.[key];
          if (entry) {
            entry.quantity = 0;
          }
        }, { type, key });

        await assertPowerIsOn(`${type}:${key}:quantityIncreaseCheck`);

        const before = await readState(type, key);
        await page.waitForTimeout(800);
        const after = await readState(type, key);
        expect(after.quantity).toBeGreaterThan(before.quantity);

        await page.evaluate(async ({ type, key }) => {
          const mod = globalThis.__smokeMods?.rdo || await import("/resourceDataObject.js");
          const entry = mod.resourceData?.[type]?.[key];
          if (entry) {
            entry.storageCapacity = Math.max(entry.storageCapacity ?? 0, 1000000000);
            entry.quantity = Math.max(entry.quantity ?? 0, 1000000);
          }
        }, { type, key });
      };

      const restoreAllInputQuantities = async () => {
        await page.evaluate(async ({ resources, compounds }) => {
          const mod = globalThis.__smokeMods?.rdo || await import("/resourceDataObject.js");
          resources.forEach((k) => {
            const entry = mod.resourceData?.resources?.[k];
            if (!entry) return;
            entry.storageCapacity = 1000000000;
            entry.quantity = Math.max(entry.quantity ?? 0, 1000000);
          });
          compounds.forEach((k) => {
            const entry = mod.resourceData?.compounds?.[k];
            if (!entry) return;
            entry.storageCapacity = 1000000000;
            entry.quantity = Math.max(entry.quantity ?? 0, 1000000);
          });
          if (mod.resourceData?.currency) {
            mod.resourceData.currency.cash = Math.max(mod.resourceData.currency.cash ?? 0, 1000000000);
          }
        }, { resources: RESOURCES, compounds: COMPOUNDS });
      };

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

        await globalThis.smokeStep("bootstrap smoke modules", async () => {
          await bootstrapSmokeModules();
        });

        await globalThis.smokeStep("stabilise power (full battery + grid on)", async () => {
          await stabilisePower();
          await assertPowerIsOn("initial");
        });

        await globalThis.smokeStep("force-unlock panes for test", async () => {
          await forceUnlockForTest();
        });

        await globalThis.smokeStep("reset economy + autobuyers", async () => {
          await resetEconomyAndAutoBuyers();
        });

        await globalThis.smokeStep("re-stabilise power after reset", async () => {
          await stabilisePower();
          await assertPowerIsOn("post-reset");
        });

        await globalThis.smokeStep("assert water autobuyer rows never shown", async () => {
          await openPane("#tab4", "#waterOption");
          const rowIds = ["waterAutoBuyer1Row", "waterAutoBuyer2Row", "waterAutoBuyer3Row", "waterAutoBuyer4Row"];
          const results = await page.evaluate((ids) => {
            return ids.map((id) => {
              const el = document.getElementById(id);
              return {
                id,
                exists: Boolean(el),
                visible: Boolean(el && !el.classList.contains("invisible"))
              };
            });
          }, rowIds);
          results.forEach((r) => {
            expect(r.exists).toBe(true);
            expect(r.visible).toBe(false);
          });
        });

        for (const key of RESOURCES) {
          await globalThis.smokeStep(`open resource pane: ${key}`, async () => {
            await openPane("#tab1", `#${key}Option`);
          });

          await globalThis.smokeStep(`ensure resource tiers visible: ${key}`, async () => {
            await setTierLevelDirect("resources", key, 4);
          });

          for (let tier = 1; tier <= 4; tier += 1) {
            const tierCfg = await globalThis.smokeStep(`read config: ${key} tier${tier}`, async () => {
              return await readAutoBuyerTierConfig("resources", key, tier);
            });

            await globalThis.smokeStep(`ensure affordable: ${key} tier${tier}`, async () => {
              await ensureAffordable("resources", key, tierCfg.price);
            });

            await globalThis.smokeStep(`buy: ${key} tier${tier}`, async () => {
              await buyTierViaUi(key, tier);
              await topUpAfterPurchase("resources", key);
            });

            await globalThis.smokeStep(`assert tier purchased and production increases: ${key} tier${tier}`, async () => {
              expect(tierCfg.rate).toBeGreaterThan(0);
              const tierQty = await readTierQuantity("resources", key, tier);
              expect(tierQty).toBe(1);
              await assertQuantityIncreases("resources", key);
            });

            if (tier >= 2) {
              await globalThis.smokeStep(`toggle checks: ${key} tier${tier}`, async () => {
                await assertTierToggleEffects("resources", key, tier);
              });
            }

            await globalThis.smokeStep(`leave tier OFF: ${key} tier${tier}`, async () => {
              await setTierActiveDirect("resources", key, tier, false);
            });
          }
        }

        await globalThis.smokeStep("restore quantities for compound production", async () => {
          await restoreAllInputQuantities();
        });

        for (const key of COMPOUNDS) {
          if (key === "water") {
            continue;
          }

          await globalThis.smokeStep(`open compound pane: ${key}`, async () => {
            await openPane("#tab4", `#${key}Option`);
          });

          await globalThis.smokeStep(`ensure compound tiers visible: ${key}`, async () => {
            await setTierLevelDirect("compounds", key, 4);
          });

          for (let tier = 1; tier <= 4; tier += 1) {
            const tierCfg = await globalThis.smokeStep(`read config: ${key} tier${tier}`, async () => {
              return await readAutoBuyerTierConfig("compounds", key, tier);
            });

            await globalThis.smokeStep(`ensure affordable: ${key} tier${tier}`, async () => {
              await ensureAffordable("compounds", key, tierCfg.price);
            });

            await globalThis.smokeStep(`buy: ${key} tier${tier}`, async () => {
              await buyTierViaUi(key, tier);
              await topUpAfterPurchase("compounds", key);
            });

            await globalThis.smokeStep(`assert tier purchased and production increases: ${key} tier${tier}`, async () => {
              expect(tierCfg.rate).toBeGreaterThan(0);
              const delta = await measureQuantityDelta("compounds", key, 800);
              const tierQty = await readTierQuantity("compounds", key, tier);
              expect(tierQty).toBe(1);
              await assertQuantityIncreases("compounds", key);
            });

            if (tier >= 2) {
              await globalThis.smokeStep(`toggle checks: ${key} tier${tier}`, async () => {
                await assertTierToggleEffects("compounds", key, tier);
              });
            }

            await globalThis.smokeStep(`leave tier OFF: ${key} tier${tier}`, async () => {
              await setTierActiveDirect("compounds", key, tier, false);
            });
          }
        }
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    900000
  );
});
