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
  test("opens app, creates new pioneer, starts fullscreen, shows onboarding, exits", async () => {
    const pioneerId = `autoPioneer-${Date.now()}`;

    const rootDir = path.resolve(process.cwd());
    const { server, port } = await startStaticServer({ rootDir });

    const browser = await chromium.launch({
      headless: process.env.HEADLESS === "1"
    });

    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      // Keep the smoke test deterministic (avoid waiting on cloud save).
      await page.route("**/riogcxvtomyjlzkcnujf.supabase.co/**", (route) => route.abort());

      await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });

      await page.waitForSelector("#pioneerCodeName", { timeout: 60000 });
      await page.fill("#pioneerCodeName", pioneerId);
      await page.click("#modalConfirm");

      await page.waitForSelector("#fullScreenCheckBox", { timeout: 60000 });
      await page.click("#fullScreenCheckBox");
      await page.click("#modalConfirm");

      await page.waitForTimeout(100);
      const onboardingCancel = page.locator("#modalCancel");
      if (await onboardingCancel.isVisible({ timeout: 1500 }).catch(() => false)) {
        const cancelText = (await onboardingCancel.textContent())?.trim();
        if (cancelText === "NO") {
          await onboardingCancel.click();
        }
      }

      await page.waitForSelector("#tab1", { timeout: 60000 });

      const wasChecked = await page.evaluate(() =>
        document.getElementById("fullScreenCheckBox")?.classList.contains("checked")
      );
      expect(Boolean(wasChecked)).toBe(true);

      const isDomFullScreen = await page.evaluate(() => Boolean(document.fullscreenElement));
      expect(typeof isDomFullScreen).toBe("boolean");
    } finally {
      await browser.close();
      await new Promise((resolve) => server.close(resolve));
    }
  }, 120000);
});

describe("gain50hydrogen", () => {
  test("opens app, creates new pioneer, starts fullscreen, clicks gain 50x, exits", async () => {
    const pioneerId = `autoPioneer-${Date.now()}`;

    const rootDir = path.resolve(process.cwd());
    const { server, port } = await startStaticServer({ rootDir });

    const browser = await chromium.launch({
      headless: process.env.HEADLESS === "1"
    });

    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      // Keep the smoke test deterministic (avoid waiting on cloud save).
      await page.route("**/riogcxvtomyjlzkcnujf.supabase.co/**", (route) => route.abort());

      await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });

      await page.waitForSelector("#pioneerCodeName", { timeout: 60000 });
      await page.fill("#pioneerCodeName", pioneerId);
      await page.click("#modalConfirm");

      await page.waitForSelector("#fullScreenCheckBox", { timeout: 60000 });
      await page.click("#fullScreenCheckBox");
      await page.click("#modalConfirm");

      await page.waitForTimeout(100);
      const onboardingCancel = page.locator("#modalCancel");
      if (await onboardingCancel.isVisible({ timeout: 1500 }).catch(() => false)) {
        const cancelText = (await onboardingCancel.textContent())?.trim();
        if (cancelText === "NO") {
          await onboardingCancel.click();
        }
      }

      await page.waitForSelector("#tab1", { timeout: 60000 });

      await page.click("#tab1");
      await page.click("#hydrogenOption");

      await page.waitForSelector("#hydrogenGainRow", { timeout: 60000 });
      const gainButton = page.locator("#hydrogenGainRow button");
      await gainButton.waitFor({ state: "visible", timeout: 60000 });

      for (let i = 0; i < 50; i += 1) {
        await gainButton.click();
      }

      await page.waitForFunction(() => {
        const el = document.getElementById("hydrogenQuantity");
        if (!el) return false;
        const text = (el.textContent ?? "").replace(/\s+/g, "");
        return text === "50/150";
      }, null, { timeout: 60000 });

      const hydrogenQuantityInternal = await page.evaluate(async () => {
        const mod = await import("/resourceDataObject.js");
        return mod.resourceData?.resources?.hydrogen?.quantity;
      });

      expect(hydrogenQuantityInternal).toBe(50);

      const hydrogenQuantitySidebar = await page.locator("#hydrogenQuantity").textContent();
      expect((hydrogenQuantitySidebar ?? "").replace(/\s+/g, "")).toBe("50/150");

      const wasChecked = await page.evaluate(() =>
        document.getElementById("fullScreenCheckBox")?.classList.contains("checked")
      );
      expect(Boolean(wasChecked)).toBe(true);

      const isDomFullScreen = await page.evaluate(() => Boolean(document.fullscreenElement));
      expect(typeof isDomFullScreen).toBe("boolean");
    } finally {
      await browser.close();
      await new Promise((resolve) => server.close(resolve));
    }
  }, 120000);
});
