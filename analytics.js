import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const DEFAULT_SUPABASE_URL = 'https://riogcxvtomyjlzkcnujf.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpb2djeHZ0b215amx6a2NudWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMjY1NDgsImV4cCI6MjA1OTYwMjU0OH0.HH7KXPrcORvl6Wiefupl422gRYxAa_kFCRM2-puUcsQ';

const DEFAULT_TABLE_NAME = 'CosmicForge_analytics_events';
const DEFAULT_BATCH_SIZE = 25;
const DEFAULT_FLUSH_INTERVAL_MS = 15000;
const MAX_QUEUE_LENGTH = 2000;

const STORAGE_KEYS = {
    enabled: 'cf_analytics_enabled',
    clientId: 'cf_analytics_client_id',
    sessionId: 'cf_analytics_session_id',
    queue: 'cf_analytics_queue_v1'
};

let supabaseClient = null;

let tableName = DEFAULT_TABLE_NAME;
let batchSize = DEFAULT_BATCH_SIZE;
let flushIntervalMs = DEFAULT_FLUSH_INTERVAL_MS;
let flushTimer = null;

let enabled = false;
let initialised = false;

let clientId = null;
let sessionId = null;

let getContext = null;
let inMemoryQueue = [];
let flushInFlight = false;

function safeJsonParse(value, fallback) {
    try {
        if (typeof value !== 'string' || !value.length) return fallback;
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function safeJsonStringify(value, fallback) {
    try {
        return JSON.stringify(value);
    } catch {
        return fallback;
    }
}

function nowIso() {
    return new Date().toISOString();
}

function createId() {
    return (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getOrCreateId(storageKey) {
    const existing = localStorage.getItem(storageKey);
    if (existing) return existing;

    const id = createId();

    localStorage.setItem(storageKey, id);
    return id;
}

function loadEnabledFromStorage(defaultEnabled) {
    const raw = localStorage.getItem(STORAGE_KEYS.enabled);
    if (raw === null || raw === undefined) {
        localStorage.setItem(STORAGE_KEYS.enabled, defaultEnabled ? '1' : '0');
        return !!defaultEnabled;
    }
    return raw === '1';
}

function persistEnabledToStorage(value) {
    localStorage.setItem(STORAGE_KEYS.enabled, value ? '1' : '0');
}

function loadQueueFromStorage() {
    const parsed = safeJsonParse(localStorage.getItem(STORAGE_KEYS.queue), []);
    if (!Array.isArray(parsed)) return [];
    return parsed;
}

function persistQueueToStorage(queue) {
    localStorage.setItem(STORAGE_KEYS.queue, safeJsonStringify(queue, '[]'));
}

function hydrateQueue() {
    const storedQueue = loadQueueFromStorage();
    inMemoryQueue = storedQueue.concat(inMemoryQueue);
    if (inMemoryQueue.length > MAX_QUEUE_LENGTH) {
        inMemoryQueue = inMemoryQueue.slice(inMemoryQueue.length - MAX_QUEUE_LENGTH);
    }
    persistQueueToStorage(inMemoryQueue);
}

function setSessionId(newSessionId) {
    sessionId = newSessionId;
    localStorage.setItem(STORAGE_KEYS.sessionId, newSessionId);
}

function buildEventRow(eventName, payload, options) {
    const context = typeof getContext === 'function' ? getContext() : {};

    const eventTime = options?.eventTime ?? nowIso();

    const row = {
        event_name: String(eventName),
        event_time: eventTime,
        client_id: clientId,
        session_id: sessionId,
        payload: payload ?? {},
    };

    if (context && typeof context === 'object') {
        if (context.pioneer_name !== undefined) row.pioneer_name = context.pioneer_name;
        if (context.game_version !== undefined) row.game_version = context.game_version;
        if (context.host_source !== undefined) row.host_source = context.host_source;
        if (context.platform !== undefined) row.platform = context.platform;
        if (context.language !== undefined) row.language = context.language;
        if (context.run_number !== undefined) row.run_number = context.run_number;
        if (context.onboarding !== undefined) row.onboarding = context.onboarding;
        if (context.debug !== undefined) row.debug = context.debug;
    }

    return row;
}

function enqueueRow(row) {
    inMemoryQueue.push(row);
    if (inMemoryQueue.length > MAX_QUEUE_LENGTH) {
        inMemoryQueue = inMemoryQueue.slice(inMemoryQueue.length - MAX_QUEUE_LENGTH);
    }
    persistQueueToStorage(inMemoryQueue);
}

async function flushInternal(reason) {
    if (!enabled) return;
    if (!supabaseClient) return;
    if (flushInFlight) return;
    if (!inMemoryQueue.length) return;

    flushInFlight = true;

    const batch = inMemoryQueue.slice(0, batchSize);

    try {
        const { error } = await supabaseClient
            .from(tableName)
            .insert(batch.map((row) => ({
                ...row,
                flush_reason: reason ?? null,
                received_at: nowIso()
            })));

        if (!error) {
            inMemoryQueue = inMemoryQueue.slice(batch.length);
            persistQueueToStorage(inMemoryQueue);
        }
    } finally {
        flushInFlight = false;
    }
}

function schedulePeriodicFlush() {
    if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
    }

    if (!enabled) return;

    flushTimer = setInterval(() => {
        flushInternal('interval');
    }, flushIntervalMs);
}

function attachLifecycleHooks() {
    window.addEventListener('beforeunload', () => {
        flushInternal('beforeunload');
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            flushInternal('visibilitychange_hidden');
        }
    });

    window.addEventListener('online', () => {
        flushInternal('online');
    });
}

export function initAnalytics(options = {}) {
    if (initialised) return;
    initialised = true;

    const supabaseUrl = options.supabaseUrl ?? DEFAULT_SUPABASE_URL;
    const supabaseKey = options.supabaseKey ?? DEFAULT_SUPABASE_KEY;
    const authStorageKey = options.authStorageKey ?? 'cf_analytics_auth_token';

    tableName = options.tableName ?? DEFAULT_TABLE_NAME;
    batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
    flushIntervalMs = options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS;

    getContext = options.getContext ?? null;

    enabled = loadEnabledFromStorage(options.defaultEnabled ?? false);

    clientId = getOrCreateId(STORAGE_KEYS.clientId);

    setSessionId(createId());

    supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
            storageKey: authStorageKey,
            detectSessionInUrl: false
        }
    });

    hydrateQueue();

    attachLifecycleHooks();
    schedulePeriodicFlush();

    trackAnalyticsEvent('session_start', {
        ts: nowIso()
    });
}

export function setAnalyticsEnabled(value) {
    enabled = !!value;
    persistEnabledToStorage(enabled);
    schedulePeriodicFlush();

    if (enabled) {
        flushInternal('enabled');
    }
}

export function getAnalyticsEnabled() {
    return enabled;
}

export function startNewAnalyticsSession() {
    setSessionId(createId());
    trackAnalyticsEvent('session_start', {
        ts: nowIso(),
        reason: 'manual_new_session'
    });
}

export function trackAnalyticsEvent(eventName, payload = {}, options = {}) {
    if (!enabled) return;

    const sampleRate = options.sampleRate;
    if (typeof sampleRate === 'number' && sampleRate >= 0 && sampleRate < 1) {
        if (Math.random() > sampleRate) return;
    }

    const row = buildEventRow(eventName, payload, options);
    enqueueRow(row);

    if (options.immediate || inMemoryQueue.length >= batchSize) {
        flushInternal(options.flushReason ?? 'immediate');
    }
}

export function flushAnalyticsEvents(reason) {
    return flushInternal(reason ?? 'manual');
}

export function trackButtonPress(buttonId, payload = {}, options = {}) {
    trackAnalyticsEvent('button_press', {
        button_id: buttonId,
        ...payload
    }, options);
}

export function enableGlobalClickTracking(options = {}) {
    const ignoreIds = Array.isArray(options.ignoreIds) ? new Set(options.ignoreIds) : new Set();
    const allowTags = Array.isArray(options.allowTags) ? new Set(options.allowTags.map((t) => String(t).toUpperCase())) : null;

    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const id = target.id || null;
        if (id && ignoreIds.has(id)) return;

        const tag = target.tagName;
        if (allowTags && !allowTags.has(tag)) return;

        const classes = Array.from(target.classList || []).slice(0, 12);

        trackAnalyticsEvent('dom_click', {
            id,
            tag,
            classes
        }, {
            sampleRate: options.sampleRate ?? 0.15
        });
    }, { capture: true });
}
