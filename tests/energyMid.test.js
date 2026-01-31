import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./cloudLoadUtils.js";

describe("cloudSave_energyMid", () => {
  globalThis.smokeTest(
    "builds batteries + power plants and validates generation, charging, and fuel burn",
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

        await global.smokeStep(
          "cloud-load save",
          async () => {
            await createCloudLoadedGame({ page, port, pioneerId });
          },
          { input: { pioneerId } }
        );

        await global.smokeStep("open Energy tab", async () => {
          await page.click("#tab2");
        });

        await global.smokeStep(
          "reset energy purchases + seed resources/tech",
          async () => {
            await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const data = await import("/resourceDataObject.js");

              const current = Array.isArray(globals.getTechUnlockedArray?.())
                ? globals.getTechUnlockedArray()
                : [];
              const techs = new Set(current);
              techs.add("basicPowerGeneration");
              techs.add("sodiumIonPowerStorage");
              techs.add("advancedPowerGeneration");
              techs.add("solarPowerGeneration");
              globals.setTechUnlockedArrayDirect(Array.from(techs));

              globals.setPowerOnOff(false);
              globals.setBuildingTypeOnOff("powerPlant1", false);
              globals.setBuildingTypeOnOff("powerPlant2", false);
              globals.setBuildingTypeOnOff("powerPlant3", false);
              globals.setWeatherEfficiencyApplied(false);

              data.resourceData.currency.cash = Math.max(data.resourceData.currency.cash ?? 0, 1e12);
              data.resourceData.resources.sodium.quantity = Math.max(data.resourceData.resources.sodium.quantity ?? 0, 1e9);
              data.resourceData.resources.carbon.quantity = Math.max(data.resourceData.resources.carbon.quantity ?? 0, 1e9);
              data.resourceData.resources.carbon.usedForFuelPerSec = 0;
              data.resourceData.compounds.diesel.quantity = Math.max(data.resourceData.compounds.diesel.quantity ?? 0, 1e9);
              data.resourceData.compounds.diesel.usedForFuelPerSec = 0;
              data.resourceData.compounds.glass.quantity = Math.max(data.resourceData.compounds.glass.quantity ?? 0, 1e9);
              data.resourceData.compounds.steel.quantity = Math.max(data.resourceData.compounds.steel.quantity ?? 0, 1e9);

              data.resourceData.buildings.energy.batteryBoughtYet = false;
              data.resourceData.buildings.energy.quantity = 0;
              data.resourceData.buildings.energy.rate = 0;
              data.resourceData.buildings.energy.consumption = 0;
              data.resourceData.buildings.energy.storageCapacity = 0;

              data.resourceData.buildings.energy.upgrades.battery1.quantity = 0;
              data.resourceData.buildings.energy.upgrades.battery2.quantity = 0;
              data.resourceData.buildings.energy.upgrades.battery3.quantity = 0;

              data.resourceData.buildings.energy.upgrades.powerPlant1.quantity = 0;
              data.resourceData.buildings.energy.upgrades.powerPlant1.purchasedRate = 0;
              data.resourceData.buildings.energy.upgrades.powerPlant1.maxPurchasedRate = 0;

              data.resourceData.buildings.energy.upgrades.powerPlant2.quantity = 0;
              data.resourceData.buildings.energy.upgrades.powerPlant2.purchasedRate = 0;
              data.resourceData.buildings.energy.upgrades.powerPlant2.maxPurchasedRate = 0;

              data.resourceData.buildings.energy.upgrades.powerPlant3.quantity = 0;
              data.resourceData.buildings.energy.upgrades.powerPlant3.purchasedRate = 0;
              data.resourceData.buildings.energy.upgrades.powerPlant3.maxPurchasedRate = 0;
            });
          },
          {
            input: {
              techs: [
                "basicPowerGeneration",
                "sodiumIonPowerStorage",
                "advancedPowerGeneration",
                "solarPowerGeneration"
              ]
            }
          }
        );

        await global.smokeStep("force Energy sidebar options visible", async () => {
          await page.evaluate(() => {
            ["powerPlant1Option", "powerPlant2Option", "powerPlant3Option"].forEach((id) => {
              const el = document.getElementById(id);
              const row = el?.closest(".row-side-menu");
              row?.classList.remove("invisible");
            });
          });
        });

        await global.smokeStep("open Energy Storage option pane", async () => {
          await page.click("#energyOption");
        });

        await global.smokeStep("buy Battery 1", async () => {
          await page.waitForSelector("#energyBattery1Row .building-purchase-button", { timeout: 60000 });
          await page.click("#energyBattery1Row .building-purchase-button");
          await page.waitForFunction(async () => {
            const mod = await import("/resourceDataObject.js");
            return (mod.resourceData?.buildings?.energy?.upgrades?.battery1?.quantity ?? 0) === 1;
          }, null, { timeout: 60000 });

          const battery1Qty = await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return (mod.resourceData?.buildings?.energy?.upgrades?.battery1?.quantity ?? 0);
          });
          expect(battery1Qty).toBe(1);
          return { expectedBattery1Qty: 1, battery1Qty };
        });

        await global.smokeStep("buy Battery 2", async () => {
          await page.waitForSelector("#energyBattery2Row .building-purchase-button", { timeout: 60000 });
          await page.click("#energyBattery2Row .building-purchase-button");
          await page.waitForFunction(async () => {
            const mod = await import("/resourceDataObject.js");
            return (mod.resourceData?.buildings?.energy?.upgrades?.battery2?.quantity ?? 0) === 1;
          }, null, { timeout: 60000 });

          const battery2Qty = await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return (mod.resourceData?.buildings?.energy?.upgrades?.battery2?.quantity ?? 0);
          });
          expect(battery2Qty).toBe(1);
          return { expectedBattery2Qty: 1, battery2Qty };
        });

        await global.smokeStep("buy Battery 3", async () => {
          await page.waitForSelector("#energyBattery3Row .building-purchase-button", { timeout: 60000 });
          await page.click("#energyBattery3Row .building-purchase-button");
          await page.waitForFunction(async () => {
            const mod = await import("/resourceDataObject.js");
            return (mod.resourceData?.buildings?.energy?.upgrades?.battery3?.quantity ?? 0) === 1;
          }, null, { timeout: 60000 });

          const battery3Qty = await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return (mod.resourceData?.buildings?.energy?.upgrades?.battery3?.quantity ?? 0);
          });
          expect(battery3Qty).toBe(1);
          return { expectedBattery3Qty: 1, battery3Qty };
        });

        const batteryState = await global.smokeStep(
          "assert batteries and capacity",
          async () => {
            return await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              const b = mod.resourceData?.buildings?.energy;
              const b1 = b?.upgrades?.battery1;
              const b2 = b?.upgrades?.battery2;
              const b3 = b?.upgrades?.battery3;
              return {
                cap: b?.storageCapacity ?? 0,
                b1q: b1?.quantity ?? 0,
                b2q: b2?.quantity ?? 0,
                b3q: b3?.quantity ?? 0,
                b1c: b1?.capacity ?? 0,
                b2c: b2?.capacity ?? 0,
                b3c: b3?.capacity ?? 0,
                batteryBoughtYet: Boolean(b?.batteryBoughtYet)
              };
            });
          }
        );

        expect(batteryState.b1q).toBe(1);
        expect(batteryState.b2q).toBe(1);
        expect(batteryState.b3q).toBe(1);
        expect(batteryState.batteryBoughtYet).toBe(true);
        expect(batteryState.cap).toBe(batteryState.b1c + batteryState.b2c + batteryState.b3c);

        await global.smokeStep("buy Advanced Power Plant (powerPlant3)", async () => {
          await page.click("#powerPlant3Option");
          await page.waitForSelector("#energyPowerPlant3Row .building-purchase-button", { timeout: 60000 });
          await page.click("#energyPowerPlant3Row .building-purchase-button");
          await page.waitForFunction(async () => {
            const mod = await import("/resourceDataObject.js");
            return (mod.resourceData?.buildings?.energy?.upgrades?.powerPlant3?.quantity ?? 0) === 1;
          }, null, { timeout: 60000 });

          const powerPlant3Qty = await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return (mod.resourceData?.buildings?.energy?.upgrades?.powerPlant3?.quantity ?? 0);
          });
          expect(powerPlant3Qty).toBe(1);
          return { expectedPowerPlant3Qty: 1, powerPlant3Qty };
        });

        await global.smokeStep("buy Basic Power Plant (powerPlant1)", async () => {
          await page.click("#powerPlant1Option");
          await page.waitForSelector("#energyPowerPlant1Row .building-purchase-button", { timeout: 60000 });
          await page.click("#energyPowerPlant1Row .building-purchase-button");
          await page.waitForFunction(async () => {
            const mod = await import("/resourceDataObject.js");
            return (mod.resourceData?.buildings?.energy?.upgrades?.powerPlant1?.quantity ?? 0) === 1;
          }, null, { timeout: 60000 });

          const powerPlant1Qty = await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return (mod.resourceData?.buildings?.energy?.upgrades?.powerPlant1?.quantity ?? 0);
          });
          expect(powerPlant1Qty).toBe(1);
          return { expectedPowerPlant1Qty: 1, powerPlant1Qty };
        });

        const plantsAfterBuy = await global.smokeStep(
          "assert plant purchased rates + fuel burn baselines",
          async () => {
            return await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              const e = mod.resourceData?.buildings?.energy;
              const pp1 = e?.upgrades?.powerPlant1;
              const pp2 = e?.upgrades?.powerPlant2;
              const pp3 = e?.upgrades?.powerPlant3;
              const carbon = mod.resourceData?.resources?.carbon;
              const diesel = mod.resourceData?.compounds?.diesel;
              return {
                pp1q: pp1?.quantity ?? 0,
                pp3q: pp3?.quantity ?? 0,
                pp1r: pp1?.rate ?? 0,
                pp3r: pp3?.rate ?? 0,
                pp1Purchased: pp1?.purchasedRate ?? 0,
                pp3Purchased: pp3?.purchasedRate ?? 0,
                carbonUsed: carbon?.usedForFuelPerSec ?? 0,
                dieselUsed: diesel?.usedForFuelPerSec ?? 0,
                pp2Max: pp2?.maxPurchasedRate ?? 0,
                pp2Purchased: pp2?.purchasedRate ?? 0
              };
            });
          }
        );

        expect(plantsAfterBuy.pp1q).toBe(1);
        expect(plantsAfterBuy.pp3q).toBe(1);
        expect(plantsAfterBuy.pp1Purchased).toBe(plantsAfterBuy.pp1r * plantsAfterBuy.pp1q);
        expect(plantsAfterBuy.pp3Purchased).toBe(plantsAfterBuy.pp3r * plantsAfterBuy.pp3q);
        expect(plantsAfterBuy.carbonUsed).toBe(0.03);
        expect(plantsAfterBuy.dieselUsed).toBe(0.01);

        await global.smokeStep("wait for power stats panel", async () => {
          await page.waitForFunction(() => {
            const el = document.getElementById("energyConsumptionStats");
            return el && !el.classList.contains("invisible");
          }, null, { timeout: 60000 });

          const powerStatsVisible = await page.evaluate(() => {
            const el = document.getElementById("energyConsumptionStats");
            return Boolean(el && !el.classList.contains("invisible"));
          });
          expect(powerStatsVisible).toBe(true);
          return { powerStatsVisible };
        });

        await global.smokeStep("toggle grid Power On", async () => {
          await page.click("#activateGridButton");
        });

        await global.smokeStep("wait for energy generation rate > 0", async () => {
          await page.waitForFunction(async () => {
            const mod = await import("/resourceDataObject.js");
            return (mod.resourceData?.buildings?.energy?.rate ?? 0) > 0;
          }, null, { timeout: 60000 });

          const energyRateNow = await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return (mod.resourceData?.buildings?.energy?.rate ?? 0);
          });
          expect(energyRateNow).toBeGreaterThan(0);
          return { energyRateNow };
        });

        const energyAfterPowerOn = await global.smokeStep(
          "snapshot energy + fuel quantities after power on",
          async () => {
            return await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              return {
                qty: mod.resourceData?.buildings?.energy?.quantity ?? 0,
                cap: mod.resourceData?.buildings?.energy?.storageCapacity ?? 0,
                rate: mod.resourceData?.buildings?.energy?.rate ?? 0,
                consumption: mod.resourceData?.buildings?.energy?.consumption ?? 0,
                carbonQty: mod.resourceData?.resources?.carbon?.quantity ?? 0,
                dieselQty: mod.resourceData?.compounds?.diesel?.quantity ?? 0
              };
            });
          }
        );

        const expectedGeneration = plantsAfterBuy.pp1Purchased + plantsAfterBuy.pp3Purchased;
        await global.smokeStep(
          "assert expected total generation",
          async () => {
            expect(Number(energyAfterPowerOn.rate)).toBeCloseTo(expectedGeneration, 10);
          },
          { input: { expectedGeneration }, output: { actualGeneration: energyAfterPowerOn.rate } }
        );
        expect(energyAfterPowerOn.cap).toBeGreaterThan(0);
        expect(energyAfterPowerOn.qty).toBeGreaterThanOrEqual(0);
        expect(energyAfterPowerOn.qty).toBeLessThanOrEqual(energyAfterPowerOn.cap);

        await global.smokeStep(
          "assert battery is charging (energy quantity increases)",
          async () => {
            const prevQty = Number(energyAfterPowerOn.qty);
            const timeoutMs = 60000;
            const pollIntervalMs = 200;
            const startedAt = Date.now();

            let nowEnergyQty = prevQty;
            while (Date.now() - startedAt < timeoutMs) {
              await page.waitForTimeout(pollIntervalMs);
              nowEnergyQty = await page.evaluate(async () => {
                const mod = await import("/resourceDataObject.js");
                return mod.resourceData?.buildings?.energy?.quantity ?? 0;
              });
              if (Number(nowEnergyQty) > prevQty) {
                break;
              }
            }

            expect(Number(nowEnergyQty)).toBeGreaterThan(prevQty);

            return { prevEnergyQty: prevQty, nowEnergyQty };
          },
          { input: { prevEnergyQty: energyAfterPowerOn.qty } }
        );

        await global.smokeStep(
          "assert carbon is being consumed",
          async () => {
            await page.waitForFunction(
              async (prevCarbon) => {
                const mod = await import("/resourceDataObject.js");
                const now = mod.resourceData?.resources?.carbon?.quantity ?? 0;
                return now < prevCarbon;
              },
              energyAfterPowerOn.carbonQty,
              { timeout: 60000 }
            );

            const nowCarbonQty = await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              return mod.resourceData?.resources?.carbon?.quantity ?? 0;
            });

            expect(Number(nowCarbonQty)).toBeLessThan(Number(energyAfterPowerOn.carbonQty));

            return { prevCarbonQty: energyAfterPowerOn.carbonQty, nowCarbonQty };
          },
          { input: { prevCarbonQty: energyAfterPowerOn.carbonQty } }
        );

        await global.smokeStep(
          "assert diesel is being consumed",
          async () => {
            await page.waitForFunction(
              async (prevDiesel) => {
                const mod = await import("/resourceDataObject.js");
                const now = mod.resourceData?.compounds?.diesel?.quantity ?? 0;
                return now < prevDiesel;
              },
              energyAfterPowerOn.dieselQty,
              { timeout: 60000 }
            );

            const nowDieselQty = await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              return mod.resourceData?.compounds?.diesel?.quantity ?? 0;
            });

            expect(Number(nowDieselQty)).toBeLessThan(Number(energyAfterPowerOn.dieselQty));

            return { prevDieselQty: energyAfterPowerOn.dieselQty, nowDieselQty };
          },
          { input: { prevDieselQty: energyAfterPowerOn.dieselQty } }
        );

        await global.smokeStep("set weather sunny (100%)", async () => {
          await page.evaluate(async () => {
            const globals = await import("/constantsAndGlobalVars.js");
            globals.setCurrentStarSystemWeatherEfficiency(["spica", 1, "sunny"]);
            globals.setWeatherEfficiencyApplied(false);
          });
        });

        await global.smokeStep("buy Solar Power Plant (powerPlant2)", async () => {
          await page.click("#powerPlant2Option");
          await page.waitForSelector("#energyPowerPlant2Row .building-purchase-button", { timeout: 60000 });
          await page.click("#energyPowerPlant2Row .building-purchase-button");
          await page.waitForFunction(async () => {
            const mod = await import("/resourceDataObject.js");
            return (mod.resourceData?.buildings?.energy?.upgrades?.powerPlant2?.quantity ?? 0) === 1;
          }, null, { timeout: 60000 });

          const powerPlant2Qty = await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return (mod.resourceData?.buildings?.energy?.upgrades?.powerPlant2?.quantity ?? 0);
          });
          expect(powerPlant2Qty).toBe(1);
          return { expectedPowerPlant2Qty: 1, powerPlant2Qty };
        });

        const solarRates = await page.evaluate(async () => {
          const mod = await import("/resourceDataObject.js");
          const pp2 = mod.resourceData?.buildings?.energy?.upgrades?.powerPlant2;
          return {
            maxPurchased: pp2?.maxPurchasedRate ?? 0,
            purchased: pp2?.purchasedRate ?? 0
          };
        });

        expect(solarRates.maxPurchased).toBeGreaterThan(0);
        expect(solarRates.purchased).toBeCloseTo(solarRates.maxPurchased * 1, 10);

        const weatherChecks = [
          { type: "sunny", eff: 1 },
          { type: "cloudy", eff: 0.75 },
          { type: "rain", eff: 0.5 },
          { type: "volcano", eff: 0.1 }
        ];

        for (const { type, eff } of weatherChecks) {
          await global.smokeStep(
            `solar weather scaling (${type})`,
            async () => {
              const beforeRates = await page.evaluate(async () => {
                const mod = await import("/resourceDataObject.js");
                const pp2 = mod.resourceData?.buildings?.energy?.upgrades?.powerPlant2;
                return {
                  maxPurchased: pp2?.maxPurchasedRate ?? 0,
                  purchased: pp2?.purchasedRate ?? 0
                };
              });

              await page.evaluate(async ({ type, eff }) => {
                const globals = await import("/constantsAndGlobalVars.js");
                const game = await import("/game.js");

                globals.setCurrentStarSystemWeatherEfficiency(["spica", eff, type]);
                globals.setWeatherEfficiencyApplied(false);

                // Deterministically recompute purchasedRate for powerPlant2 based on current weather.
                // This avoids races with the autonomous weather timer / energy tick.
                game.addBuildingPotentialRate("powerPlant2");

                // Prevent updateEnergyDelta from applying the weather multiplier a second time.
                globals.setWeatherEfficiencyApplied(true);
              }, { type, eff });

              const afterState = await page.evaluate(async () => {
                const globals = await import("/constantsAndGlobalVars.js");
                const mod = await import("/resourceDataObject.js");
                const pp2 = mod.resourceData?.buildings?.energy?.upgrades?.powerPlant2;
                const weather = globals.getCurrentStarSystemWeatherEfficiency?.() ?? [];
                return {
                  afterRates: {
                    maxPurchased: pp2?.maxPurchasedRate ?? 0,
                    purchased: pp2?.purchasedRate ?? 0
                  },
                  currentWeather: {
                    system: weather[0],
                    eff: weather[1],
                    type: weather[2]
                  }
                };
              });

              expect(afterState.currentWeather.type).toBe(type);
              expect(Number(afterState.afterRates.purchased)).toBeCloseTo(
                Number(afterState.afterRates.maxPurchased) * Number(afterState.currentWeather.eff),
                10
              );

              return { beforeRates, afterState };
            },
            { input: { type, eff } }
          );
        }

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
