const saveInput = document.getElementById('saveInput');
const decodeBtn = document.getElementById('decodeBtn');
const clearBtn = document.getElementById('clearBtn');
const searchInput = document.getElementById('searchInput');
const expandAllBtn = document.getElementById('expandAllBtn');
const collapseAllBtn = document.getElementById('collapseAllBtn');
const themeSelect = document.getElementById('themeSelect');
const editedSaveContainer = document.getElementById('editedSaveContainer');
const editedSaveOutput = document.getElementById('editedSaveOutput');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const output = document.getElementById('output');
const errorEl = document.getElementById('error');
const metaEl = document.getElementById('meta');

let lastGameState = null;
let sessionHasEdits = false;
let editCommitCounter = 0;

const THEME_STORAGE_KEY = 'cosmicForge.saveInspector.theme';
const fallbackThemes = ['terminal', 'dark', 'supernova', 'galaxy', 'space', 'light', 'frosty', 'summer'];

const PREFERRED_THEME_ORDER = ['terminal', 'dark', 'supernova', 'galaxy', 'space', 'light', 'frosty', 'summer'];

const preferredTopLevelOrder = [
  'resourceData',
  'starSystems',
  'galacticMarket',
  'ascendencyBuffs',
  'achievementsData',
];

function clearError() {
  errorEl.textContent = '';
}

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

function applyTheme(theme) {
  if (!theme) return;
  document.body.setAttribute('data-theme', theme);
}

function titleCase(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

async function detectThemesFromCss() {
  try {
    const res = await fetch('/styles.css', { cache: 'no-store' });
    if (!res.ok) return [...fallbackThemes];
    const css = await res.text();

    const themes = new Set();
    const re = /\[data-theme\s*=\s*"([^"]+)"\s*\]/g;
    let match;
    while ((match = re.exec(css)) !== null) {
      themes.add(match[1]);
    }

    const list = [...themes];
    if (!list.length) return [...fallbackThemes];

    // Prefer terminal first if present.
    list.sort((a, b) => {
      const ai = PREFERRED_THEME_ORDER.indexOf(a);
      const bi = PREFERRED_THEME_ORDER.indexOf(b);
      if (ai !== -1 || bi !== -1) {
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      }
      return a.localeCompare(b);
    });
    return list;
  } catch {
    return [...fallbackThemes];
  }
}

async function initThemeSelector() {
  if (!themeSelect) return;

  const themes = await detectThemesFromCss();
  themeSelect.innerHTML = '';

  for (const theme of themes) {
    const opt = document.createElement('option');
    opt.value = theme;
    opt.textContent = titleCase(theme);
    themeSelect.appendChild(opt);
  }

  const initial = themes.includes('terminal') ? 'terminal' : themes[0];
  themeSelect.value = initial;
  applyTheme(initial);

  themeSelect.addEventListener('change', () => {
    const selected = themeSelect.value;
    applyTheme(selected);
    storeTheme(selected);
  });
}

function setError(err) {
  errorEl.textContent = typeof err === 'string' ? err : (err?.stack || err?.message || String(err));
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && (value.constructor === Object || Object.getPrototypeOf(value) === null);
}

function typeSummary(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `array(${value.length})`;
  if (isPlainObject(value)) return `object(${Object.keys(value).length})`;
  return typeof value;
}

function safeStringify(value, maxLen = 6000) {
  let s;
  try {
    s = JSON.stringify(value, null, 2);
  } catch {
    s = String(value);
  }
  if (s.length > maxLen) return s.slice(0, maxLen) + `\n... (truncated, ${s.length} chars total)`;
  return s;
}

function normalizeQuery(q) {
  return (q || '').trim().toLowerCase();
}

function valueMatchesQuery(value, query) {
  if (!query) return true;
  if (value === null || value === undefined) return String(value).toLowerCase().includes(query);

  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean' || t === 'bigint') {
    return String(value).toLowerCase().includes(query);
  }

  if (Array.isArray(value)) {
    return (`array(${value.length})`).includes(query);
  }

  if (isPlainObject(value)) {
    return (`object(${Object.keys(value).length})`).includes(query);
  }

  return t.toLowerCase().includes(query);
}

function pathMatchesQuery(path, query) {
  if (!query) return true;
  return path.toLowerCase().includes(query);
}

function buildKeyValueRow(displayKey, value, fullPath) {
  const row = document.createElement('div');
  row.className = 'kv';

  const k = document.createElement('div');
  k.className = 'k mono';
  k.textContent = displayKey;

  const v = document.createElement('div');
  v.className = 'v';

  const pre = document.createElement('pre');
  pre.className = 'mono';
  pre.textContent = safeStringify(value);
  pre.dataset.path = fullPath;
  attachInlineEditHandlers(pre);
  v.appendChild(pre);

  row.appendChild(k);
  row.appendChild(v);

  return row;
}

function getPathParts(path) {
  const parts = [];
  const re = /\.([^.[\]]+)|\[([0-9]+)\]|^([^.[\]]+)/g;
  let match;
  while ((match = re.exec(path)) !== null) {
    const [, dotKey, indexKey, firstKey] = match;
    if (firstKey) parts.push(firstKey);
    else if (dotKey) parts.push(dotKey);
    else if (indexKey) parts.push(Number(indexKey));
  }
  return parts;
}

function getValueAtPath(root, path) {
  const parts = getPathParts(path);
  let cur = root;
  for (const p of parts) {
    if (cur === null || cur === undefined) return undefined;
    cur = cur[p];
  }
  return cur;
}

function setValueAtPath(root, path, value) {
  const parts = getPathParts(path);
  if (!parts.length) return;
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] === undefined || cur[p] === null) {
      cur[p] = typeof parts[i + 1] === 'number' ? [] : {};
    }
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function showEditedSaveOutput() {
  if (!editedSaveContainer || !editedSaveOutput) return;
  editedSaveContainer.classList.remove('d-none');
}

function validateEditedSaveString(compressed, expectedPath, expectedValue) {
  if (!compressed) return;
  if (!expectedPath) return;

  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    if (decompressed === null) {
      throw new Error('Failed to decompress generated string');
    }
    const parsed = JSON.parse(decompressed);
    const actual = getValueAtPath(parsed, expectedPath);

    if (actual !== expectedValue) {
      throw new Error(`Validation failed at ${expectedPath}. Expected ${String(expectedValue)} but got ${String(actual)}`);
    }
  } catch (e) {
    setError(e);
  }
}

function updateEditedSaveString(expectedPath, expectedValue) {
  if (!lastGameState) return;
  if (!editedSaveOutput) return;
  const serialized = JSON.stringify(lastGameState);
  const compressed = LZString.compressToEncodedURIComponent(serialized);
  editedSaveOutput.value = compressed;
  editCommitCounter += 1;
  editedSaveOutput.dataset.commit = String(editCommitCounter);
  validateEditedSaveString(compressed, expectedPath, expectedValue);
}

function parseEditedValue(raw, previousValue) {
  const prevType = previousValue === null ? 'null' : typeof previousValue;
  const trimmed = raw.trim();

  if (prevType === 'number') {
    const n = Number(trimmed);
    if (Number.isNaN(n)) throw new Error('Invalid number');
    return n;
  }

  if (prevType === 'boolean') {
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    throw new Error('Invalid boolean (use true/false)');
  }

  if (prevType === 'null') {
    if (trimmed.toLowerCase() === 'null') return null;
    return trimmed;
  }

  return raw;
}

function startInlineEdit(preEl) {
  if (!lastGameState) return;
  const path = preEl.dataset.path;
  if (!path) return;

  const previousValue = getValueAtPath(lastGameState, path);
  const t = previousValue === null ? 'null' : typeof previousValue;
  if (t === 'object' || t === 'undefined' || t === 'function' || t === 'bigint' || t === 'symbol') return;

  const input = document.createElement('input');
  input.className = 'form-control form-control-sm mono';
  input.value = previousValue === null ? 'null' : String(previousValue);

  const parent = preEl.parentElement;
  parent.replaceChild(input, preEl);
  input.focus();
  input.select();

  let finished = false;

  const finish = (commit) => {
    if (finished) return;
    finished = true;
    const newPre = document.createElement('pre');
    newPre.className = 'mono';
    newPre.dataset.path = path;

    if (commit) {
      try {
        const parsed = parseEditedValue(input.value, previousValue);
        setValueAtPath(lastGameState, path, parsed);
        newPre.textContent = safeStringify(parsed);
        sessionHasEdits = true;
        showEditedSaveOutput();
        updateEditedSaveString(path, parsed);
      } catch (e) {
        setError(`Edit failed at ${path}: ${e?.message || e}`);
        newPre.textContent = safeStringify(previousValue);
      }
    } else {
      newPre.textContent = safeStringify(previousValue);
    }

    attachInlineEditHandlers(newPre);
    parent.replaceChild(newPre, input);
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearError();
      finish(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      finish(false);
    }
  });

  input.addEventListener('blur', () => {
    if (finished) return;
    finish(false);
  }, { once: true });
}

function attachInlineEditHandlers(preEl) {
  let lastTapAt = 0;
  preEl.addEventListener('dblclick', () => startInlineEdit(preEl));
  preEl.addEventListener('touchend', () => {
    const now = Date.now();
    if (now - lastTapAt < 300) {
      startInlineEdit(preEl);
      lastTapAt = 0;
      return;
    }
    lastTapAt = now;
  });
}

function createLazyDetails({ title, value, path, query }) {
  const details = document.createElement('details');
  details.dataset.rendered = 'false';
  details.dataset.path = path;

  const summary = document.createElement('summary');
  summary.className = 'mono';

  const titleSpan = document.createElement('span');
  titleSpan.textContent = title;

  const typeSpan = document.createElement('span');
  typeSpan.className = 'section-summary muted section-summary';
  typeSpan.textContent = typeSummary(value);

  summary.appendChild(titleSpan);
  summary.appendChild(typeSpan);
  details.appendChild(summary);

  const shouldShow = pathMatchesQuery(path, query) || valueMatchesQuery(value, query);
  if (!shouldShow) {
    details.style.display = 'none';
  }

  details.addEventListener('toggle', () => {
    if (!details.open) return;
    if (details.dataset.rendered === 'true') return;
    details.dataset.rendered = 'true';

    const body = document.createElement('div');
    body.style.paddingLeft = '16px';
    body.style.marginTop = '8px';

    body.appendChild(renderValue(value, path, query));
    details.appendChild(body);
  });

  return details;
}

function renderValue(value, path, query) {
  if (value === null || value === undefined) {
    return buildKeyValueRow(path, value, path);
  }

  if (Array.isArray(value)) {
    const container = document.createElement('div');

    for (let i = 0; i < value.length; i++) {
      const childPath = `${path}[${i}]`;
      const child = value[i];
      if (!pathMatchesQuery(childPath, query) && !valueMatchesQuery(child, query)) continue;

      if (isPlainObject(child) || Array.isArray(child)) {
        container.appendChild(createLazyDetails({
          title: `[${i}]`,
          value: child,
          path: childPath,
          query,
        }));
      } else {
        container.appendChild(buildKeyValueRow(`[${i}]`, child, childPath));
      }
    }

    if (!container.childNodes.length) {
      const empty = document.createElement('div');
      empty.className = 'muted';
      empty.textContent = query ? 'No matches.' : 'Empty array.';
      container.appendChild(empty);
    }

    return container;
  }

  if (isPlainObject(value)) {
    const container = document.createElement('div');
    const keys = Object.keys(value);

    for (const k of keys) {
      const childPath = path ? `${path}.${k}` : k;
      const child = value[k];

      if (!pathMatchesQuery(childPath, query) && !valueMatchesQuery(child, query)) {
        continue;
      }

      if (isPlainObject(child) || Array.isArray(child)) {
        container.appendChild(createLazyDetails({
          title: k,
          value: child,
          path: childPath,
          query,
        }));
      } else {
        container.appendChild(buildKeyValueRow(k, child, childPath));
      }
    }

    if (!container.childNodes.length) {
      const empty = document.createElement('div');
      empty.className = 'muted';
      empty.textContent = query ? 'No matches.' : 'Empty object.';
      container.appendChild(empty);
    }

    return container;
  }

  const leaf = document.createElement('pre');
  leaf.className = 'mono';
  leaf.textContent = safeStringify(value);
  return leaf;
}

function orderedTopLevelKeys(gameState) {
  const keys = Object.keys(gameState || {});
  const preferred = preferredTopLevelOrder.filter(k => keys.includes(k));
  const rest = keys.filter(k => !preferred.includes(k)).sort((a, b) => a.localeCompare(b));
  return [...preferred, ...rest];
}

function renderGameState(gameState) {
  const query = normalizeQuery(searchInput.value);

  output.innerHTML = '';

  const keys = orderedTopLevelKeys(gameState);

  const header = document.createElement('div');
  header.className = 'mb-3';

  const stamp = gameState?.timeStamp ? String(gameState.timeStamp) : 'N/A';
  header.innerHTML = `<div class="mono"><span class="muted">timeStamp:</span> ${stamp}</div>`;
  output.appendChild(header);

  for (const key of keys) {
    const value = gameState[key];
    const path = key;

    const details = createLazyDetails({
      title: key,
      value,
      path,
      query,
    });

    details.open = false;
    output.appendChild(details);
  }
}

function decodeSaveString(s) {
  if (!s || !s.trim()) {
    throw new Error('Paste a save string first.');
  }

  if (typeof LZString === 'undefined') {
    throw new Error('LZString is not available.');
  }

  const decompressed = LZString.decompressFromEncodedURIComponent(s.trim());
  if (decompressed === null) {
    throw new Error('Failed to decompress. The string is not a valid Cosmic Forge save export.');
  }

  const gameState = JSON.parse(decompressed);
  if (!gameState || typeof gameState !== 'object') {
    throw new Error('Decoded save is not an object.');
  }

  return { gameState, decompressedLength: decompressed.length };
}

function updateMeta({ decompressedLength, rawLength }) {
  metaEl.textContent = `raw: ${rawLength} chars | json: ${decompressedLength} chars`;
}

function onDecode() {
  clearError();
  try {
    const raw = saveInput.value;
    const { gameState, decompressedLength } = decodeSaveString(raw);
    lastGameState = gameState;
    sessionHasEdits = false;
    if (editedSaveContainer) editedSaveContainer.classList.add('d-none');
    if (editedSaveOutput) editedSaveOutput.value = '';
    if (exportJsonBtn) exportJsonBtn.disabled = false;
    updateMeta({ decompressedLength, rawLength: raw.trim().length });
    renderGameState(gameState);
  } catch (e) {
    lastGameState = null;
    output.innerHTML = '';
    metaEl.textContent = '';
    sessionHasEdits = false;
    if (editedSaveContainer) editedSaveContainer.classList.add('d-none');
    if (editedSaveOutput) editedSaveOutput.value = '';
    if (exportJsonBtn) exportJsonBtn.disabled = true;
    setError(e);
  }
}

function onClear() {
  saveInput.value = '';
  searchInput.value = '';
  metaEl.textContent = '';
  clearError();
  output.innerHTML = '';
  lastGameState = null;
  sessionHasEdits = false;
  if (editedSaveContainer) editedSaveContainer.classList.add('d-none');
  if (editedSaveOutput) editedSaveOutput.value = '';
  if (exportJsonBtn) exportJsonBtn.disabled = true;
}

function buildJsonFilename() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `cosmic_forge_save_${stamp}.json`;
}

function downloadTextFile(filename, text, mime = 'application/json') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function onExportJson() {
  clearError();
  if (!lastGameState) {
    setError('Decode a save first.');
    return;
  }

  try {
    const json = JSON.stringify(lastGameState, null, 2);
    downloadTextFile(buildJsonFilename(), json);
  } catch (e) {
    setError(e);
  }
}

function expandTopLevel() {
  for (const el of output.querySelectorAll(':scope > details')) {
    el.open = true;
  }
}

function collapseAll() {
  for (const el of output.querySelectorAll('details')) {
    el.open = false;
  }
}

decodeBtn.addEventListener('click', onDecode);
clearBtn.addEventListener('click', onClear);
if (exportJsonBtn) exportJsonBtn.addEventListener('click', onExportJson);
expandAllBtn.addEventListener('click', expandTopLevel);
collapseAllBtn.addEventListener('click', collapseAll);

searchInput.addEventListener('input', () => {
  if (!lastGameState) return;
  renderGameState(lastGameState);
});

saveInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    onDecode();
  }
});

initThemeSelector();
