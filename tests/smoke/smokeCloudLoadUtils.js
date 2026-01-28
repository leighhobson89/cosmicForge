import path from "node:path";
import net from "node:net";
import http from "node:http";
import fs from "node:fs";

export async function getFreePort() {
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

export async function startStaticServer({ rootDir }) {
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

export async function createCloudLoadedGame({ page, port, pioneerId }) {
  const runStep = globalThis.smokeStep
    ? (name, fn, meta) => globalThis.smokeStep(name, fn, meta)
    : async (_name, fn) => fn();

  await runStep(
    "navigate to app",
    async () => {
      await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
    },
    { input: { port } }
  );

  await runStep(
    "enter pioneer id",
    async () => {
      await page.waitForSelector("#pioneerCodeName", { timeout: 60000 });
      await page.fill("#pioneerCodeName", pioneerId);
      await page.click("#modalConfirm");
    },
    { input: { pioneerId } }
  );

  await runStep("accept fullscreen prompt", async () => {
    await page.waitForSelector("#fullScreenCheckBox", { timeout: 60000 });
    await page.click("#fullScreenCheckBox");
    await page.click("#modalConfirm");
  });

  await page.waitForTimeout(300);

  const notificationText = await runStep("wait for cloud-load notification", async () => {
    await page.waitForSelector(".notification-container.classification-loadSave", { timeout: 10000 });
    await page.waitForFunction(() => {
      const containers = document.querySelectorAll(".notification-container.classification-loadSave");
      const text = Array.from(containers)
        .map((el) => el.textContent ?? "")
        .join("\n");
      return text.includes("Game loaded successfully") || text.includes("No saved game data found");
    }, null, { timeout: 10000 });

    return await page.evaluate(() => {
      const containers = document.querySelectorAll(".notification-container.classification-loadSave");
      return Array.from(containers)
        .map((el) => el.textContent ?? "")
        .join("\n");
    });
  });

  if (!notificationText.includes("Game loaded successfully")) {
    throw new Error(
      `Cloud load failed for pioneer '${pioneerId}'. Notification: ${notificationText.trim()}`
    );
  }

  await runStep("wait for main UI", async () => {
    await page.waitForSelector("#tab1", { timeout: 60000 });
  });
}
