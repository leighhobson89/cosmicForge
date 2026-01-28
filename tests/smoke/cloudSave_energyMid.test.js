import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./smokeCloudLoadUtils.js";

describe("cloudSave_energyMid", () => {
  test(
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

        await createCloudLoadedGame({ page, port, pioneerId });

        await page.click("#tab2");

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

        await page.evaluate(() => {
          ["powerPlant1Option", "powerPlant2Option", "powerPlant3Option"].forEach((id) => {
            const el = document.getElementById(id);
            const row = el?.closest(".row-side-menu");
            row?.classList.remove("invisible");
          });
        });

        await page.click("#energyOption");

        await page.waitForSelector("#energyBattery1Row .building-purchase-button", { timeout: 60000 });
        await page.click("#energyBattery1Row .building-purchase-button");
        await page.waitForFunction(async () => {
          const mod = await import("/resourceDataObject.js");
          return (mod.resourceData?.buildings?.energy?.upgrades?.battery1?.quantity ?? 0) === 1;
        }, null, { timeout: 60000 });

        await page.waitForSelector("#energyBattery2Row .building-purchase-button", { timeout: 60000 });
        await page.click("#energyBattery2Row .building-purchase-button");
        await page.waitForFunction(async () => {
          const mod = await import("/resourceDataObject.js");
          return (mod.resourceData?.buildings?.energy?.upgrades?.battery2?.quantity ?? 0) === 1;
        }, null, { timeout: 60000 });

        await page.waitForSelector("#energyBattery3Row .building-purchase-button", { timeout: 60000 });
        await page.click("#energyBattery3Row .building-purchase-button");
        await page.waitForFunction(async () => {
          const mod = await import("/resourceDataObject.js");
          return (mod.resourceData?.buildings?.energy?.upgrades?.battery3?.quantity ?? 0) === 1;
        }, null, { timeout: 60000 });

        const batteryState = await page.evaluate(async () => {
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

        expect(batteryState.b1q).toBe(1);
        expect(batteryState.b2q).toBe(1);
        expect(batteryState.b3q).toBe(1);
        expect(batteryState.batteryBoughtYet).toBe(true);
        expect(batteryState.cap).toBe(batteryState.b1c + batteryState.b2c + batteryState.b3c);

        await page.click("#powerPlant3Option");
        await page.waitForSelector("#energyPowerPlant3Row .building-purchase-button", { timeout: 60000 });
        await page.click("#energyPowerPlant3Row .building-purchase-button");
        await page.waitForFunction(async () => {
          const mod = await import("/resourceDataObject.js");
          return (mod.resourceData?.buildings?.energy?.upgrades?.powerPlant3?.quantity ?? 0) === 1;
        }, null, { timeout: 60000 });

        await page.click("#powerPlant1Option");
        await page.waitForSelector("#energyPowerPlant1Row .building-purchase-button", { timeout: 60000 });
        await page.click("#energyPowerPlant1Row .building-purchase-button");
        await page.waitForFunction(async () => {
          const mod = await import("/resourceDataObject.js");
          return (mod.resourceData?.buildings?.energy?.upgrades?.powerPlant1?.quantity ?? 0) === 1;
        }, null, { timeout: 60000 });

        const plantsAfterBuy = await page.evaluate(async () => {
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

        expect(plantsAfterBuy.pp1q).toBe(1);
        expect(plantsAfterBuy.pp3q).toBe(1);
        expect(plantsAfterBuy.pp1Purchased).toBe(plantsAfterBuy.pp1r * plantsAfterBuy.pp1q);
        expect(plantsAfterBuy.pp3Purchased).toBe(plantsAfterBuy.pp3r * plantsAfterBuy.pp3q);
        expect(plantsAfterBuy.carbonUsed).toBe(0.03);
        expect(plantsAfterBuy.dieselUsed).toBe(0.01);

        await page.waitForFunction(() => {
          const el = document.getElementById("energyConsumptionStats");
          return el && !el.classList.contains("invisible");
        }, null, { timeout: 60000 });

        await page.click("#activateGridButton");

        await page.waitForFunction(async () => {
          const mod = await import("/resourceDataObject.js");
          return (mod.resourceData?.buildings?.energy?.rate ?? 0) > 0;
        }, null, { timeout: 60000 });

        const energyAfterPowerOn = await page.evaluate(async () => {
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

        const expectedGeneration = plantsAfterBuy.pp1Purchased + plantsAfterBuy.pp3Purchased;
        expect(Number(energyAfterPowerOn.rate)).toBeCloseTo(expectedGeneration, 10);
        expect(energyAfterPowerOn.cap).toBeGreaterThan(0);
        expect(energyAfterPowerOn.qty).toBeGreaterThanOrEqual(0);
        expect(energyAfterPowerOn.qty).toBeLessThanOrEqual(energyAfterPowerOn.cap);

        await page.waitForFunction(
          async (prevQty) => {
            const mod = await import("/resourceDataObject.js");
            const now = mod.resourceData?.buildings?.energy?.quantity ?? 0;
            return now > prevQty;
          },
          energyAfterPowerOn.qty,
          { timeout: 60000 }
        );

        await page.waitForFunction(
          async (prevCarbon) => {
            const mod = await import("/resourceDataObject.js");
            const now = mod.resourceData?.resources?.carbon?.quantity ?? 0;
            return now < prevCarbon;
          },
          energyAfterPowerOn.carbonQty,
          { timeout: 60000 }
        );

        await page.waitForFunction(
          async (prevDiesel) => {
            const mod = await import("/resourceDataObject.js");
            const now = mod.resourceData?.compounds?.diesel?.quantity ?? 0;
            return now < prevDiesel;
          },
          energyAfterPowerOn.dieselQty,
          { timeout: 60000 }
        );

        await page.evaluate(async () => {
          const globals = await import("/constantsAndGlobalVars.js");
          globals.setCurrentStarSystemWeatherEfficiency(["spica", 1, "sunny"]);
          globals.setWeatherEfficiencyApplied(false);
        });

        await page.click("#powerPlant2Option");
        await page.waitForSelector("#energyPowerPlant2Row .building-purchase-button", { timeout: 60000 });
        await page.click("#energyPowerPlant2Row .building-purchase-button");
        await page.waitForFunction(async () => {
          const mod = await import("/resourceDataObject.js");
          return (mod.resourceData?.buildings?.energy?.upgrades?.powerPlant2?.quantity ?? 0) === 1;
        }, null, { timeout: 60000 });

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
          await page.evaluate(async ({ type, eff }) => {
            const globals = await import("/constantsAndGlobalVars.js");
            const mod = await import("/resourceDataObject.js");

            const pp2 = mod.resourceData.buildings.energy.upgrades.powerPlant2;
            pp2.purchasedRate = pp2.maxPurchasedRate;
            globals.setCurrentStarSystemWeatherEfficiency(["spica", eff, type]);
            globals.setWeatherEfficiencyApplied(false);
          }, { type, eff });

          await page.waitForFunction(
            async ({ eff }) => {
              const mod = await import("/resourceDataObject.js");
              const pp2 = mod.resourceData?.buildings?.energy?.upgrades?.powerPlant2;
              return Math.abs((pp2?.purchasedRate ?? 0) - (pp2?.maxPurchasedRate ?? 0) * eff) < 1e-9;
            },
            { eff },
            { timeout: 60000 }
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
