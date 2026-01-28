import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer, createCloudLoadedGame } from "./smokeCloudLoadUtils.js";

describe("cloudSave_spaceAntimatter", () => {
  globalThis.smokeTest(
    "loads space/antimatter save and validates mining UI + antimatter quantity",
    async () => {
      const pioneerId = "smoke_save_space_antimatter_v1";
      const initialAntimatter = 80000;
      const timeWarpParams = { durationMs: 5000, multiplier: 500 };
      const shortTimerMs = 900;

      const rootDir = path.resolve(process.cwd());
      const { server, port } = await startStaticServer({ rootDir });

      const browser = await chromium.launch({
        headless: process.env.HEADLESS === "1"
      });

      try {
        const context = await browser.newContext();
        const page = await context.newPage();

        const runTimeWarp = async () => {
          await page.bringToFront().catch(() => {});
          await page.evaluate(async ({ durationMs, multiplier }) => {
            try {
              Document.prototype.hasFocus = () => true;
              Object.defineProperty(document, "hidden", { get: () => false, configurable: true });
              Object.defineProperty(document, "visibilityState", { get: () => "visible", configurable: true });
            } catch {
              // best-effort only
            }
            const game = await import("/game.js");
            game.timeWarp(durationMs, multiplier);
          }, timeWarpParams);

          await page.waitForTimeout(timeWarpParams.durationMs + 50);

          await page.waitForFunction(async () => {
            const globals = await import("/constantsAndGlobalVars.js");
            return (globals.getTimeWarpMultiplier?.() ?? 1) === 1;
          }, null, { timeout: 60000 });
        };

        const shortenRocketTravelTimerToOneSecond = async (rocket) => {
          return await page.evaluate(async ({ rocket, shortTimerMs }) => {
            const globals = await import("/constantsAndGlobalVars.js");
            const game = await import("/game.js");
            const { timerManagerDelta } = await import("/timerManagerDelta.js");
            const before = {
              timeLeftMs: globals.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.(rocket) ?? null,
              travelDurationMs: globals.getRocketTravelDuration?.()?.[rocket] ?? null,
              travelling: globals.getCurrentlyTravellingToAsteroid?.(rocket) ?? null,
              direction: globals.getRocketDirection?.(rocket) ?? null
            };

            // IMPORTANT: the travel timer closure tracks its own `timeRemaining` and will overwrite
            // the global time-left on the next tick. To reliably shorten, remove and restart the timer
            // with an adjustment that sets the initial remaining duration.
            const isReturning = (globals.getRocketDirection?.(rocket) ?? false) === true;
            const timerName = isReturning ? `${rocket}TravelReturnTimer` : `${rocket}TravelToAsteroidTimer`;
            if (timerManagerDelta?.hasTimer?.(timerName)) {
              timerManagerDelta.removeTimer(timerName);
            }
            if (isReturning) {
              game.startTravelToAndFromAsteroidTimer([shortTimerMs, "test"], rocket, true);
            } else {
              game.startTravelToAndFromAsteroidTimer([shortTimerMs, "test"], rocket, false);
              globals.setRocketDirection?.(rocket, false);
            }

            const after = {
              timeLeftMs: globals.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.(rocket) ?? null,
              travelDurationMs: globals.getRocketTravelDuration?.()?.[rocket] ?? null,
              travelling: globals.getCurrentlyTravellingToAsteroid?.(rocket) ?? null,
              direction: globals.getRocketDirection?.(rocket) ?? null
            };

            return { before, after };
          }, { rocket, shortTimerMs });
        };

        const advanceDeltaTimersNaturally = async (ms) => {
          return await page.evaluate(async ({ ms }) => {
            const { timerManagerDelta } = await import("/timerManagerDelta.js");
            const beforeCount = timerManagerDelta?.timers?.size ?? null;
            // Drive the delta timers forward using multiplier=1 (i.e. not timewarp).
            // Many timers are repeat:true and use onUpdate to decrement their own timeRemaining.
            timerManagerDelta.update(ms, 1);
            timerManagerDelta.update(1, 1);
            const afterCount = timerManagerDelta?.timers?.size ?? null;
            return { beforeCount, afterCount, advancedMs: ms };
          }, { ms });
        };

        await globalThis.smokeStep(
          "cloud-load save",
          async () => {
            await createCloudLoadedGame({ page, port, pioneerId });
          },
          { input: { pioneerId } }
        );

        // Space Mining tab
        await globalThis.smokeStep("open Space Mining tab", async () => {
          await page.click("#tab6");
        }, { input: { selector: "#tab6" } });

        await globalThis.smokeStep(
          "set deterministic antimatter baseline",
          async () => {
            return await page.evaluate(async ({ initialAntimatter }) => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mod = await import("/resourceDataObject.js");
              mod.setResourceDataObject(initialAntimatter, "antimatter", ["quantity"]);
              if (globals.setMegaStructureAntimatterAmount) {
                globals.setMegaStructureAntimatterAmount(0);
              }
              if (globals.setTimeWarpMultiplier) {
                globals.setTimeWarpMultiplier(1);
              }
              return {
                antimatterQty: mod.resourceData?.antimatter?.quantity ?? 0,
                megaStructureAntimatterAmount: globals.getMegaStructureAntimatterAmount?.() ?? null,
                timeWarpMultiplier: globals.getTimeWarpMultiplier?.() ?? null
              };
            }, { initialAntimatter });
          },
          { input: { initialAntimatter } }
        );

        await globalThis.smokeStep("open Launch Pad to reveal rockets", async () => {
          await page.locator("#launchPadOption").waitFor({ state: "visible", timeout: 60000 });
          await page.click("#launchPadOption");
          await page.waitForTimeout(200);
        }, { input: { selector: "#launchPadOption" } });

        await globalThis.smokeStep("wait for rocket options", async () => {
          await page.locator("#rocket1").waitFor({ state: "visible", timeout: 60000 });
          await page.locator("#rocket2").waitFor({ state: "visible", timeout: 60000 });
        }, { input: { selectors: ["#rocket1", "#rocket2"] } });

        const rocketSidebarNames = await globalThis.smokeStep(
          "assert player has rockets Test1 + Test2",
          async () => {
            const rocket1Name = ((await page.locator("#rocket1").textContent()) ?? "").trim();
            const rocket2Name = ((await page.locator("#rocket2").textContent()) ?? "").trim();
            expect(rocket1Name).toBe("Test1");
            expect(rocket2Name).toBe("Test2");
            return { rocket1Name, rocket2Name };
          }
        );

        await globalThis.smokeStep(
          "assert rockets are built + launched",
          async () => {
            const state = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              return {
                rocketsBuilt: globals.getRocketsBuilt?.() ?? [],
                launchedRockets: globals.getLaunchedRockets?.() ?? []
              };
            });
            expect(state.rocketsBuilt).toContain("rocket1");
            expect(state.rocketsBuilt).toContain("rocket2");
            expect(state.launchedRockets).toContain("rocket1");
            expect(state.launchedRockets).toContain("rocket2");
            return state;
          },
          { input: { expected: { rocketsBuilt: ["rocket1", "rocket2"], launchedRockets: ["rocket1", "rocket2"] } } }
        );

        await globalThis.smokeStep("open Rocket 1 option", async () => {
          await page.click("#rocket1");
          await page.locator("#rocket1TravelDropdown").waitFor({ state: "visible", timeout: 60000 });
        }, { input: { selector: "#rocket1" } });

        const rocket1Destination = await globalThis.smokeStep(
          "select rocket1 destination asteroid",
          async () => {
            const dropdown = page.locator("#rocket1TravelDropdown .dropdown").first();
            await dropdown.click();
            const firstOption = page.locator("#rocket1TravelDropdown .dropdown-options .dropdown-option").first();
            await firstOption.waitFor({ state: "visible", timeout: 60000 });
            const asteroidName = (await firstOption.getAttribute("data-value")) ?? "";
            await firstOption.click();
            await page.waitForFunction(async ({ asteroidName }) => {
              const globals = await import("/constantsAndGlobalVars.js");
              return (globals.getDestinationAsteroid?.("rocket1") ?? null) === asteroidName;
            }, { asteroidName }, { timeout: 60000 });

            const after = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              return {
                destination: globals.getDestinationAsteroid?.("rocket1") ?? null,
                currentDropdownText: globals.getCurrentDestinationDropdownText?.() ?? null
              };
            });

            expect(asteroidName.length).toBeGreaterThan(0);
            expect(after.destination).toBe(asteroidName);
            return { asteroidName, after };
          }
        );

        await globalThis.smokeStep(
          "travel rocket1 to asteroid",
          async () => {
            const btn = page.locator(".rocket1-travel-to-asteroid-button").first();
            await btn.waitFor({ state: "visible", timeout: 60000 });

            const before = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              return {
                timeLeftMs: globals.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.("rocket1") ?? null,
                currentlyTravelling: globals.getCurrentlyTravellingToAsteroid?.("rocket1") ?? null
              };
            });

            await btn.click();
            await page.waitForTimeout(150);

            const after = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const progressContainer = document.getElementById("spaceTravelToAsteroidProgressBarRocket1Container");
              const progressBar = document.getElementById("spaceTravelToAsteroidProgressBarRocket1");
              return {
                timeLeftMs: globals.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.("rocket1") ?? null,
                currentlyTravelling: globals.getCurrentlyTravellingToAsteroid?.("rocket1") ?? null,
                progressContainerInvisible: progressContainer?.classList.contains("invisible") ?? null,
                progressWidth: progressBar?.style?.width ?? null
              };
            });

            expect(after.currentlyTravelling).toBe(true);
            expect(after.progressContainerInvisible).toBe(false);
            expect(typeof after.timeLeftMs).toBe("number");
            expect(after.timeLeftMs).toBeGreaterThan(0);

            return { before, after };
          },
          { input: { rocket: "rocket1", destination: rocket1Destination.asteroidName } }
        );

        await globalThis.smokeStep("open Rocket 2 option", async () => {
          await page.click("#rocket2");
          await page.locator("#rocket2TravelDropdown").waitFor({ state: "visible", timeout: 60000 });
        }, { input: { selector: "#rocket2" } });

        const rocket2Destination = await globalThis.smokeStep(
          "select rocket2 destination asteroid",
          async () => {
            const dropdown = page.locator("#rocket2TravelDropdown .dropdown").first();
            await dropdown.click();
            const firstOption = page.locator("#rocket2TravelDropdown .dropdown-options .dropdown-option").first();
            await firstOption.waitFor({ state: "visible", timeout: 60000 });
            const asteroidName = (await firstOption.getAttribute("data-value")) ?? "";
            await firstOption.click();
            await page.waitForTimeout(100);

            const after = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              return {
                destination: globals.getDestinationAsteroid?.("rocket2") ?? null,
                currentDropdownText: globals.getCurrentDestinationDropdownText?.() ?? null
              };
            });

            expect(asteroidName.length).toBeGreaterThan(0);
            expect(after.destination).toBe(asteroidName);
            return { asteroidName, after };
          }
        );

        await globalThis.smokeStep(
          "travel rocket2 to asteroid",
          async () => {
            const btn = page.locator(".rocket2-travel-to-asteroid-button").first();
            await btn.waitFor({ state: "visible", timeout: 60000 });

            const before = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              return {
                timeLeftMs: globals.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.("rocket2") ?? null,
                currentlyTravelling: globals.getCurrentlyTravellingToAsteroid?.("rocket2") ?? null
              };
            });

            await btn.click();
            await page.waitForTimeout(150);

            const after = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const progressContainer = document.getElementById("spaceTravelToAsteroidProgressBarRocket2Container");
              const progressBar = document.getElementById("spaceTravelToAsteroidProgressBarRocket2");
              return {
                timeLeftMs: globals.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.("rocket2") ?? null,
                currentlyTravelling: globals.getCurrentlyTravellingToAsteroid?.("rocket2") ?? null,
                progressContainerInvisible: progressContainer?.classList.contains("invisible") ?? null,
                progressWidth: progressBar?.style?.width ?? null
              };
            });

            expect(after.currentlyTravelling).toBe(true);
            expect(after.progressContainerInvisible).toBe(false);
            expect(typeof after.timeLeftMs).toBe("number");
            expect(after.timeLeftMs).toBeGreaterThan(0);

            return { before, after };
          },
          { input: { rocket: "rocket2", destination: rocket2Destination.asteroidName } }
        );

        await globalThis.smokeStep(
          "shorten rocket travel timers to 1s and wait for natural arrival (mining starts)",
          async () => {
            const before = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              return {
                rocket1: {
                  travelling: globals.getCurrentlyTravellingToAsteroid?.("rocket1") ?? null,
                  destination: globals.getDestinationAsteroid?.("rocket1") ?? null,
                  mining: globals.getMiningObject?.()?.rocket1 ?? null,
                  timeLeftMs: globals.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.("rocket1") ?? null
                },
                rocket2: {
                  travelling: globals.getCurrentlyTravellingToAsteroid?.("rocket2") ?? null,
                  destination: globals.getDestinationAsteroid?.("rocket2") ?? null,
                  mining: globals.getMiningObject?.()?.rocket2 ?? null,
                  timeLeftMs: globals.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.("rocket2") ?? null
                }
              };
            });

            const shorten1 = await shortenRocketTravelTimerToOneSecond("rocket1");
            const shorten2 = await shortenRocketTravelTimerToOneSecond("rocket2");

            // Headless note: the main RAF loop may not tick reliably. We simulate ~1s of natural time
            // by directly advancing the delta timer manager with multiplier=1.
            const advanced = await advanceDeltaTimersNaturally(shortTimerMs + 350);

            await page.waitForFunction(async ({ r1Dest, r2Dest }) => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mining = globals.getMiningObject?.() ?? {};
              return mining.rocket1 === r1Dest && mining.rocket2 === r2Dest;
            }, { r1Dest: rocket1Destination.asteroidName, r2Dest: rocket2Destination.asteroidName }, { timeout: 60000 });

            const after = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mining = globals.getMiningObject?.() ?? {};
              return {
                miningObject: mining,
                rocket1: {
                  travelling: globals.getCurrentlyTravellingToAsteroid?.("rocket1") ?? null,
                  destination: globals.getDestinationAsteroid?.("rocket1") ?? null,
                  mining: mining.rocket1 ?? null,
                  timeLeftMs: globals.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.("rocket1") ?? null
                },
                rocket2: {
                  travelling: globals.getCurrentlyTravellingToAsteroid?.("rocket2") ?? null,
                  destination: globals.getDestinationAsteroid?.("rocket2") ?? null,
                  mining: mining.rocket2 ?? null,
                  timeLeftMs: globals.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.("rocket2") ?? null
                }
              };
            });

            expect(after?.rocket1?.mining).toBe(rocket1Destination.asteroidName);
            expect(after?.rocket2?.mining).toBe(rocket2Destination.asteroidName);
            expect(after?.rocket1?.travelling).toBe(false);
            expect(after?.rocket2?.travelling).toBe(false);
            expect(after?.rocket1?.timeLeftMs).toBe(0);
            expect(after?.rocket2?.timeLeftMs).toBe(0);

            return { before, shorten1, shorten2, advanced, after, shortTimerMs };
          },
          { input: { shortTimerMs } }
        );

        await globalThis.smokeStep("open Mining option", async () => {
          await page.locator("#miningOption").waitFor({ state: "visible", timeout: 60000 });
          await page.click("#miningOption");
          await page.locator("#antimatterSvg").waitFor({ state: "visible", timeout: 60000 });
        }, { input: { selector: "#miningOption" } });

        const rocket1MiningBaseline = await globalThis.smokeStep(
          "capture rocket1 asteroid antimatter amount + antimatter quantity baseline",
          async () => {
            return await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mod = await import("/resourceDataObject.js");
              const mining = globals.getMiningObject?.() ?? {};
              const rocket1AsteroidName = mining.rocket1 ?? null;
              const asteroid = (globals.getAsteroidArray?.() ?? []).find(obj => obj?.[rocket1AsteroidName])?.[rocket1AsteroidName] ?? null;
              return {
                rocket1AsteroidName,
                rocket1AsteroidQty: asteroid?.quantity?.[0] ?? null,
                rocket1AsteroidOriginalQty: asteroid?.originalQuantity ?? null,
                antimatterQty: mod.resourceData?.antimatter?.quantity ?? null
              };
            });
          }
        );

        expect(typeof rocket1MiningBaseline.rocket1AsteroidQty).toBe("number");
        expect(rocket1MiningBaseline.rocket1AsteroidQty).toBeGreaterThan(0);
        expect(typeof rocket1MiningBaseline.antimatterQty).toBe("number");

        await globalThis.smokeStep(
          "verify antimatter mining rates (per rocket + total)",
          async () => {
            await page.waitForTimeout(250);
            const state = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mod = await import("/resourceDataObject.js");
              const asteroids = globals.getAsteroidArray?.() ?? [];
              const mining = globals.getMiningObject?.() ?? {};

              const timerRatio = globals.getTimerRateRatio?.() ?? 100;
              const maxRate = globals.getNormalMaxAntimatterRate?.() ?? 0;
              const boostRate = globals.getBoostRate?.() ?? 2;
              const boostActive = globals.getIsAntimatterBoostActive?.() ?? false;
              const buffData = globals.getBuffEnhancedMiningData?.() ?? { boughtYet: 0, effectCategoryMagnitude: 0 };
              const buffMultiplier = 1 + ((buffData?.boughtYet ?? 0) * (buffData?.effectCategoryMagnitude ?? 0));
              const boostMultiplier = boostActive ? boostRate : 1;

              const minRate = 0.0001;
              const maxEase = 1;
              const minEase = 10;

              function findAsteroid(name) {
                if (!name || typeof name !== "string") return null;
                return asteroids.find(obj => obj?.[name])?.[name] ?? null;
              }

              function computeExtractionPerTick(asteroid) {
                if (!asteroid) return 0;
                const ease = asteroid.easeOfExtraction?.[0] ?? null;
                if (typeof ease !== "number") return 0;
                const normalizedEase = (ease - maxEase) / (minEase - maxEase);
                return maxRate - (normalizedEase * (maxRate - minRate));
              }

              const expectedPerRocketPerSecond = ["rocket1", "rocket2", "rocket3", "rocket4"].map((rocketKey) => {
                const asteroidName = mining?.[rocketKey];
                if (typeof asteroidName !== "string" || asteroidName === "refuel" || asteroidName.trim() === "") {
                  return 0;
                }
                const asteroid = findAsteroid(asteroidName);
                const perTick = computeExtractionPerTick(asteroid) * buffMultiplier * boostMultiplier;
                return Number((perTick * timerRatio).toFixed(2));
              });

              const expectedTotalPerSecond = Number((expectedPerRocketPerSecond.reduce((a, b) => a + b, 0)).toFixed(2));

              const svgTexts = Array.from(document.querySelectorAll("#antimatterSvg text"))
                .map(el => (el.textContent ?? "").trim())
                .filter(t => t.endsWith("/ s"));
              const perRocketLabelTexts = svgTexts.slice(-4);
              const observedPerRocketPerSecond = perRocketLabelTexts.map(t => {
                const n = Number.parseFloat(t);
                return Number.isFinite(n) ? Number(n.toFixed(2)) : null;
              });

              const miningRateText = (document.getElementById("miningRate")?.textContent ?? "").trim();
              const observedTotalPerSecond = Number.parseFloat(miningRateText);

              return {
                miningObject: mining,
                boostActive,
                timerRatio,
                buffData,
                expectedPerRocketPerSecond,
                expectedTotalPerSecond,
                perRocketLabelTexts,
                observedPerRocketPerSecond,
                miningRateText,
                observedTotalPerSecond: Number.isFinite(observedTotalPerSecond) ? Number(observedTotalPerSecond.toFixed(2)) : null,
                antimatterQty: mod.resourceData?.antimatter?.quantity ?? 0
              };
            });

            expect(state.perRocketLabelTexts.length).toBe(4);
            expect(state.observedPerRocketPerSecond[0]).not.toBeNull();
            expect(state.observedPerRocketPerSecond[1]).not.toBeNull();
            expect(state.observedPerRocketPerSecond[2]).not.toBeNull();
            expect(state.observedPerRocketPerSecond[3]).not.toBeNull();

            expect(state.observedPerRocketPerSecond[0]).toBeCloseTo(state.expectedPerRocketPerSecond[0], 1);
            expect(state.observedPerRocketPerSecond[1]).toBeCloseTo(state.expectedPerRocketPerSecond[1], 1);
            expect(state.observedPerRocketPerSecond[2]).toBeCloseTo(state.expectedPerRocketPerSecond[2], 1);
            expect(state.observedPerRocketPerSecond[3]).toBeCloseTo(state.expectedPerRocketPerSecond[3], 1);
            expect(state.observedTotalPerSecond).toBeCloseTo(state.expectedTotalPerSecond, 1);

            return state;
          },
          { input: { rockets: rocketSidebarNames, destinations: { rocket1: rocket1Destination.asteroidName, rocket2: rocket2Destination.asteroidName } } }
        );

        await globalThis.smokeStep(
          "validate antimatter boost doubles rate while held",
          async () => {
            await page.waitForTimeout(250);
            const baseline = await page.evaluate(() => {
              const miningRateText = (document.getElementById("miningRate")?.textContent ?? "").trim();
              const svgTexts = Array.from(document.querySelectorAll("#antimatterSvg text"))
                .map(el => (el.textContent ?? "").trim())
                .filter(t => t.endsWith("/ s"));
              const perRocketLabelTexts = svgTexts.slice(-4);
              const perRocket = perRocketLabelTexts.map(t => {
                const n = Number.parseFloat(t);
                return Number.isFinite(n) ? Number(n.toFixed(2)) : null;
              });
              const total = Number.parseFloat(miningRateText);
              return {
                perRocketLabelTexts,
                perRocket,
                miningRateText,
                total: Number.isFinite(total) ? Number(total.toFixed(2)) : null
              };
            });

            await page.dispatchEvent("#svgRateBarOuter", "mousedown");
            await page.waitForTimeout(250);

            const boosted = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const miningRateText = (document.getElementById("miningRate")?.textContent ?? "").trim();
              const svgTexts = Array.from(document.querySelectorAll("#antimatterSvg text"))
                .map(el => (el.textContent ?? "").trim())
                .filter(t => t.endsWith("/ s"));
              const perRocketLabelTexts = svgTexts.slice(-4);
              const perRocket = perRocketLabelTexts.map(t => {
                const n = Number.parseFloat(t);
                return Number.isFinite(n) ? Number(n.toFixed(2)) : null;
              });
              const total = Number.parseFloat(miningRateText);
              return {
                boostActive: globals.getIsAntimatterBoostActive?.() ?? null,
                perRocketLabelTexts,
                perRocket,
                miningRateText,
                total: Number.isFinite(total) ? Number(total.toFixed(2)) : null
              };
            });

            expect(boosted.boostActive).toBe(true);
            expect(boosted.total).not.toBeNull();
            expect(baseline.total).not.toBeNull();
            expect(boosted.total).toBeGreaterThan(baseline.total);
            expect(boosted.total).toBeCloseTo(baseline.total * 2, 0);

            await page.dispatchEvent("#svgRateBarOuter", "mouseup");
            await page.waitForTimeout(250);

            const after = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const miningRateText = (document.getElementById("miningRate")?.textContent ?? "").trim();
              const total = Number.parseFloat(miningRateText);
              return {
                boostActive: globals.getIsAntimatterBoostActive?.() ?? null,
                miningRateText,
                total: Number.isFinite(total) ? Number(total.toFixed(2)) : null
              };
            });

            expect(after.boostActive).toBe(false);
            expect(after.total).not.toBeNull();

            return { baseline, boosted, after };
          }
        );

        await globalThis.smokeStep(
          "timewarp mining to just before rocket1 asteroid exhaustion",
          async () => {
            const prep = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mod = await import("/resourceDataObject.js");
              const asteroids = globals.getAsteroidArray?.() ?? [];
              const mining = globals.getMiningObject?.() ?? {};
              const asteroidName = mining.rocket1;
              const asteroid = asteroids.find(obj => obj?.[asteroidName])?.[asteroidName] ?? null;

              const maxRate = globals.getNormalMaxAntimatterRate?.() ?? 0;
              const minRate = 0.0001;
              const maxEase = 1;
              const minEase = 10;
              const ease = asteroid?.easeOfExtraction?.[0] ?? null;
              const normalizedEase = (typeof ease === "number") ? (ease - maxEase) / (minEase - maxEase) : 0;
              const basePerTick = maxRate - (normalizedEase * (maxRate - minRate));

              const qty = asteroid?.quantity?.[0] ?? null;
              const timerRatio = globals.getTimerRateRatio?.() ?? 100;

              return {
                miningObject: mining,
                rocket1Asteroid: {
                  name: asteroidName,
                  qty,
                  ease,
                  basePerTick,
                  basePerSecond: Number((basePerTick * timerRatio).toFixed(2))
                },
                rocket2AsteroidName: mining.rocket2 ?? null,
                antimatterQty: mod.resourceData?.antimatter?.quantity ?? 0
              };
            });

            const basePerTick = prep.rocket1Asteroid.basePerTick;
            const qty = prep.rocket1Asteroid.qty;
            expect(typeof basePerTick).toBe("number");
            expect(basePerTick).toBeGreaterThan(0);
            expect(typeof qty).toBe("number");
            expect(qty).toBeGreaterThan(0);

            // Leave a tiny remainder so we can assert "still mining" state before depletion.
            const remainingTarget = 1;
            const ticksToNearDeplete = Math.max(0, Math.floor((qty - remainingTarget) / basePerTick));

            const warp = await page.evaluate(async ({ ticksToNearDeplete, timeWarpParams }) => {
              const globals = await import("/constantsAndGlobalVars.js");
              const game = await import("/game.js");
              const { timerManagerDelta } = await import("/timerManagerDelta.js");
              const asteroids = globals.getAsteroidArray?.() ?? [];
              const mining = globals.getMiningObject?.() ?? {};
              const asteroidName = mining.rocket1;
              const beforeAsteroid = asteroids.find(obj => obj?.[asteroidName])?.[asteroidName] ?? null;
              const beforeQty = beforeAsteroid?.quantity?.[0] ?? null;

              // Pause rocket2 mining so we can validate conservation of mined amount -> antimatter gained.
              if (globals.setMiningObject) {
                globals.setMiningObject("rocket2", null);
              }

              // Reset partial-tick accumulator so deltaMs produces an exact, predictable number of mining ticks.
              if (globals.setAntimatterDeltaAccumulator) {
                globals.setAntimatterDeltaAccumulator(0);
              }

              const beforeAntimatter = (await import("/resourceDataObject.js")).resourceData?.antimatter?.quantity ?? null;

              // Enable timewarp visuals while we fast-forward mining ticks.
              // Mining itself advances via the delta-timer (antimatterDeltaTimer).
              game.timeWarp(timeWarpParams.durationMs, timeWarpParams.multiplier);
              const intervalMs = globals.getTimerUpdateInterval?.() ?? 10;
              const deltaMs = Math.max(1, Math.floor(ticksToNearDeplete) * intervalMs);
              // IMPORTANT: timerManagerDelta.update applies multiplier internally. We want an exact number of ticks,
              // so we use multiplier=1 and control deltaMs directly.
              timerManagerDelta.update(deltaMs, 1);
              timerManagerDelta.update(1, 1);
              game.timeWarp(1, 1);

              const afterAsteroid = (globals.getAsteroidArray?.() ?? []).find(obj => obj?.[asteroidName])?.[asteroidName] ?? null;
              const afterQty = afterAsteroid?.quantity?.[0] ?? null;
              const afterMining = globals.getMiningObject?.()?.rocket1 ?? null;
              const afterTravelling = globals.getCurrentlyTravellingToAsteroid?.("rocket1") ?? null;
              const afterDirection = globals.getRocketDirection?.("rocket1") ?? null;

              const afterAntimatter = (await import("/resourceDataObject.js")).resourceData?.antimatter?.quantity ?? null;

              return {
                beforeQty,
                afterQty,
                beforeAntimatter,
                afterAntimatter,
                afterMining,
                afterTravelling,
                afterDirection,
                rocket2MiningAfterPause: globals.getMiningObject?.()?.rocket2 ?? null
              };
            }, { ticksToNearDeplete, timeWarpParams });

            expect(warp.afterMining).toBe(prep.rocket1Asteroid.name);
            expect(warp.afterTravelling).toBe(false);
            expect(warp.afterDirection).toBe(false);
            expect(typeof warp.afterQty).toBe("number");
            expect(warp.afterQty).toBeGreaterThan(0);
            expect(warp.rocket2MiningAfterPause).toBe(null);

            // Conservation sanity: antimatter gained should match asteroid mined (rocket1 only), within tolerance.
            const mined = (typeof warp.beforeQty === "number" && typeof warp.afterQty === "number")
              ? (warp.beforeQty - warp.afterQty)
              : null;
            const gained = (typeof warp.beforeAntimatter === "number" && typeof warp.afterAntimatter === "number")
              ? (warp.afterAntimatter - warp.beforeAntimatter)
              : null;

            expect(mined).not.toBeNull();
            expect(gained).not.toBeNull();

            // Allow tiny floating point drift.
            expect(gained).toBeCloseTo(mined, 1);

            // Restore rocket2 mining so the rest of the test continues with two active rockets.
            await page.evaluate(async ({ rocket2AsteroidName }) => {
              const globals = await import("/constantsAndGlobalVars.js");
              if (globals.setMiningObject) {
                globals.setMiningObject("rocket2", rocket2AsteroidName);
              }
            }, { rocket2AsteroidName: prep.rocket2AsteroidName });

            return { prep, remainingTarget, ticksToNearDeplete, warp, timeWarpParams };
          },
          { input: { timeWarpParams } }
        );

        await globalThis.smokeStep(
          "timewarp final mining ticks to deplete rocket1 asteroid and trigger returning",
          async () => {
            const before = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mod = await import("/resourceDataObject.js");
              const mining = globals.getMiningObject?.() ?? {};
              return {
                miningObject: mining,
                antimatterQty: mod.resourceData?.antimatter?.quantity ?? null,
                rocket1: {
                  travelling: globals.getCurrentlyTravellingToAsteroid?.("rocket1") ?? null,
                  direction: globals.getRocketDirection?.("rocket1") ?? null,
                  timeLeftMs: globals.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.("rocket1") ?? null
                },
                rocket2: {
                  travelling: globals.getCurrentlyTravellingToAsteroid?.("rocket2") ?? null,
                  direction: globals.getRocketDirection?.("rocket2") ?? null,
                  mining: mining.rocket2 ?? null
                }
              };
            });

            const trigger = await page.evaluate(async ({ timeWarpParams }) => {
              const globals = await import("/constantsAndGlobalVars.js");
              const game = await import("/game.js");
              const { timerManagerDelta } = await import("/timerManagerDelta.js");
              const mod = await import("/resourceDataObject.js");
              const asteroids = globals.getAsteroidArray?.() ?? [];
              const mining = globals.getMiningObject?.() ?? {};
              const asteroidName = mining.rocket1;
              const asteroid = asteroids.find(obj => obj?.[asteroidName])?.[asteroidName] ?? null;
              const beforeQty = asteroid?.quantity?.[0] ?? null;
              const beforeAntimatterQty = mod.resourceData?.antimatter?.quantity ?? null;

              const maxRate = globals.getNormalMaxAntimatterRate?.() ?? 0;
              const minRate = 0.0001;
              const maxEase = 1;
              const minEase = 10;
              const ease = asteroid?.easeOfExtraction?.[0] ?? null;
              const normalizedEase = (typeof ease === "number") ? (ease - maxEase) / (minEase - maxEase) : 0;
              const basePerTick = maxRate - (normalizedEase * (maxRate - minRate));

              game.timeWarp(timeWarpParams.durationMs, timeWarpParams.multiplier);
              // Advance enough ticks to guarantee depletion from whatever remainder is left.
              const intervalMs = globals.getTimerUpdateInterval?.() ?? 10;
              const qty = (typeof beforeQty === "number" && Number.isFinite(beforeQty)) ? beforeQty : 0;
              const ticksNeeded = (typeof basePerTick === "number" && basePerTick > 0)
                ? Math.ceil(qty / basePerTick) + 5
                : 500;
              const deltaMs = Math.max(intervalMs, ticksNeeded * intervalMs);
              timerManagerDelta.update(deltaMs, 1);
              timerManagerDelta.update(1, 1);
              game.timeWarp(1, 1);

              const afterMining = globals.getMiningObject?.()?.rocket1 ?? null;
              const afterTravelling = globals.getCurrentlyTravellingToAsteroid?.("rocket1") ?? null;
              const afterDirection = globals.getRocketDirection?.("rocket1") ?? null;
              const afterTimeLeftMs = globals.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.("rocket1") ?? null;
              const afterAntimatterQty = mod.resourceData?.antimatter?.quantity ?? null;

              const afterAsteroid = (globals.getAsteroidArray?.() ?? []).find(obj => obj?.[asteroidName])?.[asteroidName] ?? null;
              const afterQty = afterAsteroid?.quantity?.[0] ?? null;

              return { asteroidName, beforeQty, beforeAntimatterQty, basePerTick, ticksNeeded, afterQty, afterMining, afterTravelling, afterDirection, afterTimeLeftMs, afterAntimatterQty };
            }, { timeWarpParams });

            // After depletion, rocket1 is unassigned and starts the return travel timer.
            expect(trigger.afterMining).toBe(null);
            expect(trigger.afterTravelling).toBe(true);
            expect(trigger.afterDirection).toBe(true);

            // Assert antimatter increased by at least the amount that was on rocket1's asteroid when mining started.
            // (rocket2 may also contribute; we only require the rocket1 amount).
            const baselineAntimatter = rocket1MiningBaseline.antimatterQty;
            const baselineAsteroidQty = rocket1MiningBaseline.rocket1AsteroidQty;
            expect(typeof baselineAntimatter).toBe("number");
            expect(typeof baselineAsteroidQty).toBe("number");
            expect(typeof trigger.afterAntimatterQty).toBe("number");
            expect(trigger.afterAntimatterQty - baselineAntimatter).toBeGreaterThanOrEqual(baselineAsteroidQty);

            // Rocket2 should still be mining its asteroid.
            const rocket2StillMining = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mining = globals.getMiningObject?.() ?? {};
              return {
                rocket2Mining: mining.rocket2 ?? null,
                rocket2Travelling: globals.getCurrentlyTravellingToAsteroid?.("rocket2") ?? null,
                rocket2Direction: globals.getRocketDirection?.("rocket2") ?? null
              };
            });
            expect(typeof rocket2StillMining.rocket2Mining).toBe("string");
            expect(rocket2StillMining.rocket2Mining.length).toBeGreaterThan(0);
            expect(rocket2StillMining.rocket2Travelling).toBe(false);
            expect(rocket2StillMining.rocket2Direction).toBe(false);

            return { before, trigger, rocket2StillMining, timeWarpParams };
          },
          { input: { timeWarpParams } }
        );

        await globalThis.smokeStep(
          "shorten rocket1 return timer to 1s and complete return (refuel-ready)",
          async () => {
            const shortenReturn = await shortenRocketTravelTimerToOneSecond("rocket1");
            const advanced = await advanceDeltaTimersNaturally(shortTimerMs + 350);

            // Nudge the UI to refresh the sidebar status entries.
            await page.click("#launchPadOption");
            await page.waitForTimeout(150);

            await page.waitForFunction(() => {
              const txt = (document.getElementById("rocket1PartsQuantity")?.textContent ?? "").trim().toLowerCase();
              return txt.includes("refuel");
            }, null, { timeout: 60000 });

            const after = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const mod = await import("/resourceDataObject.js");
              return {
                launchedRockets: globals.getLaunchedRockets?.() ?? [],
                rocket1: {
                  travelling: globals.getCurrentlyTravellingToAsteroid?.("rocket1") ?? null,
                  destination: globals.getDestinationAsteroid?.("rocket1") ?? null,
                  fuelQty: mod.resourceData?.space?.upgrades?.rocket1?.fuelQuantity ?? null
                },
                rocket1SidebarStatus: ((document.getElementById("rocket1PartsQuantity")?.textContent ?? "").trim())
              };
            });

            expect(after.launchedRockets).not.toContain("rocket1");
            expect(after.rocket1.travelling).toBe(false);
            expect(after.rocket1.destination).toBe(null);
            expect(after.rocket1.fuelQty).toBe(0);
            expect(after.rocket1SidebarStatus.toLowerCase()).toContain("refuel");

            return { shortenReturn, advanced, after, shortTimerMs };
          },
          { input: { shortTimerMs } }
        );
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
