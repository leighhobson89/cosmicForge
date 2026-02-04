import path from "node:path";
import net from "node:net";
import http from "node:http";
import fs from "node:fs";
import { chromium } from "playwright";

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close(() => {
        if (!port) {
          reject(new Error("Failed to acquire a free port"));
          return;
        }
        resolve(port);
      });
    });
  });
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".png":
      return "image/png";
    case ".ico":
      return "image/x-icon";
    case ".mp3":
      return "audio/mpeg";
    default:
      return "application/octet-stream";
  }
}

async function startStaticServer({ rootDir }) {
  const port = await getFreePort();

  const server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
      let pathname = decodeURIComponent(url.pathname);

      if (pathname === "/") {
        pathname = "/index.html";
      }

      const resolvedPath = path.resolve(rootDir, `.${pathname}`);
      const resolvedRoot = path.resolve(rootDir);
      if (!resolvedPath.startsWith(resolvedRoot)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
        res.writeHead(404);
        res.end("Not Found");
        return;
      }

      const data = fs.readFileSync(resolvedPath);
      res.writeHead(200, { "Content-Type": getContentType(resolvedPath) });
      res.end(data);
    } catch {
      res.writeHead(500);
      res.end("Server Error");
    }
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  return { server, port };
}

function normalizeOnboardingText(text) {
  return String(text ?? "").replace(/\*/g, "\n").trim();
}

async function waitForOnboardingText(page, expectedText, timeout = 60000) {
  const expected = normalizeOnboardingText(expectedText);

  await page.waitForFunction(
    (needle) => {
      const els = Array.from(document.querySelectorAll(".onboarding-step-text"));
      if (!els.length) return false;
      return els.some((el) => (el.textContent ?? "").trim() === needle);
    },
    expected,
    { timeout }
  );
}

async function assertVisible(locator, timeout = 60000) {
  await locator.waitFor({ state: "visible", timeout });
}

async function step({ page, text, targetLocator, action, waitAfterMs }) {
  if (globalThis.smokeStep) {
    await globalThis.smokeStep(
      `onboarding: ${normalizeOnboardingText(text)}`,
      async () => {
        await waitForOnboardingText(page, text);
        if (targetLocator) {
          await assertVisible(targetLocator);
        }
        if (action) {
          await action();
        }
        if (waitAfterMs) {
          await page.waitForTimeout(waitAfterMs);
        }
      },
      { input: { text } }
    );
    return;
  }

  await waitForOnboardingText(page, text);
  if (targetLocator) {
    await assertVisible(targetLocator);
  }
  if (action) {
    await action();
  }
  if (waitAfterMs) {
    await page.waitForTimeout(waitAfterMs);
  }
}

describe("launchAndOnboard", () => {
  globalThis.smokeTest(
    "launches app and completes onboarding happy path",
    async () => {
      const pioneerId = `autoPioneer-${Date.now()}`;

      const rootDir = path.resolve(process.cwd());
      const { server, port } = await startStaticServer({ rootDir });

      const browser = await chromium.launch({
        headless: process.env.HEADLESS === "1"
      });

      try {
        const context = await browser.newContext();
        const page = await context.newPage();

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

        // Onboarding prompt
        await globalThis.smokeStep("confirm onboarding start", async () => {
          await page.waitForTimeout(100);
          await page.waitForSelector("#modalConfirm", { timeout: 60000 });
          await page.waitForSelector("#modalCancel", { timeout: 60000 });

          const onboardingYesText = ((await page.locator("#modalConfirm").textContent()) ?? "").trim();
          expect(onboardingYesText).toBe("YES");

          await page.waitForTimeout(100);
          await page.click("#modalConfirm");
        });

        // Give ourselves enough currency/research to follow the onboarding quickly.
        await globalThis.smokeStep(
          "seed cash + research",
          async () => {
            await page.evaluate(async () => {
              const mod = await import("/resourceDataObject.js");
              mod.setResourceDataObject(1000000, "currency", ["cash"]);
              mod.setResourceDataObject(1000000, "research", ["quantity"]);
            });
          },
          { input: { cash: 1000000, research: 1000000 } }
        );

        const onboardingOverlay = page.locator("#onboardingOverlay");
        await globalThis.smokeStep("wait for onboarding overlay", async () => {
          await onboardingOverlay.waitFor({ state: "visible", timeout: 60000 });
        }, { input: { selector: "#onboardingOverlay" } });

        // Resources -> Hydrogen -> Gain to 50
        await step({
          page,
          text: "Click the Hydrogen Option",
          targetLocator: page.locator("#hydrogenOption"),
          action: async () => {
            await page.click("#tab1");
            await page.click("#hydrogenOption");
          }
        });

        const hydrogenGainButton = page.locator("#hydrogenGainRow button");
        await step({
          page,
          text: "Click the Gain button",
          targetLocator: hydrogenGainButton,
          action: async () => {
            await hydrogenGainButton.click();
          }
        });

        await step({
          page,
          text: "Continue clicking Gain until you have 50 Hydrogen",
          targetLocator: page.locator("#hydrogenQuantity"),
          action: async () => {
            for (let i = 0; i < 49; i += 1) {
              await hydrogenGainButton.click();
            }
          }
        });

        await step({
          page,
          text: "Buy a Hydrogen AutoBuyer",
          targetLocator: page.getByRole("button", { name: "Add 2 Hydrogen /s" }),
          action: async () => {
            await page.getByRole("button", { name: "Add 2 Hydrogen /s" }).click();
          }
        });

        // Research tab
        await step({
          page,
          text: "Click the Research Tab",
          targetLocator: page.locator("#tab3"),
          action: async () => {
            await page.click("#tab3");
          }
        });

        await step({
          page,
          text: "Click Research",
          targetLocator: page.locator("#researchOption"),
          action: async () => {
            await page.click("#researchOption");
          }
        });

        const scienceKitButton = page.getByRole("button", { name: "Add 0.5 Research /s" });
        await step({
          page,
          text: "Buy 3 Science Kits",
          targetLocator: scienceKitButton,
          action: async () => {
            for (let i = 0; i < 3; i += 1) {
              await scienceKitButton.click();
            }
          }
        });

        await step({
          page,
          text: "Turn off the Science Kit toggle",
          targetLocator: page.locator('label[for="scienceKitToggle"]'),
          action: async () => {
            await page.locator('label[for="scienceKitToggle"]').click();
          }
        });

        await step({
          page,
          text: "You can switch on and off many items in the game and when off they wont produce*but wont consume energy",
          targetLocator: page.locator("#researchRate"),
          waitAfterMs: 4000
        });

        await step({
          page,
          text: "Turn the Science Kit toggle back on",
          targetLocator: page.locator('label[for="scienceKitToggle"]'),
          action: async () => {
            await page.locator('label[for="scienceKitToggle"]').click();
          }
        });

        // Back to resources
        await step({
          page,
          text: "Return to the Resources Tab",
          targetLocator: page.locator("#tab1"),
          action: async () => {
            await page.click("#tab1");
          }
        });

        await step({
          page,
          text: "Eventually your storage will fill up*and you will need to expand it.",
          targetLocator: page.locator("#hydrogenQuantity"),
          waitAfterMs: 4000
        });

        await step({
          page,
          text: "Click the Increase Storage Button when storage full.",
          targetLocator: page.getByRole("button", { name: "Increase Storage" }),
          action: async () => {
            // Ensure storage is full before upgrading.
            for (let i = 0; i < 200; i += 1) {
              const text = ((await page.locator("#hydrogenQuantity").textContent()) ?? "").replace(/\s+/g, "");
              if (text.includes("150/150")) break;
              await hydrogenGainButton.click();
            }
            await page.getByRole("button", { name: "Increase Storage" }).click();
          }
        });

        await step({
          page,
          text: "It cost you all your Hydrogen but now you can store double.",
          targetLocator: page.locator("#hydrogenQuantity"),
          waitAfterMs: 3000
        });

        await step({
          page,
          text: "Feel free to click Gain to help your Auto Buyer along.",
          targetLocator: hydrogenGainButton,
          action: async () => {
            for (let i = 0; i < 600; i += 1) {
              const current = await page.evaluate(async () => {
                const mod = await import("/resourceDataObject.js");
                return mod.resourceData?.resources?.hydrogen?.quantity ?? 0;
              });
              if (current >= 300) break;
              await hydrogenGainButton.click();
            }
          },
          waitAfterMs: 3000
        });

        await step({
          page,
          text: "Click the Sell Button.",
          targetLocator: page.locator("#hydrogenSellRow").getByRole("button", { name: "Sell" }),
          action: async () => {
            // Fill up to 300 hydrogen to satisfy the next condition segment.
            for (let i = 0; i < 400; i += 1) {
              const current = await page.evaluate(async () => {
                const mod = await import("/resourceDataObject.js");
                return mod.resourceData?.resources?.hydrogen?.quantity ?? 0;
              });
              if (current >= 300) break;
              await hydrogenGainButton.click();
            }

            await page.locator("#hydrogenSellRow").getByRole("button", { name: "Sell" }).click();
          }
        });

        await step({
          page,
          text: "Your Cash is shown here.",
          targetLocator: page.locator("#cashStat"),
          waitAfterMs: 3000
        });

        // Back to research and tech
        await step({
          page,
          text: "Let's return to the Research Tab",
          targetLocator: page.locator("#tab3"),
          action: async () => {
            await page.click("#tab3");
          }
        });

        await step({
          page,
          text: "Click Technology",
          targetLocator: page.locator("p.tab3\\.option2", { hasText: "Technology" }),
          action: async () => {
            await page.locator("p.tab3\\.option2", { hasText: "Technology" }).click();
          }
        });

        await step({
          page,
          text: "Here you can see and select technologies to Research.",
          targetLocator: page.locator("p.tab3\\.option2", { hasText: "Technology" }),
          waitAfterMs: 3000
        });

        await step({
          page,
          text: "Click Tech Tree",
          targetLocator: page.locator("p.tab3\\.option3", { hasText: "Tech Tree" }),
          action: async () => {
            await page.locator("p.tab3\\.option3", { hasText: "Tech Tree" }).click();
          }
        });

        await step({
          page,
          text: "Here you see a graphical representation of techs. * It will grow out as you continue progression in the game.",
          targetLocator: page.locator("p.tab3\\.option3", { hasText: "Tech Tree" }),
          waitAfterMs: 4000
        });

        await step({
          page,
          text: "Return to the Technology Option",
          targetLocator: page.locator("p.tab3\\.option2", { hasText: "Technology" }),
          action: async () => {
            await page.locator("p.tab3\\.option2", { hasText: "Technology" }).click();
          }
        });

        await step({
          page,
          text: "When you have 150 Research, click Research on Knowledge Sharing",
          targetLocator: page.locator("#techKnowledgeSharingRow").getByRole("button", { name: "Research" }),
          action: async () => {
            await page.locator("#techKnowledgeSharingRow").getByRole("button", { name: "Research" }).click();
          }
        });

        {
          await page.waitForTimeout(300);
          const modalConfirm = page.locator("#modalConfirm");
          if (await modalConfirm.isVisible({ timeout: 3000 }).catch(() => false)) {
            const headerText = ((await page.locator(".modal-header h4").textContent()) ?? "").trim().toLowerCase();
            const bodyText = ((await page.locator(".modal-content p").textContent()) ?? "").trim().toLowerCase();
            if (headerText.includes("knowledge") || bodyText.includes("science clubs")) {
              await modalConfirm.click();
            }
          }
        }

        await step({
          page,
          text: "Click Research",
          targetLocator: page.locator("#researchOption"),
          action: async () => {
            await page.click("#researchOption");
          }
        });

        await step({
          page,
          text: "Once you save up more Cash you can buy a Science Club * You will Research much faster!",
          targetLocator: page.getByRole("button", { name: "Add 8 Research /s" }),
          waitAfterMs: 4000
        });

        // Settings
        await step({
          page,
          text: "Next we will take a look at the Settings Tab.",
          targetLocator: page.locator("#tab8"),
          action: async () => {
            await page.click("#tab8");
          }
        });

        await step({
          page,
          text: "While we are here, lets change the look and feel.",
          targetLocator: page.locator("p.tab8\\.option1", { hasText: "Visual" }),
          action: async () => {
            await page.locator("p.tab8\\.option1", { hasText: "Visual" }).click();
          }
        });

        await step({
          page,
          text: "In this menu you can customise the look and feel of the game.*Scroll down to find Themes.",
          targetLocator: page.locator("#themeSelect"),
          waitAfterMs: 4000
        });

        await step({
          page,
          text: "Click the Dropdown",
          targetLocator: page.locator("#themeSelect .dropdown"),
          action: async () => {
            await page.locator("#themeSelect .dropdown").click();
          }
        });

        await step({
          page,
          text: "Select Dark",
          targetLocator: page.locator('#themeSelect .dropdown-option[data-value="dark"]'),
          action: async () => {
            await page.locator('#themeSelect .dropdown-option[data-value="dark"]').click();
          }
        });

        // Game Options
        await step({
          page,
          text: "Now Click Game Options",
          targetLocator: page.locator("p.tab8\\.option3", { hasText: "Game Options" }),
          action: async () => {
            await page.locator("p.tab8\\.option3", { hasText: "Game Options" }).click();
          }
        });

        await step({
          page,
          text: "Click the Background Ambience Option toggle switch",
          targetLocator: page.locator('label[for="backGroundAudioToggle"]'),
          action: async () => {
            await page.locator('label[for="backGroundAudioToggle"]').click();
          }
        });

        await step({
          page,
          text: "There, some ambience!* Now I will show you the help file * so you can learn more about the game and really enjoy it!",
          targetLocator: page.locator('label[for="backGroundAudioToggle"]'),
          waitAfterMs: 4000
        });

        // Cosmicopedia
        await step({
          page,
          text: "Click Cosmicopedia",
          targetLocator: page.locator("#cosmicopedia .main-category-text"),
          action: async () => {
            await page.waitForTimeout(200);
            await page.locator("#cosmicopedia .main-category-text").click();
          }
        });

        await step({
          page,
          text: "Get Started will go over the steps you performed in*this tutorial",
          targetLocator: page.locator("#getStartedOption"),
          waitAfterMs: 4000
        });

        await step({
          page,
          text: "Story gives you the background and lore around the game",
          targetLocator: page.locator("#storyOption"),
          waitAfterMs: 4000
        });

        await step({
          page,
          text: "Click 'Concepts - Early'",
          targetLocator: page.locator("#conceptsEarlyOption"),
          action: async () => {
            await page.locator("#conceptsEarlyOption").click();
          }
        });

        await step({
          page,
          text: "When you are done Click 'Concepts - Mid Game'",
          targetLocator: page.locator("#conceptsMidOption"),
          action: async () => {
            await page.locator("#conceptsMidOption").click();
          }
        });

        await step({
          page,
          text: "When you are done Click 'Concepts - Late'",
          targetLocator: page.locator("#conceptsLateOption"),
          action: async () => {
            await page.locator("#conceptsLateOption").click();
          }
        });

        await step({
          page,
          text: "This is all the background you need!  One last thing before I leave * you to explore and Forge!",
          targetLocator: page.locator("#conceptsLateOption"),
          waitAfterMs: 4000
        });

        await step({
          page,
          text: "Click 'Saving / Loading'",
          targetLocator: page.locator("#options .collapsible-content.open p.tab8\\.option2", { hasText: "Saving / Loading" }),
          action: async () => {
            const optionsContent = page.locator("#options .collapsible-content");
            const optionsIsOpen = await optionsContent
              .evaluate((el) => el.classList.contains("open"))
              .catch(() => false);

            if (!optionsIsOpen) {
              await page.locator("#options .collapsible-header").click();
              await page.locator("#options .collapsible-content.open").waitFor({
                state: "visible",
                timeout: 60000
              });
            }

            await page.locator("#options .collapsible-content.open p.tab8\\.option2", { hasText: "Saving / Loading" }).click();
          }
        });

        await step({
          page,
          text: "Click The Autosave Toggle Switch",
          targetLocator: page.locator('label[for="autoSaveToggle"]'),
          action: async () => {
            await page.locator('label[for="autoSaveToggle"]').click();
          }
        });

        await step({
          page,
          text: "You game will now save periodically*Thats it!  Go forth and Forge, Mia'Plac!",
          targetLocator: page.locator('label[for="autoSaveToggle"]'),
          waitAfterMs: 7000
        });

        // Completion popup
        await globalThis.smokeStep("wait for onboarding complete popup", async () => {
          await page.waitForFunction(() => {
            const header = document.querySelector(".modal-header h4")?.textContent?.trim();
            const body = document.querySelector(".modal-content p")?.textContent?.trim();
            return header === "ONBOARDING COMPLETE" && body === "Onboarding is over.";
          }, null, { timeout: 60000 });
        });

        await globalThis.smokeStep(
          "confirm onboarding complete modal",
          async () => {
            await page.click("#modalConfirm");
          },
          { input: { selector: "#modalConfirm" } }
        );

        await globalThis.smokeStep(
          "assert main UI still accessible",
          async () => {
            await page.waitForSelector("#tab1", { timeout: 60000 });
          },
          { input: { selector: "#tab1" } }
        );
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    180000
  );
});
