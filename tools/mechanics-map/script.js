const $ = (id) => document.getElementById(id);

const STORAGE_KEYS = {
  theme: 'mechanics_map_theme',
};

const SPECIAL_EXPLANATIONS = {
  ascendencyBuff: {
    compoundAutomation: 'Unlock: enables compound auto-create option (automation) in Compounds UI.',
    roboticResearchAutomation: 'Unlock: enables Research autobuyer toggle/automation for generating research each run.',
    smartAutoBuyers: 'Effect: multiplies autobuyer generation rates (resource + compound tiers).',
    optimizedPowerGrids: 'Effect: multiplies energy building generation rates.',
    jumpstartResearch: 'Effect: starts runs with a large research boost (or grants a big research gain early).',
    efficientStorage: 'Effect: increases storage efficiency/capacity upgrade effectiveness.',
    fasterAsteroidScan: 'Effect: reduces asteroid scan/search time (space telescope).',
    deeperStarStudy: 'Effect: improves star study depth/efficiency (better/faster star study).',
    asteroidScannerBoost: 'Effect: improves asteroid scanning yield/efficiency.',
    rocketFuelOptimization: 'Effect: reduces rocket fuel consumption / improves fuel efficiency.',
    enhancedMining: 'Effect: improves antimatter mining rate/efficiency.',
    quantumEngines: 'Effect: improves travel speed (rockets/starship) / propulsion efficiency.',
    autoSpaceTelescope: 'Unlock: enables automation for space telescope actions (auto scan/study where supported).',
  },
  achievement: {
    discoverBlackHole: 'Unlock: reveals Black Hole UI after discovery (then requires Black Hole research purchase to use).',
    activateBlackHoleOver10x: 'Milestone: confirms Black Hole can reach high time-warp multipliers (>10x).',
    rebirth: 'Unlock/Meta: grants permanent resource autobuyer multiplier (applied to all resources).',
    adoptPhilosophy: 'Unlock: enables Philosophy system + repeatable philosophy techs.',
  },
  timedEffect: {
    supplyChainDisruption: 'Effect: temporarily reduces production for a single resource/compound.',
    minerBrokeDown: 'Effect: temporarily sets a mining rocket to 0 antimatter production.',
    blackHoleInstability: 'Effect: temporarily fluctuates Black Hole power + duration each minute (then restores).',
    galacticMarketLockdown: 'Effect: temporarily disables Galactic Market access.',
    endlessSummer: 'Effect: locks weather to Sunny for a period (affects weather-dependent bonuses).',
  },
};

const diagrams = {
  core: `flowchart TD
    tick[TICK] --> timers[Timer ratio / speed]

    timers --> resources[Resources]
    timers --> compounds[Compounds]
    timers --> energy[Energy]
    timers --> research[Research]

    resources --> sell[Sell for cash]
    sell --> cash[Cash]

    cash --> buyAB[Buy Autobuyers]
    buyAB --> resources

    energy --> power[Power On/Off]
    power --> resources
    power --> research

    research --> tech[Technologies]
    tech --> unlock[Unlock systems]

    resources --> fusion[Fusion]
    fusion --> compounds

    note1[[Multipliers feed into rates, prices, caps and timers]]
    note1 --> resources
    note1 --> compounds
    note1 --> energy
    note1 --> research
`,

  automation: `flowchart TD
    cash[Cash] --> buyAB[Autobuyers]
    buyAB --> genRes[Generate resources]

    genRes --> divert[Auto-create compounds]
    divert --> comp[Compounds]

    research[Research] --> unlockAuto[Automation unlocks]
    unlockAuto --> buyAB

    asc[Ascendency Buffs] --> smartAB[Smart Auto Buyers]
    smartAB --> buyAB

    events[Timed Effects] --> scd[Supply Chain Disruption]
    scd --> genRes
    scd --> divert
`,

  meta: `flowchart TD
    run[Run] --> milestones[Milestones/Achievements]
    milestones --> ach[Achievements]
    ach --> rewards[Rewards / Multipliers]

    run --> ascPts[Ascendency Points]
    ascPts --> perks[Ascendency Perks]
    perks --> buffs[Ascendency Buff Effects]

    run --> rebirth[Rebirth]
    rebirth --> persist[Permanent modifiers]
    persist --> nextRun[Next run starts stronger]
`,

  space: `flowchart TD
    cash[Cash] --> buyRocketParts[Rocket Parts]
    buyRocketParts --> buildRockets[Build Rockets]
    buildRockets --> mining[Assign Rockets to Antimatter Asteroids]
    mining --> antimatter[Antimatter income]

    research[Research/Tech] --> travelTech[Travel + Propulsion Tech]
    travelTech --> rocketTravel[Rocket travel time]
    travelTech --> starshipTravel[Starship travel time]

    space[Space Layer] --> explore[Explore / Scan / Discover]
    explore --> asteroids[Asteroids]
    asteroids --> mining
    explore --> blackhole[Black Hole]
    explore --> diplomacy[Diplomacy]
    explore --> megastructures[Megastructures]
  `,

  fleet: `flowchart TD
    cash[Cash] --> fleets[Build Fleets]
    fleets --> power[Fleet Attack/Health/Armor]
    research[Research/Tech] --> fleetTech[Fleet Tech]
    fleetTech --> power

    perks[Philosophy Repeatables / Ascendency] --> buffs[Buffs]
    buffs --> power

    power --> combat[Combat]
    combat --> conquest[Conquer / Vassalize]
    conquest --> rewards[Rewards / Unlocks]
    rewards --> progress[Progression]
  `,

  mega: `flowchart TD
    space[Space Layer] --> mega[Megastructures]
    mega --> tech[Megastructure Tech Tree]
    tech --> bonuses[Bonuses]
    bonuses --> rates[Resource/Antimatter rates]

    blackhole[Black Hole] --> warp[Time Warp]
    warp --> rates
    warp --> timers[Timer ratio / speed]

    asc[Ascendency Buffs] --> smartAB[Smart Auto Buyers]
    smartAB --> rates
  `,

  unlocks: `flowchart LR
    %% NOTE: Curated map of unlock gates. IDs are real where possible.

    subgraph Runs[Run stages]
      r1[Run 1] --> r1p[Philosophy selection]
      r2[Run 2 plus] --> r2bh[Black Hole discover and research]
    end

    subgraph Tech[Technology resourceData.techs]
      tKS[knowledgeSharing] --> featTech[Tech tree UI and tech unlocks]

      tComp[compounds] --> featCompTab[Compounds tab]
      tBPG[basicPowerGeneration] --> featEnergyTab[Energy tab]

      tSC[stellarCartography] --> featStarMap[Star map and star data]
      tAT[atmosphericTelescopes] --> featTelescope[Space telescope]

      tOC[orbitalConstruction] --> featStarshipParts[Starship parts and space construction]
      tFTL[FTLTravelTheory] --> featInterstellar[Interstellar travel]
      tAE[antimatterEngines] --> featStarshipFuel[Starship fuel progression]
      tSF[starshipFleets] --> featFleetHangar[Fleet hangar]

      tMS[dysonSphereUnderstanding etc] --> featMega[Megastructure investigation chain]
    end

    subgraph AP[Ascendency buffs ascendencyBuffs]
      apCAA[compoundAutomation] --> featAutoCreate[Auto create compounds option]
      apSAB[smartAutoBuyers] --> featABRate[Higher autobuyer rates]
      apOPG[optimizedPowerGrids] --> featEnergyRate[Higher energy building output]
      apRRA[roboticResearchAutomation] --> featResAuto[Research automation toggle]
      apAST[autoSpaceTelescope] --> featTelescopeAuto[Auto space telescope actions]
    end

    featCompTab --> loopComp[Compound crafting and auto create]
    featEnergyTab --> loopEnergy[Energy generation and consumption]
    featStarMap --> loopSpace[Exploration and scanning]
    featFleetHangar --> loopFleet[Combat and conquest]
    r2bh --> loopBH[Time warp multiplier affects timers]
  `,
};

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }

}

function formatTitleFromId(id) {
  const s = String(id || '').replace(/([a-z])([A-Z])/g, '$1 $2');
  return s
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function parseRandomEventDescriptionsFromSource(descriptionsSource) {
  const objText = extractAssignedObject(descriptionsSource, 'randomEventTriggerDescriptions');
  if (!objText) return {};
  try {
    // Safe to eval: pure key->string map.
    const parsed = evalObjectLiteral(objText);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function normaliseDescriptionText(s) {
  if (!s) return '';
  return String(s)
    .replace(/\r?\n/g, ' ')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readStringLiteralAfterIndex(src, startIndex) {
  let i = startIndex;
  while (i < src.length && /\s/.test(src[i])) i += 1;
  const q = src[i];
  if (q !== '"' && q !== "'" && q !== '`') return null;
  i += 1;
  let out = '';
  if (q === '`') {
    let exprDepth = 0;
    for (; i < src.length; i += 1) {
      const ch = src[i];
      if (exprDepth === 0 && ch === '`') return out;
      if (ch === '\\') {
        if (i + 1 < src.length) {
          out += src[i + 1];
          i += 1;
          continue;
        }
      }
      if (exprDepth === 0 && ch === '$' && src[i + 1] === '{') {
        exprDepth = 1;
        out += '{...}';
        i += 1;
        continue;
      }
      if (exprDepth > 0) {
        if (ch === '{') exprDepth += 1;
        else if (ch === '}') exprDepth -= 1;
        continue;
      }
      out += ch;
    }
    return null;
  }

  for (; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === q) return out;
    if (ch === '\\') {
      if (i + 1 < src.length) {
        out += src[i + 1];
        i += 1;
        continue;
      }
    }
    out += ch;
  }
  return null;
}

function readStringFieldLoose(objText, fieldName) {
  if (!objText) return null;
  const re = new RegExp(`\\b${fieldName}\\s*:`);
  const m = re.exec(objText);
  if (!m) return null;
  const afterColon = objText.indexOf(':', m.index);
  if (afterColon < 0) return null;
  return readStringLiteralAfterIndex(objText, afterColon + 1);
}

function parseDescriptionRowsFromSource(descriptionsSource) {
  const out = {};
  if (!descriptionsSource) return out;

  const re = /\n\s*([a-zA-Z0-9_]+Row)\s*:\s*\{/g;
  let m;
  while ((m = re.exec(descriptionsSource)) !== null) {
    const key = m[1];
    const objText = findBalancedObjectLiteral(descriptionsSource, m.index);
    if (!objText) continue;
    const content1 = readStringFieldLoose(objText, 'content1') || '';
    const content2 = readStringFieldLoose(objText, 'content2') || '';
    out[key] = {
      content1: normaliseDescriptionText(content1),
      content2: normaliseDescriptionText(content2),
    };
  }

  return out;
}

function parseAchievementNotificationsFromSource(descriptionsSource) {
  const objText = extractAssignedObject(descriptionsSource, 'achievementNotifications');
  if (!objText) return {};
  try {
    const parsed = evalObjectLiteral(objText);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function buildSummaryFromDescriptionParts(content1, content2) {
  const a = normaliseDescriptionText(content1);
  const b = normaliseDescriptionText(content2);
  if (a && b && a !== b) return `${a} ${b}`.trim();
  return (a || b || '').trim();
}

function techIdToDescriptionRowKey(techId) {
  if (!techId) return null;
  const id = String(techId);
  return `tech${id[0].toUpperCase()}${id.slice(1)}Row`;
}

function extractEventIdsFromDefinitionsObject(defObjText) {
  const out = [];
  const entries = splitTopLevelObjectEntries(defObjText);
  for (const { key, objText } of entries) {
    const id = readSimpleStringField(objText, 'id') || key;
    const initialProbability = readSimpleNumberField(objText, 'initialProbability');
    out.push({ id, key, initialProbability });
  }
  return out;
}

function classifyEventAffects(eventId) {
  switch (eventId) {
    case 'scienceTheft':
    case 'researchBreakthrough':
      return 'research quantity';
    case 'powerPlantExplosion':
    case 'batteryExplosion':
      return 'energy buildings / storage';
    case 'rocketInstantArrival':
      return 'rocket travel timers';
    case 'starshipLostInSpace':
      return 'starship + fleets (reset)';
    case 'galacticMarketLockdown':
      return 'galactic market access';
    case 'endlessSummer':
      return 'weather (affects energy + other weather-dependent systems)';
    case 'minerBrokeDown':
      return 'antimatter mining rate (one rocket)';
    case 'supplyChainDisruption':
      return 'resource/compound production rate (one item)';
    case 'blackHoleInstability':
      return 'black hole power + duration (temporarily fluctuates)';
    default:
      return '(varies)';
  }
}

function buildEventRows({ randomEvents, timedEffects, descriptionsMap }) {
  const rows = [];

  for (const e of randomEvents) {
    const desc = descriptionsMap[e.id] || '';
    const expl = SPECIAL_EXPLANATIONS?.timedEffect?.[e.id] || ''; // some are effectively timed even if implemented as random events
    rows.push({
      source: 'Random Event',
      id: e.id,
      name: formatTitleFromId(e.id),
      affects: classifyEventAffects(e.id),
      magnitude: '',
      notes: [
        desc ? `effect=${desc}` : null,
        expl ? `unlock=${expl}` : null,
        Number.isFinite(e.initialProbability) ? `initialProbability=${e.initialProbability}` : null,
      ].filter(Boolean).join(' '),
      code: `events.js → randomEventDefinitions.${e.key}`,
    });
  }

  for (const e of timedEffects) {
    const desc = descriptionsMap[e.id] || '';
    const expl = SPECIAL_EXPLANATIONS?.timedEffect?.[e.id] || '';
    rows.push({
      source: 'Timed Effect',
      id: e.id,
      name: formatTitleFromId(e.id),
      affects: classifyEventAffects(e.id),
      magnitude: '',
      notes: [
        desc ? `effect=${desc}` : null,
        expl ? `unlock=${expl}` : null,
      ].filter(Boolean).join(' '),
      code: `events.js → timedEffectDefinitions.${e.key}`,
    });
  }

  return rows;
}

function parseAscendencyBuffApplications(gameSource) {
  const apps = {};
  if (!gameSource) return apps;

  const lines = gameSource.split(/\r?\n/);
  const re = /getAscendencyBuffDataObject\(\)\s*\[\s*['"]([^'"]+)['"]\s*\]/;

  function findEnclosingFunctionName(lineIndex) {
    for (let i = lineIndex; i >= 0 && i >= lineIndex - 80; i -= 1) {
      const line = lines[i];
      let m = line.match(/export\s+function\s+([a-zA-Z0-9_]+)/);
      if (m) return m[1];
      m = line.match(/function\s+([a-zA-Z0-9_]+)/);
      if (m) return m[1];
    }
    return null;
  }

  function guessAffectsFromNearbyText(windowText, fnName) {
    const t = windowText.toLowerCase();
    if (t.includes('autobuyer') || t.includes("['autobuyer'") || t.includes('tier')) return 'resource/compound autobuyer rates';
    if (t.includes("['energy'") || t.includes('power') || t.includes('battery')) return 'energy generation/storage';
    if (t.includes("['research'") || t.includes('science')) return 'research generation/bonuses';
    if (t.includes('fleet')) return 'fleet stats/costs';
    if (t.includes('rocket') || t.includes('starship')) return 'space travel/mining';
    if (fnName && fnName.toLowerCase().includes('autobuyer')) return 'resource/compound autobuyer rates';
    if (fnName && fnName.toLowerCase().includes('power')) return 'energy generation/storage';
    return '(varies)';
  }

  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(re);
    if (!m) continue;
    const buffId = m[1];
    const fnName = findEnclosingFunctionName(i);
    const windowText = lines.slice(Math.max(0, i - 12), Math.min(lines.length, i + 12)).join('\n');
    const affects = guessAffectsFromNearbyText(windowText, fnName);
    const where = fnName ? `game.js → ${fnName}()` : 'game.js';

    if (!apps[buffId]) apps[buffId] = [];
    apps[buffId].push({ where, affects });
  }

  // De-dupe
  for (const k of Object.keys(apps)) {
    const seen = new Set();
    apps[k] = apps[k].filter((x) => {
      const sig = `${x.where}|${x.affects}`;
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
  }

  return apps;
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function applyTheme(theme) {
  if (!theme) return;
  document.body.setAttribute('data-theme', theme);
  safeStorageSet(STORAGE_KEYS.theme, theme);
}

function setEnvWarning(text) {
  const el = $('envWarning');
  if (!el) return;
  el.textContent = text || '';
}

function isLightTheme(theme) {
  return theme === 'light' || theme === 'frosty' || theme === 'summer';
}

async function renderDiagram(kind) {
  const el = $('diagram');
  const status = $('diagramStatus');
  if (!el) return;

  const diagram = diagrams[kind] || diagrams.core;
  // Mermaid can auto-mark nodes as processed before we inject content.
  // Always clear the processed flag so the diagram actually renders.
  el.removeAttribute('data-processed');
  el.textContent = diagram;

  const theme = $('theme')?.value || 'terminal';

  try {
    status.textContent = '';
    mermaid.initialize({
      startOnLoad: false,
      theme: isLightTheme(theme) ? 'default' : 'dark',
      securityLevel: 'loose',
      flowchart: { curve: 'basis' },
    });

    await mermaid.run({ nodes: [el] });
  } catch (err) {
    status.textContent = `Diagram render error: ${String(err?.message || err)}`;
  }
}

function readSimpleStringField(objText, fieldName) {
  const re = new RegExp(`${fieldName}\\s*:\\s*(["'])([^"']+)\\1`);
  const m = objText.match(re);
  return m ? m[2] : null;
}

function readSimpleBoolField(objText, fieldName) {
  const re = new RegExp(`${fieldName}\\s*:\\s*(true|false)`);
  const m = objText.match(re);
  return m ? m[1] === 'true' : null;
}

function readSimpleNumberField(objText, fieldName) {
  const re = new RegExp(`${fieldName}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`);
  const m = objText.match(re);
  return m ? Number(m[1]) : null;
}

function splitTopLevelObjectEntries(objectLiteralText) {
  const entries = [];
  if (!objectLiteralText) return entries;

  const src = objectLiteralText.trim();
  if (!src.startsWith('{')) return entries;

  let i = 1; // skip leading {
  const end = src.lastIndexOf('}');
  if (end <= 0) return entries;

  let inString = false;
  let stringQuote = null;
  let inLineComment = false;
  let inBlockComment = false;

  function skipWsAndCommas() {
    while (i < end) {
      const ch = src[i];
      if (ch === ',' || ch === '\n' || ch === '\r' || ch === '\t' || ch === ' ') {
        i += 1;
        continue;
      }
      break;
    }
  }

  while (i < end) {
    skipWsAndCommas();
    if (i >= end) break;

    // Skip comments/strings at top-level (shouldn't happen often, but keep it safe).
    const ch0 = src[i];
    const ch1 = i + 1 < end ? src[i + 1] : '';
    if (ch0 === '/' && ch1 === '/') {
      // line comment
      i += 2;
      while (i < end && src[i] !== '\n') i += 1;
      continue;
    }
    if (ch0 === '/' && ch1 === '*') {
      i += 2;
      while (i + 1 < end && !(src[i] === '*' && src[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }

    // Parse key (identifier)
    const keyMatch = src.slice(i, end).match(/^([a-zA-Z0-9_]+)\s*:/);
    if (!keyMatch) break;
    const key = keyMatch[1];
    i += keyMatch[0].length;

    // Expect object literal
    skipWsAndCommas();
    const objText = findBalancedObjectLiteral(src, i);
    if (!objText) break;
    entries.push({ key, objText });
    i += objText.length;
  }

  return entries;
}

function parseAchievementMultipliersFromSource(achievementsObjectLiteralText) {
  const out = [];
  const entries = splitTopLevelObjectEntries(achievementsObjectLiteralText);
  for (const { key: achKey, objText } of entries) {
    const id = readSimpleStringField(objText, 'id') || achKey;
    const name = readSimpleStringField(objText, 'name') || achKey;
    const resetOnRebirth = readSimpleBoolField(objText, 'resetOnRebirth');

    const notificationKey = readSimpleStringField(objText, 'notification') || null;

    const expl = SPECIAL_EXPLANATIONS?.achievement?.[id] || SPECIAL_EXPLANATIONS?.achievement?.[achKey] || '';

    const givesIdx = objText.indexOf('gives');
    if (givesIdx < 0) continue;
    const colonIdx = objText.indexOf(':', givesIdx);
    if (colonIdx < 0) continue;
    const givesText = findBalancedObjectLiteral(objText, colonIdx);
    if (!givesText) continue;

    const givesTypeRe = /gives(\d+)\s*:\s*"([a-zA-Z0-9_]+)"/g;
    let m;
    while ((m = givesTypeRe.exec(givesText)) !== null) {
      const n = m[1];
      const gType = m[2];
      const isMultiplier = gType === 'multiplier' || gType === 'multiplierPermanent';
      const isSpecial = gType === 'doubleAllResourcesToStorageCap';
      if (!isMultiplier && !isSpecial) continue;

      const valueKey = `value${n}`;
      const valueIdx = givesText.indexOf(valueKey);
      let affects = '(varies)';
      let magnitude = '';
      if (valueIdx >= 0) {
        const valueColon = givesText.indexOf(':', valueIdx);
        const valueObj = valueColon >= 0 ? findBalancedObjectLiteral(givesText, valueColon) : null;
        if (valueObj) {
          affects = readSimpleStringField(valueObj, 'type') || affects;
          const qty = readSimpleNumberField(valueObj, 'quantity');
          if (typeof qty === 'number') magnitude = String(qty);
        }
      }

      out.push({
        source: 'Achievement',
        id,
        name,
        affects,
        magnitude: isSpecial ? 'special' : magnitude,
        notificationKey,
        notes: [
          expl ? `unlock=${expl}` : null,
          `reward=${gType}`,
          resetOnRebirth === null ? null : `resetOnRebirth=${String(resetOnRebirth)}`,
        ].filter(Boolean).join(' '),
        code: `resourceDataObject.js → achievementsData.${achKey}`,
      });
    }
  }
  return out;
}

function findBalancedObjectLiteral(src, startIndex) {
  const openIndex = src.indexOf('{', startIndex);
  if (openIndex < 0) return null;

  let i = openIndex;
  let depth = 0;

  let inString = false;
  let stringQuote = null;
  let inLineComment = false;
  let inBlockComment = false;

  while (i < src.length) {
    const ch = src[i];
    const next = i + 1 < src.length ? src[i + 1] : '';

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      i += 1;
      continue;
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }

    if (inString) {
      if (ch === '\\') {
        i += 2;
        continue;
      }
      if (ch === stringQuote) {
        inString = false;
        stringQuote = null;
        i += 1;
        continue;
      }
      i += 1;
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i += 2;
      continue;
    }

    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i += 2;
      continue;
    }

    if (ch === '\'' || ch === '"' || ch === '`') {
      inString = true;
      stringQuote = ch;
      i += 1;
      continue;
    }

    if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return src.slice(openIndex, i + 1);
      }
    }

    i += 1;
  }

  return null;
}

function extractExportedObject(src, exportName) {
  const marker = `export let ${exportName}`;
  const idx = src.indexOf(marker);
  if (idx < 0) return null;
  const eqIdx = src.indexOf('=', idx);
  if (eqIdx < 0) return null;
  return findBalancedObjectLiteral(src, eqIdx);
}

function extractNamedPropertyObject(src, propertyName) {
  const marker = `${propertyName}:`;
  const idx = src.indexOf(marker);
  if (idx < 0) return null;
  return findBalancedObjectLiteral(src, idx + marker.length);
}

function extractAssignedObject(src, name) {
  // Supports patterns like: name = { ... };
  const re = new RegExp(`\\b${name}\\s*=\\s*\\{`);
  const m = re.exec(src);
  if (!m) return null;
  return findBalancedObjectLiteral(src, m.index);
}

function extractConstObject(src, name) {
  // Supports patterns like: const name = { ... };
  const re = new RegExp(`\\bconst\\s+${name}\\s*=\\s*\\{`);
  const m = re.exec(src);
  if (!m) return null;
  return findBalancedObjectLiteral(src, m.index);
}

function evalObjectLiteral(objText) {
  if (!objText) return null;
  const fn = new Function(`return (${objText});`);
  return fn();
}

function flattenAscendencyBuffs(ascendencyBuffs, applications = null) {
  const out = [];
  if (!ascendencyBuffs || typeof ascendencyBuffs !== 'object') return out;

  for (const [id, data] of Object.entries(ascendencyBuffs)) {
    if (id === 'version') continue;
    if (!data || typeof data !== 'object') continue;

    const appliedBy = applications && applications[id] ? applications[id] : [];
    const affects = appliedBy.length ? appliedBy.map((x) => x.affects).filter(Boolean).join('; ') : '(varies)';
    const stacking = appliedBy.length ? appliedBy.map((x) => x.where).filter(Boolean).join('; ') : '';

    const expl = SPECIAL_EXPLANATIONS?.ascendencyBuff?.[id] || '';

    out.push({
      source: 'Ascendency Buff',
      id,
      name: String(data.name ?? id),
      affects,
      magnitude: Number.isFinite(data.effectCategoryMagnitude) ? `x${data.effectCategoryMagnitude}` : String(data.effectCategoryMagnitude ?? ''),
      notes: [
        expl ? `unlock=${expl}` : null,
        `rebuyable=${String(!!data.rebuyable)}`,
        `boughtYet=${String(data.boughtYet ?? 0)}`,
        `timesRebuyable=${String(data.timesRebuyable ?? '')}`,
        stacking ? `appliedIn=${stacking}` : null,
      ].filter(Boolean).join(' '),
      code: `resourceDataObject.js → ascendencyBuffs.${id}`,
    });
  }

  return out;
}

function flattenPhilosophyRepeatables(philosophyRepeatableTechs) {
  const out = [];
  if (!philosophyRepeatableTechs || typeof philosophyRepeatableTechs !== 'object') return out;

  for (const [philosophyId, techs] of Object.entries(philosophyRepeatableTechs)) {
    if (!techs || typeof techs !== 'object') continue;

    for (const [techId, data] of Object.entries(techs)) {
      if (!data || typeof data !== 'object') continue;
      const affects = data.affects ? String(data.affects) : '(unknown)';
      const repeatable = !!data.repeatable;
      const multiplier = data.multiplier;
      out.push({
        source: 'Philosophy Repeatable',
        id: `${philosophyId}:${techId}`,
        name: `${techId}`,
        affects,
        magnitude: typeof multiplier === 'number' ? `x${multiplier}` : String(multiplier ?? ''),
        notes: `philosophy=${philosophyId} repeatable=${String(repeatable)} price=${String(data.price ?? '')}`,
        code: `resourceDataObject.js → resourceData.philosophyRepeatableTechs.${philosophyId}.${techId}`,
      });
    }
  }

  return out;
}

function flattenAchievementMultipliers(achievementsData) {
  const out = [];
  if (!achievementsData || typeof achievementsData !== 'object') return out;

  for (const [achId, ach] of Object.entries(achievementsData)) {
    if (achId === 'version') continue;
    if (!ach || typeof ach !== 'object') continue;

    const gives = ach.gives && typeof ach.gives === 'object' ? ach.gives : null;
    if (!gives) continue;

    for (const [gKey, gType] of Object.entries(gives)) {
      if (!String(gKey).startsWith('gives')) continue;
      if (typeof gType !== 'string') continue;

      const idx = gKey.replace('gives', 'value');
      const value = gives[idx];
      if (!value || typeof value !== 'object') continue;

      const isMultiplier = gType === 'multiplier' || gType === 'multiplierPermanent';
      const isSpecial = gType === 'doubleAllResourcesToStorageCap';
      if (!isMultiplier && !isSpecial) continue;

      let affects = value.type ? String(value.type) : '(varies)';
      let magnitude = '';
      if (typeof value.quantity === 'number') magnitude = String(value.quantity);

      out.push({
        source: 'Achievement',
        id: String(ach.id ?? achId),
        name: String(ach.name ?? achId),
        affects,
        magnitude: isSpecial ? 'special' : magnitude,
        notes: `reward=${gType} resetOnRebirth=${String(!!ach.resetOnRebirth)}`,
        code: `resourceDataObject.js → achievementsData.${achId}`,
      });
    }
  }

  return out;
}

function normaliseRowForSearch(row) {
  return [
    row.source,
    row.id,
    row.name,
    row.affects,
    row.magnitude,
    row.notes,
    row.code,
  ].join(' ').toLowerCase();
}

function renderTable(rows, query) {
  const tbody = $('rows');
  const status = $('loadStatus');
  if (!tbody) return;

  const q = String(query ?? '').trim().toLowerCase();
  const filtered = q.length
    ? rows.filter((r) => normaliseRowForSearch(r).includes(q))
    : rows;

  tbody.innerHTML = '';

  for (const r of filtered) {
    const tr = document.createElement('tr');

    const tdSource = document.createElement('td');
    tdSource.textContent = r.source;

    const tdId = document.createElement('td');
    tdId.textContent = r.id;
    tdId.className = 'mono';

    const tdName = document.createElement('td');
    tdName.textContent = r.name;

    const tdAffects = document.createElement('td');
    tdAffects.textContent = r.affects;

    const tdMag = document.createElement('td');
    tdMag.textContent = r.magnitude;

    const tdNotes = document.createElement('td');
    tdNotes.textContent = r.notes;

    const tdCode = document.createElement('td');
    tdCode.textContent = r.code;
    tdCode.className = 'mono';

    tr.appendChild(tdSource);
    tr.appendChild(tdId);
    tr.appendChild(tdName);
    tr.appendChild(tdAffects);
    tr.appendChild(tdMag);
    tr.appendChild(tdNotes);
    tr.appendChild(tdCode);

    tbody.appendChild(tr);
  }

  if (status) {
    status.textContent = `Rows: ${filtered.length} / ${rows.length}`;
  }
}

async function loadRowsFromCode() {
  const status = $('loadStatus');
  if (status) status.textContent = 'Loading resourceDataObject.js...';

  if (window.location.protocol === 'file:') {
    throw new Error('This tool must be opened via a local HTTP server (not file://), otherwise it cannot fetch /resourceDataObject.js. Run: node tools/mechanics-map/server.mjs');
  }

  const [resRdo, resEvents, resDescriptions, resGame] = await Promise.all([
    fetch('/resourceDataObject.js', { cache: 'no-store' }),
    fetch('/events.js', { cache: 'no-store' }),
    fetch('/descriptions.js', { cache: 'no-store' }),
    fetch('/game.js', { cache: 'no-store' }),
  ]);

  const bad = [
    ['resourceDataObject.js', resRdo],
    ['events.js', resEvents],
    ['descriptions.js', resDescriptions],
    ['game.js', resGame],
  ].find(([, r]) => !r.ok);

  if (bad) {
    const [name, r] = bad;
    throw new Error(`Failed to load /${name} (${r.status}). Make sure you're running the mechanics-map server from the repo and opening the printed http://127.0.0.1 URL.`);
  }

  const src = await resRdo.text();
  const srcEvents = await resEvents.text();
  const srcDescriptions = await resDescriptions.text();
  const srcGame = await resGame.text();

  const ascText = extractExportedObject(src, 'ascendencyBuffs');
  const achievementsText = extractExportedObject(src, 'achievementsData');
  const repeatablesText = extractNamedPropertyObject(src, 'philosophyRepeatableTechs');

  const ascendencyApps = parseAscendencyBuffApplications(srcGame);
  const ascendencyBuffs = evalObjectLiteral(ascText) || {};
  const philosophyRepeatableTechs = evalObjectLiteral(repeatablesText) || {};

  const randomEventDescriptions = parseRandomEventDescriptionsFromSource(srcDescriptions);
  const descriptionRows = parseDescriptionRowsFromSource(srcDescriptions);
  const achievementNotifications = parseAchievementNotificationsFromSource(srcDescriptions);

  // achievementsData contains function references; do NOT eval it.
  const achievementRows = parseAchievementMultipliersFromSource(achievementsText).map((r) => {
    if (r.source !== 'Achievement') return r;
    const raw = r.notificationKey ? achievementNotifications[r.notificationKey] : null;
    const summary = raw ? normaliseDescriptionText(raw).replace(/^ACHIEVEMENT:\s*/i, '').trim() : '';
    if (!summary) return r;
    return { ...r, notes: [r.notes, `desc=${summary}`].filter(Boolean).join(' ') };
  });
  const timedEffectsText = extractConstObject(srcEvents, 'timedEffectDefinitions');
  const randomEventsText = extractConstObject(srcEvents, 'randomEventDefinitions');
  const timedEffects = extractEventIdsFromDefinitionsObject(timedEffectsText);
  const randomEvents = extractEventIdsFromDefinitionsObject(randomEventsText);
  const eventRows = buildEventRows({ randomEvents, timedEffects, descriptionsMap: randomEventDescriptions });

  const ascRows = flattenAscendencyBuffs(ascendencyBuffs, ascendencyApps).map((r) => {
    if (r.source !== 'Ascendency Buff') return r;
    const descKey = ascendencyBuffs?.[r.id]?.description;
    if (!descKey) return r;
    const d = descriptionRows[descKey];
    if (!d) return r;
    const summary = buildSummaryFromDescriptionParts(d.content1, d.content2);
    if (!summary) return r;
    return { ...r, notes: [r.notes, `desc=${summary}`].filter(Boolean).join(' ') };
  });

  const repeatableRows = flattenPhilosophyRepeatables(philosophyRepeatableTechs).map((r) => {
    if (r.source !== 'Philosophy Repeatable') return r;
    const rowKey = techIdToDescriptionRowKey(r.id);
    const d = rowKey ? descriptionRows[rowKey] : null;
    if (!d) return r;
    const summary = buildSummaryFromDescriptionParts(d.content1, d.content2);
    if (!summary) return r;
    return { ...r, notes: [r.notes, `desc=${summary}`].filter(Boolean).join(' ') };
  });

  const rows = [
    ...ascRows,
    ...repeatableRows,
    ...achievementRows,
    ...eventRows,
  ];

  rows.sort((a, b) => {
    const s = a.source.localeCompare(b.source);
    if (s !== 0) return s;
    return a.id.localeCompare(b.id);
  });

  return rows;
}

let cachedRows = [];

async function reload() {
  try {
    cachedRows = await loadRowsFromCode();
    renderTable(cachedRows, $('search')?.value);
  } catch (err) {
    const status = $('loadStatus');
    const msg = String(err?.message || err);
    if (status) status.textContent = `Error: ${msg}`;
    if (window.location.protocol === 'file:') {
      setEnvWarning('Open this page via the local server. Run: node tools/mechanics-map/server.mjs');
    }
  }
}

function bind() {
  $('btnDiagramCore')?.addEventListener('click', () => void renderDiagram('core'));
  $('btnDiagramAutomation')?.addEventListener('click', () => void renderDiagram('automation'));
  $('btnDiagramMeta')?.addEventListener('click', () => void renderDiagram('meta'));
  $('btnDiagramSpace')?.addEventListener('click', () => void renderDiagram('space'));
  $('btnDiagramFleet')?.addEventListener('click', () => void renderDiagram('fleet'));
  $('btnDiagramMega')?.addEventListener('click', () => void renderDiagram('mega'));
  $('btnDiagramUnlocks')?.addEventListener('click', () => void renderDiagram('unlocks'));

  $('btnReload')?.addEventListener('click', () => void reload());

  $('search')?.addEventListener('input', (e) => {
    renderTable(cachedRows, e.target.value);
  });

  $('theme')?.addEventListener('change', (e) => {
    applyTheme(e.target.value);
    void renderDiagram('core');
  });
}

function initTheme() {
  const saved = safeStorageGet(STORAGE_KEYS.theme);
  const theme = saved || 'terminal';
  const sel = $('theme');
  if (sel) sel.value = theme;
  applyTheme(theme);
}

bind();
initTheme();
if (window.location.protocol === 'file:') {
  setEnvWarning('This tool cannot load data when opened as a file. Run: node tools/mechanics-map/server.mjs and open the http://127.0.0.1:PORT URL it prints.');
}
await reload();
await renderDiagram('core');
