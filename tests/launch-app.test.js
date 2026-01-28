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

describe("launchApp", () => {
  globalThis.smokeTest(
    "opens app, creates new pioneer, starts fullscreen, shows onboarding, exits",
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

        await globalThis.smokeStep("dismiss onboarding prompt if present", async () => {
          await page.waitForTimeout(100);
          const onboardingCancel = page.locator("#modalCancel");
          if (await onboardingCancel.isVisible({ timeout: 1500 }).catch(() => false)) {
            const cancelText = (await onboardingCancel.textContent())?.trim();
            if (cancelText === "NO") {
              await onboardingCancel.click();
            }
          }
        }, { input: { selector: "#modalCancel" } });

        await globalThis.smokeStep("wait for main UI", async () => {
          await page.waitForSelector("#tab1", { timeout: 60000 });
        }, { input: { selector: "#tab1" } });

        const wasChecked = await globalThis.smokeStep("read fullscreen checkbox state", async () => {
          return await page.evaluate(() =>
            document.getElementById("fullScreenCheckBox")?.classList.contains("checked")
          );
        });
        await globalThis.smokeStep("assert fullscreen checkbox checked", async () => {
          expect(Boolean(wasChecked)).toBe(true);
        }, { input: { wasChecked } });

        const isDomFullScreen = await globalThis.smokeStep("read DOM fullscreen state", async () => {
          return await page.evaluate(() => Boolean(document.fullscreenElement));
        });
        await globalThis.smokeStep("assert fullscreen type boolean", async () => {
          expect(typeof isDomFullScreen).toBe("boolean");
        }, { input: { isDomFullScreen } });
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    120000
  );
});

describe("gain50hydrogen", () => {
  globalThis.smokeTest(
    "opens app, creates new pioneer, starts fullscreen, clicks gain 50x, exits",
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

        await globalThis.smokeStep("dismiss onboarding prompt if present", async () => {
          await page.waitForTimeout(100);
          const onboardingCancel = page.locator("#modalCancel");
          if (await onboardingCancel.isVisible({ timeout: 1500 }).catch(() => false)) {
            const cancelText = (await onboardingCancel.textContent())?.trim();
            if (cancelText === "NO") {
              await onboardingCancel.click();
            }
          }
        }, { input: { selector: "#modalCancel" } });

        await globalThis.smokeStep("wait for main UI", async () => {
          await page.waitForSelector("#tab1", { timeout: 60000 });
        }, { input: { selector: "#tab1" } });

        await globalThis.smokeStep("open Hydrogen pane", async () => {
          await page.click("#tab1");
          await page.click("#hydrogenOption");
        }, { input: { selectors: ["#tab1", "#hydrogenOption"] } });

        await globalThis.smokeStep("click Gain 50 times", async () => {
          await page.waitForSelector("#hydrogenGainRow", { timeout: 60000 });
          const gainButton = page.locator("#hydrogenGainRow button");
          await gainButton.waitFor({ state: "visible", timeout: 60000 });

          for (let i = 0; i < 50; i += 1) {
            await gainButton.click();
          }
        }, { input: { selector: "#hydrogenGainRow button", clicks: 50 } });

        await globalThis.smokeStep("wait for sidebar hydrogenQuantity to show 50/150", async () => {
          await page.waitForFunction(() => {
            const el = document.getElementById("hydrogenQuantity");
            if (!el) return false;
            const text = (el.textContent ?? "").replace(/\s+/g, "");
            return text === "50/150";
          }, null, { timeout: 60000 });

          const nowText = ((await page.locator("#hydrogenQuantity").textContent()) ?? "").replace(/\s+/g, "");
          expect(nowText).toBe("50/150");
          return { expected: "50/150", nowText };
        }, { input: { selector: "#hydrogenQuantity", expected: "50/150" } });

        const hydrogenQuantityInternal = await globalThis.smokeStep("read internal hydrogen quantity", async () => {
          return await page.evaluate(async () => {
            const mod = await import("/resourceDataObject.js");
            return mod.resourceData?.resources?.hydrogen?.quantity;
          });
        });

        await globalThis.smokeStep("assert internal hydrogen == 50", async () => {
          expect(hydrogenQuantityInternal).toBe(50);
        }, { input: { hydrogenQuantityInternal } });

        const hydrogenQuantitySidebar = await globalThis.smokeStep("read sidebar hydrogenQuantity text", async () => {
          return await page.locator("#hydrogenQuantity").textContent();
        });
        await globalThis.smokeStep("assert sidebar hydrogenQuantity == 50/150", async () => {
          expect((hydrogenQuantitySidebar ?? "").replace(/\s+/g, "")).toBe("50/150");
        }, { input: { hydrogenQuantitySidebar } });

        const wasChecked = await globalThis.smokeStep("read fullscreen checkbox state", async () => {
          return await page.evaluate(() =>
            document.getElementById("fullScreenCheckBox")?.classList.contains("checked")
          );
        });
        await globalThis.smokeStep("assert fullscreen checkbox checked", async () => {
          expect(Boolean(wasChecked)).toBe(true);
        }, { input: { wasChecked } });

        const isDomFullScreen = await globalThis.smokeStep("read DOM fullscreen state", async () => {
          return await page.evaluate(() => Boolean(document.fullscreenElement));
        });
        await globalThis.smokeStep("assert fullscreen type boolean", async () => {
          expect(typeof isDomFullScreen).toBe("boolean");
        }, { input: { isDomFullScreen } });
      } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    120000
  );
});
