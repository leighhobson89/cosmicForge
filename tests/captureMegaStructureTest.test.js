import path from "node:path";
import { chromium } from "playwright";
import { startStaticServer } from "./cloudLoadUtils.js";

describe("captureMegaStructureTest", () => {
  globalThis.smokeTest(
    "new user declines onboarding, debug prepares starship, powers advanced plant, studies stars, chooses voidborn",
    async () => {
      const pioneerId = `autoPioneer-${Date.now()}-megastructure`;
      let targetStarName;
      let targetStarNameIndex1;

      const rootDir = path.resolve(process.cwd());
      const { server, port } = await startStaticServer({ rootDir });

      const browser = await chromium.launch({
        headless: false,
        slowMo: 100,
        devtools: true
      });

      try {
        const context = await browser.newContext();
        const page = await context.newPage();

        const clickGainFleetsTwice = async (label) => {
          const debugWindow = page.locator("#debugWindow");
          await debugWindow.waitFor({ state: "visible", timeout: 60000 });

          await page.waitForFunction(
            async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              return Boolean(globals.getStarShipBuilt?.());
            },
            null,
            { timeout: 60000 }
          );

          await page.evaluate(() => {
            const el = document.getElementById("debugWindow");
            if (el) el.scrollTop = el.scrollHeight;
          });

          const fleetsButton = page.locator("#addFleetsAndEnvoyButton");
          await fleetsButton.waitFor({ state: "visible", timeout: 60000 });
          await fleetsButton.scrollIntoViewIfNeeded().catch(() => {});

          const btnText = ((await fleetsButton.textContent()) ?? "").trim();
          expect(btnText.length).toBeGreaterThan(0);

          const baseAttackSnapshot = await page.evaluate(async () => {
            const rdo = await import("/resourceDataObject.js");

            const keys = ["fleetScout", "fleetMarauder", "fleetLandStalker", "fleetNavalStrafer"];
            const defaults = {
              fleetScout: 2,
              fleetMarauder: 4,
              fleetLandStalker: 4,
              fleetNavalStrafer: 6
            };

            const current = {};
            keys.forEach((k) => {
              current[k] = Number(rdo.getResourceDataObject?.("space", ["upgrades", k, "baseAttackStrength"]) ?? 0);
            });

            const sum = keys.reduce((acc, k) => acc + Number(current[k] ?? 0), 0);
            if (sum <= 0) {
              keys.forEach((k) => {
                rdo.setResourceDataObject?.(defaults[k], "space", ["upgrades", k, "baseAttackStrength"]);
              });
            }

            const after = {};
            keys.forEach((k) => {
              after[k] = Number(rdo.getResourceDataObject?.("space", ["upgrades", k, "baseAttackStrength"]) ?? 0);
            });

            return {
              before: current,
              after,
              beforeSum: sum,
              afterSum: keys.reduce((acc, k) => acc + Number(after[k] ?? 0), 0)
            };
          });

          const beforeAttackPower = await page.evaluate(async () => {
            const rdo = await import("/resourceDataObject.js");
            return Number(rdo.getResourceDataObject?.("fleets", ["attackPower"]) ?? 0);
          });

          const box = await fleetsButton.boundingBox();
          expect(box).toBeTruthy();
          const clickX = box.x + box.width / 2;
          const clickY = box.y + box.height / 2;

          const hitOk = await page.evaluate(
            ({ x, y }) => {
              const el = document.elementFromPoint(x, y);
              if (!el) return false;
              const btn = document.getElementById("addFleetsAndEnvoyButton");
              if (!btn) return false;
              return btn === el || btn.contains(el);
            },
            { x: clickX, y: clickY }
          );
          expect(hitOk).toBe(true);

          for (let i = 0; i < 2; i++) {
            try {
              await fleetsButton.click({ timeout: 2000 });
            } catch {
              await page.mouse.click(clickX, clickY);
            }

            await page.waitForTimeout(300);
          }

          await page.waitForFunction(
            async (expectedAttackPower) => {
              const rdo = await import("/resourceDataObject.js");
              const current = Number(rdo.getResourceDataObject?.("fleets", ["attackPower"]) ?? 0);
              return Math.abs(current - Number(expectedAttackPower ?? 0)) < 0.0001;
            },
            beforeAttackPower + 960,
            { timeout: 60000 }
          );

          const afterAttackPower = await page.evaluate(async () => {
            const rdo = await import("/resourceDataObject.js");
            return Number(rdo.getResourceDataObject?.("fleets", ["attackPower"]) ?? 0);
          });

          expect(afterAttackPower).toBe(beforeAttackPower + 960);

          return { label, btnText, baseAttackSnapshot, beforeAttackPower, afterAttackPower };
        };

        await globalThis.smokeStep(
          "block cloud save network",
          async () => {
            await page.route("**/riogcxvtomyjlzkcnujf.supabase.co/**", (route) => route.abort());
          },
          { input: { url: "**/riogcxvtomyjlzkcnujf.supabase.co/**" } }
        );

        await globalThis.smokeStep(
          "open app",
          async () => {
            await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
          },
          { input: { port } }
        );

        await globalThis.smokeStep(
          "enter pioneer id",
          async () => {
            await page.waitForSelector("#pioneerCodeName", { timeout: 60000 });
            await page.fill("#pioneerCodeName", pioneerId);
            await page.click("#modalConfirm");
          },
          { input: { pioneerId, selector: "#pioneerCodeName" } }
        );

        await globalThis.smokeStep(
          "accept fullscreen prompt",
          async () => {
            await page.waitForSelector("#fullScreenCheckBox", { timeout: 60000 });
            await page.click("#fullScreenCheckBox");
            await page.click("#modalConfirm");
          },
          { input: { selectors: ["#fullScreenCheckBox", "#modalConfirm"] } }
        );

        await globalThis.smokeStep(
          "decline onboarding prompt if present",
          async () => {
            await page.waitForTimeout(150);
            const onboardingCancel = page.locator("#modalCancel");
            if (await onboardingCancel.isVisible({ timeout: 2000 }).catch(() => false)) {
              const cancelText = (await onboardingCancel.textContent())?.trim();
              if (cancelText === "NO") {
                await onboardingCancel.click();
              }
            }
          },
          { input: { selector: "#modalCancel" } }
        );

        await globalThis.smokeStep(
          "wait for main UI",
          async () => {
            await page.waitForSelector("#tab1", { timeout: 60000 });
          },
          { input: { selector: "#tab1" } }
        );

        await globalThis.smokeStep(
          "open debug window",
          async () => {
            await page.keyboard.press("NumpadSubtract");
            await page.locator("#debugWindow").waitFor({ state: "visible", timeout: 60000 });
          },
          { input: { key: "NumpadSubtract", selector: "#debugWindow" } }
        );

        await globalThis.smokeStep(
          "run debug Prepare",
          async () => {
            await page.click("#prepareRunForStarshipLaunchButton");
            await page.waitForFunction(
              async () => {
                const globals = await import("/constantsAndGlobalVars.js");
                return Boolean(globals.getStarShipBuilt?.());
              },
              null,
              { timeout: 60000 }
            );
          },
          { input: { selector: "#prepareRunForStarshipLaunchButton" } }
        );

        await globalThis.smokeStep(
          "clear notification queues after debug Prepare",
          async () => {
            await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");

              const containers = globals.getNotificationContainers?.() ?? {};
              Object.values(containers).forEach((container) => {
                try {
                  container?.remove?.();
                } catch {
                  // best-effort
                }
              });

              globals.setNotificationQueues?.({});
              globals.setNotificationStatus?.({});
              globals.setNotificationContainers?.({});
              globals.setClassificationOrder?.([]);
            });
          },
          { input: { getters: ["getNotificationQueues", "getNotificationStatus"], setters: ["setNotificationQueues", "setNotificationStatus", "setNotificationContainers", "setClassificationOrder"] } }
        );

        await globalThis.smokeStep(
          "wait 2s after debug Prepare",
          async () => {
            await page.waitForTimeout(2000);
          },
          { input: { waitMs: 2000 } }
        );

        await globalThis.smokeStep(
          "debug: study a star 40x",
          async () => {
            const debugWindow = page.locator("#debugWindow");
            await debugWindow.waitFor({ state: "visible", timeout: 60000 });

            await page.evaluate(() => {
              const el = document.getElementById("debugWindow");
              if (el) el.scrollTop = el.scrollHeight;
            });

            const studyButton = page.locator("#addStarButton");
            await studyButton.waitFor({ state: "attached", timeout: 60000 });
            for (let i = 0; i < 40; i++) {
              await studyButton.click({ force: true });
            }
          },
          { input: { selector: "#addStarButton", times: 40 } }
        );

        await globalThis.smokeStep(
          "debug: add 30 fleets + envoy twice",
          async () => {
            return clickGainFleetsTwice("early");
          },
          { input: { selector: "#addFleetsAndEnvoyButton", times: 2 } }
        );

        await globalThis.smokeStep(
          "read manuscript and factory star names from getStarsWithAncientManuscripts",
          async () => {
            await page.waitForFunction(
              async () => {
                const globals = await import("/constantsAndGlobalVars.js");
                const pairs = globals.getStarsWithAncientManuscripts?.() ?? [];
                return Array.isArray(pairs) && pairs.length >= 1;
              },
              null,
              { timeout: 60000 }
            );

            const starNames = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              const pairs = globals.getStarsWithAncientManuscripts?.() ?? [];
              const firstPair = Array.isArray(pairs) ? pairs[0] : null;
              const manuscriptStar = Array.isArray(firstPair) ? firstPair[0] : null;
              const factoryStar = Array.isArray(firstPair) ? firstPair[1] : null;
              return {
                manuscriptStar: typeof manuscriptStar === "string" ? manuscriptStar : null,
                factoryStar: typeof factoryStar === "string" ? factoryStar : null,
                count: Array.isArray(pairs) ? pairs.length : 0
              };
            });

            targetStarName = starNames?.manuscriptStar;
            targetStarNameIndex1 = starNames?.factoryStar;

            expect(typeof targetStarName).toBe("string");
            expect(targetStarName.length).toBeGreaterThan(0);

            expect(starNames?.count).toBeGreaterThanOrEqual(1);
            expect(typeof targetStarNameIndex1).toBe("string");
            expect(targetStarNameIndex1.length).toBeGreaterThan(0);

            return { targetStarName, targetStarNameIndex1 };
          },
          { input: { getter: "getStarsWithAncientManuscripts", paths: ["[0][0]", "[0][1]"] } }
        );

        await globalThis.smokeStep(
          "close debug window",
          async () => {
            const debugWindow = page.locator("#debugWindow");
            if (!(await debugWindow.isVisible({ timeout: 1500 }).catch(() => false))) {
              return { wasOpen: false };
            }

            const closeButton = page.locator("#debugWindow .close-btn");
            if (await closeButton.isVisible({ timeout: 1500 }).catch(() => false)) {
              await closeButton.click();
            } else {
              await page.keyboard.press("NumpadSubtract");
            }

            await debugWindow.waitFor({ state: "hidden", timeout: 60000 });
            return { wasOpen: true };
          },
          { input: { selector: "#debugWindow" } }
        );

        await globalThis.smokeStep(
          "buy + activate Advanced Power Plant and turn power on",
          async () => {
            await page.evaluate(() => {
              const tab2 = document.getElementById("tab2");
              if (tab2) tab2.click();
            });

            const advancedOption = page.locator("#powerPlant3Option");
            await advancedOption.waitFor({ state: "visible", timeout: 60000 });
            await advancedOption.click();

            const row = page.locator("#energyPowerPlant3Row");
            await row.waitFor({ state: "visible", timeout: 60000 });

            const buyButton = row.locator("button", { hasText: /^Add\s/i });
            await buyButton.waitFor({ state: "visible", timeout: 60000 });
            await buyButton.click();

            const toggleButton = row.locator("#powerPlant3Toggle");
            if (await toggleButton.count()) {
              await toggleButton.click({ force: true });
            } else {
              await page.evaluate(async () => {
                const globals = await import("/constantsAndGlobalVars.js");
                globals.setBuildingTypeOnOff?.("powerPlant3", true);
                globals.setPowerOnOff?.(true);
              });
            }

            await page.waitForFunction(
              async () => {
                const globals = await import("/constantsAndGlobalVars.js");
                return Boolean(globals.getBuildingTypeOnOff?.("powerPlant3")) && Boolean(globals.getPowerOnOff?.());
              },
              null,
              { timeout: 60000 }
            );
          },
          { input: { selectors: ["#tab2", "#powerPlant3Option", "#energyPowerPlant3Row", "#powerPlant3Toggle"] } }
        );

        await globalThis.smokeStep(
          "build space telescope if needed and start Study Stars",
          async () => {
            await page.click("#tab6");

            const telescopeOption = page.locator("#spaceTelescopeOption");
            await telescopeOption.waitFor({ state: "visible", timeout: 60000 });
            await telescopeOption.click();

            const buildButton = page.locator("#spaceBuildTelescopeRow button", { hasText: "Build Space Telescope" });
            if (await buildButton.isVisible({ timeout: 1500 }).catch(() => false)) {
              await buildButton.click();
            }

            const studyStarsRow = page.locator("#spaceTelescopeInvestigateStarRow");
            await studyStarsRow.waitFor({ state: "visible", timeout: 60000 });

            const studyStarsButton = studyStarsRow.locator("button", { hasText: "Study Stars" });
            await studyStarsButton.waitFor({ state: "visible", timeout: 60000 });
            await studyStarsButton.click();
          },
          { input: { selectors: ["#tab6", "#spaceTelescopeOption", "#spaceBuildTelescopeRow", "#spaceTelescopeInvestigateStarRow"] } }
        );

        await globalThis.smokeStep(
          "timewarp 1s at 2000x",
          async () => {
            await page.evaluate(async () => {
              try {
                Document.prototype.hasFocus = () => true;
                Object.defineProperty(document, "hidden", { get: () => false, configurable: true });
                Object.defineProperty(document, "visibilityState", { get: () => "visible", configurable: true });
              } catch {
                // best-effort only
              }
              const game = await import("/game.js");
              game.timeWarp(1000, 2000);
            });

            await page.waitForTimeout(1100);

            await page.waitForFunction(
              async () => {
                const globals = await import("/constantsAndGlobalVars.js");
                return (globals.getTimeWarpMultiplier?.() ?? 1) === 1;
              },
              null,
              { timeout: 60000 }
            );
          },
          { input: { durationMs: 1000, multiplier: 2000 } }
        );

        await globalThis.smokeStep(
          "choose Voidborn from philosophy popup",
          async () => {
            const voidbornButton = page.locator("#modalExtraChoice1");
            await voidbornButton.waitFor({ state: "visible", timeout: 60000 });
            await voidbornButton.click();
            await page.locator("#overlay").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});

            const philosophy = await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");
              return globals.getPlayerPhilosophy?.();
            });

            expect(philosophy).toBe("voidborn");
          },
          { input: { selector: "#modalExtraChoice1" } }
        );

        await globalThis.smokeStep(
          "open Interstellar tab and Star Map",
          async () => {
            await page.evaluate(() => {
              const tab5 = document.getElementById("tab5");
              if (tab5) tab5.click();
            });
            await page.locator("#starMapOption").waitFor({ state: "visible", timeout: 60000 });
            await page.click("#starMapOption");
            await page.locator("#starMapSearchInput").waitFor({ state: "visible", timeout: 60000 });
          },
          { input: { selectors: ["#tab5", "#starMapOption", "#starMapSearchInput"] } }
        );

        await globalThis.smokeStep(
          "select star and click Travel",
          async () => {
            const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const expectedStar = String(targetStarName);

            const lastChar = expectedStar.slice(-1);
            await page.fill("#starMapSearchInput", expectedStar);
            await page.waitForTimeout(50);
            if (lastChar) {
              await page.keyboard.press("Backspace");
              await page.waitForTimeout(50);
              await page.type("#starMapSearchInput", lastChar);
              await page.waitForTimeout(50);
            }

            const results = page.locator("#starMapSearchResults");
            await results.waitFor({ state: "visible", timeout: 60000 });
            const result = results.locator(".star-map-search-item", {
              hasText: new RegExp(`^${escapeRegex(expectedStar)}$`, "i")
            });
            await result.first().click();

            await page.waitForFunction(
              async (starName) => {
                const globals = await import("/constantsAndGlobalVars.js");
                const destination = String(globals.getDestinationStar?.() ?? "").toLowerCase();
                return destination === String(starName ?? "").toLowerCase();
              },
              expectedStar,
              { timeout: 60000 }
            );

            const travelButton = page.locator("#starDestinationButton button", { hasText: /^Travel$/i });
            await travelButton.waitFor({ state: "visible", timeout: 60000 });
            await travelButton.click();
          },
          { input: { selectors: ["#starMapSearchInput", "#starMapSearchResults", "#starDestinationButton"] } }
        );

        await globalThis.smokeStep(
          "launch to star from modal",
          async () => {
            const launchButton = page.locator("#modalConfirm", { hasText: /^LAUNCH$/i });
            await launchButton.waitFor({ state: "visible", timeout: 60000 });
            await launchButton.click();
            await page.locator("#overlay").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
          },
          { input: { selectors: ["#modalConfirm", "#overlay"] } }
        );

        await globalThis.smokeStep(
          "timewarp 1s at 3000x",
          async () => {
            await page.evaluate(async () => {
              try {
                Document.prototype.hasFocus = () => true;
                Object.defineProperty(document, "hidden", { get: () => false, configurable: true });
                Object.defineProperty(document, "visibilityState", { get: () => "visible", configurable: true });
              } catch {
                // best-effort only
              }
              const game = await import("/game.js");
              game.timeWarp(1000, 3000);
            });

            await page.waitForTimeout(1100);

            await page.waitForFunction(
              async () => {
                const globals = await import("/constantsAndGlobalVars.js");
                return (globals.getTimeWarpMultiplier?.() ?? 1) === 1;
              },
              null,
              { timeout: 60000 }
            );
          },
          { input: { durationMs: 1000, multiplier: 3000 } }
        );

        await globalThis.smokeStep(
          "confirm post-launch modal if shown",
          async () => {
            const confirm = page.locator("#modalConfirm");
            if (await confirm.isVisible({ timeout: 2000 }).catch(() => false)) {
              await confirm.click();
              await page.locator("#overlay").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
            }
          },
          { input: { selector: "#modalConfirm" } }
        );

        await globalThis.smokeStep(
          "open Star Ship panel",
          async () => {
            await page.evaluate(() => {
              const tab5 = document.getElementById("tab5");
              if (tab5) tab5.click();
            });
            const starShipOption = page.locator("#starShipOption");
            await starShipOption.waitFor({ state: "visible", timeout: 60000 });
            await starShipOption.click();
          },
          { input: { selectors: ["#tab5", "#starShipOption"] } }
        );

        await globalThis.smokeStep(
          "scan destination system",
          async () => {
            const scanButton = page.locator("#spaceStarShipStellarScannerRow button", { hasText: /^Scan System$/i });
            await scanButton.waitFor({ state: "visible", timeout: 60000 });
            await scanButton.click();
            await page.waitForFunction(
              async () => {
                const globals = await import("/constantsAndGlobalVars.js");
                return Boolean(globals.getDestinationStarScanned?.());
              },
              null,
              { timeout: 60000 }
            );
          },
          { input: { selectors: ["#spaceStarShipStellarScannerRow"] } }
        );

        await globalThis.smokeStep(
          "open Colonise panel",
          async () => {
            const coloniseOption = page.locator("#coloniseOption");
            await coloniseOption.waitFor({ state: "visible", timeout: 60000 });
            await coloniseOption.click();
          },
          { input: { selector: "#coloniseOption" } }
        );

        let coloniseChoice = null;

        await globalThis.smokeStep(
          "choose Conquest or Settle",
          async () => {
            const conquestButton = page.locator("button", { hasText: /^Conquest$/i });
            const settleButton = page.locator("button", { hasText: /^Settle$/i });

            const conquestVisible = await conquestButton.isVisible({ timeout: 2000 }).catch(() => false);
            if (conquestVisible) {
              const conquestEnabled = await conquestButton.isEnabled().catch(() => false);
              if (conquestEnabled) {
                await conquestButton.click();
                coloniseChoice = "conquest";
                return { choice: coloniseChoice };
              }
            }

            if (await settleButton.isVisible({ timeout: 5000 }).catch(() => false)) {
              await settleButton.click();
              coloniseChoice = "settle";
              return { choice: coloniseChoice };
            }

            // If neither button is available, surface DOM state to aid debugging.
            const buttonsText = await page
              .locator("#optionContentTab5 button")
              .evaluateAll((btns) => btns.map((b) => (b.textContent || "").trim()).filter(Boolean));
            throw new Error(`No Conquest/Settle button found. Buttons in panel: ${buttonsText.join(", ")}`);
          },
          { input: { selectors: ["button:has-text('Conquest')", "button:has-text('Settle')"] } }
        );

        await globalThis.smokeStep(
          "if conquest: confirm conquest modal",
          async () => {
            if (coloniseChoice !== "conquest") {
              return { skipped: true, choice: coloniseChoice };
            }

            const confirm = page.locator("#modalConfirm");
            await confirm.waitFor({ state: "visible", timeout: 60000 });
            await confirm.click();
            await page.locator("#overlay").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
            return { confirmed: true };
          },
          { input: { selector: "#modalConfirm" } }
        );

        await globalThis.smokeStep(
          "if conquest: wait for Attack enabled and click",
          async () => {
            if (coloniseChoice !== "conquest") {
              return { skipped: true, choice: coloniseChoice };
            }
            const battleButton = page.locator("#battleButton");
            await battleButton.waitFor({ state: "attached", timeout: 60000 });
            await page.waitForFunction(
              () => {
                const btn = document.getElementById("battleButton");
                if (!btn) return false;
                return btn.classList.contains("green-ready-text");
              },
              null,
              { timeout: 60000 }
            );
            await battleButton.click();
            return { attacked: true };
          },
          { input: { selectors: ["#battleButton"] } }
        );

        await globalThis.smokeStep(
          "if conquest: wait for next modal and confirm",
          async () => {
            if (coloniseChoice !== "conquest") {
              return { skipped: true, choice: coloniseChoice };
            }

            const confirm = page.locator("#modalConfirm");
            await confirm.waitFor({ state: "visible", timeout: 90000 });
            await confirm.click();
            await page.locator("#overlay").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
            return { confirmed: true };
          },
          { input: { selector: "#modalConfirm", timeoutMs: 90000 } }
        );

        await globalThis.smokeStep(
          "post-colonise extra modal confirms",
          async () => {
            const confirmOnce = async () => {
              const confirm = page.locator("#modalConfirm");
              await confirm.waitFor({ state: "visible", timeout: 90000 });
              await confirm.click();
              await page.locator("#overlay").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
            };

            if (coloniseChoice === "conquest") {
              await confirmOnce();
              return { confirms: 1, choice: coloniseChoice };
            }

            if (coloniseChoice === "settle") {
              await confirmOnce();
              await confirmOnce();
              return { confirms: 2, choice: coloniseChoice };
            }

            return { confirms: 0, choice: coloniseChoice };
          },
          { input: { timeoutMs: 90000 } }
        );

        await globalThis.smokeStep(
          "confirm ancient manuscript modal if it appears",
          async () => {
            const confirmIfManuscript = async () => {
              const overlay = page.locator("#overlay");
              const isOpen = await overlay.isVisible({ timeout: 1500 }).catch(() => false);
              if (!isOpen) return false;

              const modalText = await page.locator("#modal").innerText().catch(() => "");
              if (!/ancient\s+manuscript/i.test(modalText)) return false;

              const confirm = page.locator("#modalConfirm");
              await confirm.waitFor({ state: "visible", timeout: 60000 });
              await confirm.click();
              await overlay.waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});
              return true;
            };

            let confirmed = 0;
            for (let i = 0; i < 5; i++) {
              if (await confirmIfManuscript()) {
                confirmed++;
                continue;
              }
              await page.waitForTimeout(500);
            }

            return { confirmed };
          },
          { input: { match: "ancient manuscript", maxPolls: 5 } }
        );

        await globalThis.smokeStep(
          "clear notification queues after debug Prepare (late)",
          async () => {
            await page.evaluate(async () => {
              const globals = await import("/constantsAndGlobalVars.js");

              const containers = globals.getNotificationContainers?.() ?? {};
              Object.values(containers).forEach((container) => {
                try {
                  container?.remove?.();
                } catch {
                  // best-effort
                }
              });

              globals.setNotificationQueues?.({});
              globals.setNotificationStatus?.({});
              globals.setNotificationContainers?.({});
              globals.setClassificationOrder?.([]);
            });
          },
          { input: { getters: ["getNotificationQueues", "getNotificationStatus"], setters: ["setNotificationQueues", "setNotificationStatus", "setNotificationContainers", "setClassificationOrder"] } }
        );

        await globalThis.smokeStep(
          "wait 2s after debug Prepare (late)",
          async () => {
            await page.waitForTimeout(2000);
          },
          { input: { waitMs: 2000 } }
        );

        await globalThis.smokeStep(
          "debug: add 30 fleets + envoy twice",
          async () => {
            return clickGainFleetsTwice("late");
          },
          { input: { selector: "#addFleetsAndEnvoyButton", times: 2 } }
        );

        await globalThis.smokeStep(
          "close debug window again",
          async () => {
            const debugWindow = page.locator("#debugWindow");
            if (!(await debugWindow.isVisible({ timeout: 1500 }).catch(() => false))) {
              return { wasOpen: false };
            }

            const closeButton = page.locator("#debugWindow .close-btn");
            if (await closeButton.isVisible({ timeout: 1500 }).catch(() => false)) {
              await closeButton.click();
            } else {
              await page.keyboard.press("NumpadSubtract");
            }

            await debugWindow.waitFor({ state: "hidden", timeout: 60000 });
            return { wasOpen: true };
          },
          { input: { selector: "#debugWindow" } }
        );

        await globalThis.smokeStep(
          "open Interstellar tab and Star Map again",
          async () => {
            await page.evaluate(() => {
              const tab5 = document.getElementById("tab5");
              if (tab5) tab5.click();
            });
            await page.locator("#starMapOption").waitFor({ state: "visible", timeout: 60000 });
            await page.click("#starMapOption");
            await page.locator("#starMapSearchInput").waitFor({ state: "visible", timeout: 60000 });
          },
          { input: { selectors: ["#tab5", "#starMapOption", "#starMapSearchInput"] } }
        );

        await globalThis.smokeStep(
          "select second star and click Travel",
          async () => {
            const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const expectedStar = String(targetStarNameIndex1);

            const lastChar = expectedStar.slice(-1);
            await page.fill("#starMapSearchInput", expectedStar);
            await page.waitForTimeout(50);
            if (lastChar) {
              await page.keyboard.press("Backspace");
              await page.waitForTimeout(50);
              await page.type("#starMapSearchInput", lastChar);
              await page.waitForTimeout(50);
            }

            const results = page.locator("#starMapSearchResults");
            await results.waitFor({ state: "visible", timeout: 60000 });
            const result = results.locator(".star-map-search-item", {
              hasText: new RegExp(`^${escapeRegex(expectedStar)}$`, "i")
            });
            await result.first().click();

            await page.waitForFunction(
              async (starName) => {
                const globals = await import("/constantsAndGlobalVars.js");
                const destination = String(globals.getDestinationStar?.() ?? "").toLowerCase();
                return destination === String(starName ?? "").toLowerCase();
              },
              expectedStar,
              { timeout: 60000 }
            );

            const travelButton = page.locator("#starDestinationButton button", { hasText: /^Travel$/i });
            await travelButton.waitFor({ state: "visible", timeout: 60000 });
            await travelButton.click();
          },
          { input: { selectors: ["#starMapSearchInput", "#starMapSearchResults", "#starDestinationButton"] } }
        );

        await globalThis.smokeStep(
          "launch to second star from modal",
          async () => {
            const launchButton = page.locator("#modalConfirm", { hasText: /^LAUNCH$/i });
            await launchButton.waitFor({ state: "visible", timeout: 60000 });
            await launchButton.click();
            await page.locator("#overlay").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
          },
          { input: { selectors: ["#modalConfirm", "#overlay"] } }
        );

        await globalThis.smokeStep(
          "confirm post-launch modal if shown (second launch)",
          async () => {
            const confirm = page.locator("#modalConfirm");
            if (await confirm.isVisible({ timeout: 2000 }).catch(() => false)) {
              await confirm.click();
              await page.locator("#overlay").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
            }
          },
          { input: { selector: "#modalConfirm" } }
        );

        await globalThis.smokeStep(
          "timewarp 3s at 5000x",
          async () => {
            await page.evaluate(async () => {
              try {
                Document.prototype.hasFocus = () => true;
                Object.defineProperty(document, "hidden", { get: () => false, configurable: true });
                Object.defineProperty(document, "visibilityState", { get: () => "visible", configurable: true });
              } catch {
                // best-effort only
              }
              const game = await import("/game.js");
              game.timeWarp(3000, 5000);
            });

            await page.waitForTimeout(3100);

            await page.waitForFunction(
              async () => {
                const globals = await import("/constantsAndGlobalVars.js");
                return (globals.getTimeWarpMultiplier?.() ?? 1) === 1;
              },
              null,
              { timeout: 60000 }
            );
          },
          { input: { durationMs: 3000, multiplier: 5000 } }
        );

        await globalThis.smokeStep(
          "confirm post-timewarp modal",
          async () => {
            const confirm = page.locator("#modalConfirm");
            await confirm.waitFor({ state: "visible", timeout: 90000 });
            await confirm.click();
            await page.locator("#overlay").waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});
          },
          { input: { selector: "#modalConfirm", timeoutMs: 90000 } }
        );

        await globalThis.smokeStep(
          "open Star Ship panel again",
          async () => {
            await page.evaluate(() => {
              const tab5 = document.getElementById("tab5");
              if (tab5) tab5.click();
            });
            const starShipOption = page.locator("#starShipOption");
            await starShipOption.waitFor({ state: "visible", timeout: 60000 });
            await starShipOption.click();
          },
          { input: { selectors: ["#tab5", "#starShipOption"] } }
        );

        await globalThis.smokeStep(
          "scan destination system again",
          async () => {
            const scanButton = page.locator("#spaceStarShipStellarScannerRow button", { hasText: /^Scan System$/i });
            await scanButton.waitFor({ state: "visible", timeout: 60000 });
            await scanButton.click();
            await page.waitForFunction(
              async () => {
                const globals = await import("/constantsAndGlobalVars.js");
                return Boolean(globals.getDestinationStarScanned?.());
              },
              null,
              { timeout: 60000 }
            );
          },
          { input: { selectors: ["#spaceStarShipStellarScannerRow"] } }
        );

        await globalThis.smokeStep(
          "open Colonise panel again",
          async () => {
            const coloniseOption = page.locator("#coloniseOption");
            await coloniseOption.waitFor({ state: "visible", timeout: 60000 });
            await coloniseOption.click();
          },
          { input: { selector: "#coloniseOption" } }
        );

        await globalThis.smokeStep(
          "choose Conquest (no Settle expected)",
          async () => {
            const conquestButton = page.locator("button", { hasText: /^Conquest$/i });
            await conquestButton.waitFor({ state: "visible", timeout: 60000 });
            await conquestButton.click();
          },
          { input: { selector: "button:has-text('Conquest')" } }
        );

        await globalThis.smokeStep(
          "confirm conquest modal",
          async () => {
            const confirm = page.locator("#modalConfirm");
            await confirm.waitFor({ state: "visible", timeout: 60000 });
            await confirm.click();
            await page.locator("#overlay").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
          },
          { input: { selector: "#modalConfirm" } }
        );

        await globalThis.smokeStep(
          "wait for Attack enabled and click",
          async () => {
            const battleButton = page.locator("#battleButton");
            await battleButton.waitFor({ state: "attached", timeout: 60000 });
            await page.waitForFunction(
              () => {
                const btn = document.getElementById("battleButton");
                if (!btn) return false;
                return btn.classList.contains("green-ready-text");
              },
              null,
              { timeout: 60000 }
            );
            await battleButton.click();
          },
          { input: { selectors: ["#battleButton"] } }
        );

        await globalThis.smokeStep(
          "wait for battle modal and confirm",
          async () => {
            const confirm = page.locator("#modalConfirm");
            await confirm.waitFor({ state: "visible", timeout: 90000 });
            await confirm.click();
            await page.locator("#overlay").waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});
          },
          { input: { selector: "#modalConfirm", timeoutMs: 90000 } }
        );

        await globalThis.smokeStep(
          "rebirth via Galactic tab",
          async () => {
            await page.evaluate(() => {
              const tab7 = document.getElementById("tab7");
              if (tab7) tab7.click();
            });

            const rebirthOption = page.locator("#rebirthOption");
            await rebirthOption.waitFor({ state: "visible", timeout: 60000 });
            await rebirthOption.click();

            const rebirthButton = page.locator("#rebirthRow button", { hasText: /^REBIRTH$/ });
            await rebirthButton.waitFor({ state: "visible", timeout: 60000 });
            await rebirthButton.click();

            const confirm = page.locator("#modalConfirm");
            await confirm.waitFor({ state: "visible", timeout: 60000 });
            await confirm.click();
            await page.locator("#overlay").waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});

            await page.waitForSelector("#tab1", { timeout: 60000 });
          },
          { input: { selectors: ["#tab7", "#rebirthOption", "#rebirthRow", "#modalConfirm", "#tab1"] } }
        );

        await globalThis.smokeStep(
          "validate hydrogen reset and storage",
          async () => {
            const state = await page.evaluate(async () => {
              const rdo = await import("/resourceDataObject.js");
              return {
                hydrogen: rdo.getResourceDataObject?.("resources", ["hydrogen", "quantity"]),
                hydrogenStorage: rdo.getResourceDataObject?.("resources", ["hydrogen", "storageCapacity"])
              };
            });

            expect(state.hydrogen).toBe(0);
            expect(state.hydrogenStorage).toBe(150);
            return state;
          },
          { input: { asserts: ["hydrogen=0", "hydrogenStorageCapacity=150"] } }
        );

        await globalThis.smokeStep(
          "open debug window again",
          async () => {
            await page.keyboard.press("NumpadSubtract");
            await page.locator("#debugWindow").waitFor({ state: "visible", timeout: 60000 });
          },
          { input: { key: "NumpadSubtract", selector: "#debugWindow" } }
        );

        await globalThis.smokeStep(
          "debug: prepare star ship flight",
          async () => {
            await page.click("#prepareRunForStarshipLaunchButton");
            await page.waitForFunction(
              async () => {
                const globals = await import("/constantsAndGlobalVars.js");
                return Boolean(globals.getStarShipBuilt?.());
              },
              null,
              { timeout: 60000 }
            );
          },
          { input: { selector: "#prepareRunForStarshipLaunchButton" } }
        );

        await globalThis.smokeStep(
          "close debug window",
          async () => {
            const debugWindow = page.locator("#debugWindow");
            if (!(await debugWindow.isVisible({ timeout: 1500 }).catch(() => false))) {
              return { wasOpen: false };
            }

            const closeButton = page.locator("#debugWindow .close-btn");
            if (await closeButton.isVisible({ timeout: 1500 }).catch(() => false)) {
              await closeButton.click();
            } else {
              await page.keyboard.press("NumpadSubtract");
            }

            await debugWindow.waitFor({ state: "hidden", timeout: 60000 });
            return { wasOpen: true };
          },
          { input: { selector: "#debugWindow" } }
        );

        await globalThis.smokeStep(
          "open Research tab",
          async () => {
            await page.evaluate(() => {
              const tab3 = document.getElementById("tab3");
              if (tab3) tab3.click();
            });
            const researchOption = page.locator("#researchOption");
            await researchOption.waitFor({ state: "visible", timeout: 60000 });
            await researchOption.click();
          },
          { input: { selectors: ["#tab3", "#researchOption"] } }
        );

        await globalThis.smokeStep(
          "research 5 megastructure techs",
          async () => {
            const techRowIds = [
              "#techDysonSphereUnderstandingRow",
              "#techDysonSphereCapabilitiesRow",
              "#techDysonSphereDisconnectRow",
              "#techDysonSpherePowerRow",
              "#techDysonSphereConnectRow"
            ];

            const researched = [];
            for (const rowId of techRowIds) {
              const button = page.locator(`${rowId} button`, { hasText: /^Research$/i });
              await button.waitFor({ state: "visible", timeout: 60000 });
              await button.click();

              const confirm = page.locator("#modalConfirm");
              await confirm.waitFor({ state: "visible", timeout: 60000 });
              await confirm.click();
              await page.locator("#overlay").waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});

              researched.push(rowId);
              await page.waitForTimeout(100);
            }

            return { researchedCount: researched.length, researched };
          },
          { input: { techs: 5 } }
        );
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
