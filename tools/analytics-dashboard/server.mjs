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

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://riogcxvtomyjlzkcnujf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpb2djeHZ0b215amx6a2NudWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMjY1NDgsImV4cCI6MjA1OTYwMjU0OH0.HH7KXPrcORvl6Wiefupl422gRYxAa_kFCRM2-puUcsQ';
const TABLE = process.env.SUPABASE_ANALYTICS_TABLE || 'CosmicForge_analytics_events';

async function supabaseFetch(pathname, searchParams) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${pathname}`);
  for (const [k, v] of searchParams.entries()) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: 'application/json',
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Supabase ${res.status}: ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

function toInt(value, fallback) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normaliseKey(value, fallback = 'unknown') {
  const s = String(value ?? '').trim();
  return s.length ? s : fallback;
}

function takeTop(map, limit) {
  const rows = Array.from(map.entries()).map(([key, value]) => ({ key, value }));
  rows.sort((a, b) => b.value - a.value);
  return rows.slice(0, limit);
}

function sumTop(map, limit) {
  const rows = Array.from(map.entries()).map(([key, value]) => ({ key, value }));
  rows.sort((a, b) => b.value - a.value);
  return rows.slice(0, limit);
}

function aggregate(events) {
  const viewCounts = new Map();
  const viewDurationMs = new Map();
  const clickCounts = new Map();
  const achievementCounts = new Map();
  const starSystemSeenCounts = new Map();

  const blackHoleDiscoveredClients = new Set();
  const blackHoleResearchedClients = new Set();

  const legendaryAsteroidClients = new Set();
  let legendaryAsteroidDiscoveries = 0;

  const themeSelectionCounts = new Map();
  const themeSelectionClientsById = new Map();

  const settingsSnapshotClientsByKeyValue = new Map();

  const philosophyClientsById = new Map();
  const ascendencyPerkPurchaseCounts = new Map();
  const philosophyRepeatableCounts = new Map();

  let miaplacidusReached = 0;

  const sessions = new Set();
  const clients = new Set();

  for (const e of events) {
    if (e.session_id) sessions.add(e.session_id);
    if (e.client_id) clients.add(e.client_id);

    const payload = e.payload && typeof e.payload === 'object' ? e.payload : {};

    if (e.event_name === 'ui_view') {
      const viewId = normaliseKey(payload.view_id);
      viewCounts.set(viewId, (viewCounts.get(viewId) || 0) + 1);
    }

    if (e.event_name === 'ui_view_duration') {
      const viewId = normaliseKey(payload.view_id);
      const ms = typeof payload.duration_ms === 'number' ? payload.duration_ms : 0;
      viewDurationMs.set(viewId, (viewDurationMs.get(viewId) || 0) + Math.max(0, ms));
    }

    if (e.event_name === 'dom_click') {
      const id = payload.id ? `#${payload.id}` : '(no id)';
      const tag = payload.tag ? String(payload.tag).toUpperCase() : '(no tag)';
      const key = `${tag} ${id}`;
      clickCounts.set(key, (clickCounts.get(key) || 0) + 1);
    }

    if (e.event_name === 'achievement_granted') {
      const id = normaliseKey(payload.achievement_id);
      achievementCounts.set(id, (achievementCounts.get(id) || 0) + 1);
    }

    if (e.event_name === 'philosophy_selected') {
      const philosophyId = normaliseKey(payload.philosophy_id);
      if (!philosophyClientsById.has(philosophyId)) {
        philosophyClientsById.set(philosophyId, new Set());
      }
      if (e.client_id) {
        philosophyClientsById.get(philosophyId).add(e.client_id);
      }
    }

    if (e.event_name === 'ascendency_perk_purchased') {
      const perkId = normaliseKey(payload.perk_id);
      ascendencyPerkPurchaseCounts.set(perkId, (ascendencyPerkPurchaseCounts.get(perkId) || 0) + 1);
    }

    if (e.event_name === 'philosophy_repeatable_researched') {
      const philosophyId = normaliseKey(payload.philosophy_id);
      const techId = normaliseKey(payload.tech_id);
      const key = `${philosophyId}:${techId}`;
      philosophyRepeatableCounts.set(key, (philosophyRepeatableCounts.get(key) || 0) + 1);
    }

    if (e.event_name === 'legendary_asteroid_discovered') {
      legendaryAsteroidDiscoveries += 1;
      if (e.client_id) {
        legendaryAsteroidClients.add(e.client_id);
      }
    }

    if (e.event_name === 'theme_selected') {
      const themeId = normaliseKey(payload.theme_id);
      themeSelectionCounts.set(themeId, (themeSelectionCounts.get(themeId) || 0) + 1);

      if (!themeSelectionClientsById.has(themeId)) {
        themeSelectionClientsById.set(themeId, new Set());
      }
      if (e.client_id) {
        themeSelectionClientsById.get(themeId).add(e.client_id);
      }
    }

    if (e.event_name === 'settings_snapshot') {
      const pairs = [
        ['background_audio', !!payload.background_audio],
        ['sfx', !!payload.sfx],
        ['custom_pointer', !!payload.custom_pointer],
        ['mouse_trail', !!payload.mouse_trail],
      ];

      for (const [settingId, enabled] of pairs) {
        const key = `${settingId}:${enabled ? 'on' : 'off'}`;
        if (!settingsSnapshotClientsByKeyValue.has(key)) {
          settingsSnapshotClientsByKeyValue.set(key, new Set());
        }
        if (e.client_id) {
          settingsSnapshotClientsByKeyValue.get(key).add(e.client_id);
        }
      }
    }

    if (e.event_name === 'black_hole_discovered') {
      if (e.client_id) {
        blackHoleDiscoveredClients.add(e.client_id);
      }
    }

    if (e.event_name === 'black_hole_research_completed') {
      if (e.client_id) {
        blackHoleResearchedClients.add(e.client_id);
      }
    }

    if (e.event_name === 'star_system_changed' || e.event_name === 'star_system_seen') {
      const sys = normaliseKey(payload.to ?? payload.star_system);
      starSystemSeenCounts.set(sys, (starSystemSeenCounts.get(sys) || 0) + 1);
    }

    if (e.event_name === 'milestone_reached') {
      if (payload.milestone_id === 'reached_star_miaplacidus') {
        miaplacidusReached += 1;
      }
    }
  }

  return {
    total_events: events.length,
    unique_sessions: sessions.size,
    unique_clients: clients.size,
    miaplacidus_reached_count: miaplacidusReached,
    black_hole_discovered_unique_clients: blackHoleDiscoveredClients.size,
    black_hole_researched_unique_clients: blackHoleResearchedClients.size,
    legendary_asteroid_discoveries: legendaryAsteroidDiscoveries,
    legendary_asteroid_unique_clients: legendaryAsteroidClients.size,
    theme_selected_counts: takeTop(themeSelectionCounts, 50),
    theme_selected_unique_clients: takeTop(
      new Map(Array.from(themeSelectionClientsById.entries()).map(([k, set]) => [k, set.size])),
      50
    ),
    settings_snapshot_unique_clients: takeTop(
      new Map(Array.from(settingsSnapshotClientsByKeyValue.entries()).map(([k, set]) => [k, set.size])),
      50
    ),
    philosophy_selected_unique_clients: takeTop(
      new Map(Array.from(philosophyClientsById.entries()).map(([k, set]) => [k, set.size])),
      50
    ),
    ascendency_perk_purchases: takeTop(ascendencyPerkPurchaseCounts, 50),
    philosophy_repeatables_researched: takeTop(philosophyRepeatableCounts, 50),
    top_views: takeTop(viewCounts, 30),
    top_view_durations: sumTop(viewDurationMs, 30),
    top_clicks: takeTop(clickCounts, 30),
    top_achievements: takeTop(achievementCounts, 30),
    star_system_activity: takeTop(starSystemSeenCounts, 30),
  };
}

async function getEvents({ sinceIso, limit }) {
  const params = new URLSearchParams();
  params.set('select', 'event_name,event_time,client_id,session_id,payload');
  params.set('event_time', `gte.${sinceIso}`);
  params.set('order', 'event_time.desc');
  params.set('limit', String(limit));

  return await supabaseFetch(TABLE, params);
}

function writeJson(res, status, value) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(value));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');

    if (url.pathname.startsWith('/api/')) {
      if (url.pathname === '/api/health') {
        writeJson(res, 200, { ok: true });
        return;
      }

      if (url.pathname === '/api/report') {
        const days = clamp(toInt(url.searchParams.get('days'), 7), 1, 365);
        const limit = clamp(toInt(url.searchParams.get('limit'), 20000), 1, 50000);
        const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        const events = await getEvents({ sinceIso, limit });
        const report = aggregate(events || []);
        writeJson(res, 200, { since: sinceIso, days, limit, report });
        return;
      }

      writeJson(res, 404, { error: 'Not found' });
      return;
    }

    const pathname = url.pathname === '/' ? '/tools/analytics-dashboard/index.html' : url.pathname;
    const filePath = safeJoin(repoRoot, pathname);

    if (!filePath) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad request');
      return;
    }

    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentTypeFor(filePath) });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(String(err?.message || err));
  }
});

server.listen(0, '127.0.0.1', () => {
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  console.log(`Analytics Dashboard running at http://127.0.0.1:${port}/`);
});
