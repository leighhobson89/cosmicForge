import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

function safeJoin(baseDir, reqPath) {
  const decoded = decodeURIComponent(reqPath);
  const clean = decoded.replace(/^\/+/, '');
  const resolved = path.resolve(baseDir, clean);
  if (!resolved.startsWith(baseDir)) return null;
  return resolved;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const pathname = url.pathname === '/' ? '/tools/mechanics-map/index.html' : url.pathname;

    const filePath = safeJoin(repoRoot, pathname);
    if (!filePath) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad request');
      return;
    }

    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentTypeFor(filePath) });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(0, '127.0.0.1', () => {
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  console.log(`Mechanics Map running at http://127.0.0.1:${port}/`);
});
