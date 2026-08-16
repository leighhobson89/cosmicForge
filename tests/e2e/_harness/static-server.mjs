// Minimal static file server for the game root, used as the Playwright webServer.
// Serves the project directory so page-context `import('/game.js')` resolves the
// same way it does in the packaged app.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const PORT = Number(process.env.E2E_PORT || 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === '/' || pathname === '') pathname = '/index.html';
    if (pathname === '/__e2e_health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
      return;
    }

    const resolved = path.resolve(ROOT, `.${pathname}`);
    if (!resolved.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(resolved).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(fs.readFileSync(resolved));
  } catch {
    res.writeHead(500);
    res.end('Server Error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[e2e] static server listening on http://127.0.0.1:${PORT} (root: ${ROOT})`);
});
