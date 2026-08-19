/**
 * Area: Megastructures — manuscripts, factory stars, the five stages, the pane
 * Plan: tests/docs/areas/megastructures.md
 *
 * `megastructures.spec.js` covers the data and the accessors. This file plays the
 * chapter: it studies stars until the game hands out an ancient manuscript, takes
 * the manuscript star to find out which megastructure it points at, conquers the
 * factory star, and then researches all five stages through the real Research
 * buttons — measuring each stage's bonus off the thing it is supposed to change
 * rather than reading a multiplier back. Then it looks at the pane: the diagram
 * that lights up structure by structure, the force field that falls a level at a
 * time, and the table that fills in as the stages are taken.
 *
 * ## The chapter, as the game actually runs it
 *
 * 1. **Star study** rolls a manuscript. `getAncientManuscriptGenerationProbability`
 *    guarantees one the first time vision reaches 5 light years, a second at 20, a
 *    third at 35, a fourth at 45 — and never a fifth.
 * 2. The manuscript record is `[manuscriptStar, factoryStar, position, reported]`.
 *    Until `reported` is true the factory star is a rumour: the map does not draw
 *    it, the search does not offer it, and the Star Data table leaves it out.
 * 3. **Settling the manuscript star** calls `activateFactoryStar`, which flips
 *    `reported` and registers the factory star for real.
 * 4. **Conquering the factory star** puts its structure into
 *    `megaStructuresInPossessionArray` and unlocks the Megastructures pane.
 * 5. **Rebirthing into that system** makes it a megastructure run, which is the
 *    only condition under which the Research pane offers that structure's five
 *    stages — and it offers only that structure's, never another's.
 * 6. Each stage is a tech bought with research points, and stage 3 of every
 *    structure brings the Miaplacidean force field down one level. Four
 *    structures, four levels, and Miaplacidus becomes reachable.
 *
 * ## What is staged rather than played, and why
 *
 * The battle at a factory star is **not** re-fought here. Factory stars are hard
 * mode by design — `isHardModeDestinationStar` forces life, an aggressive,
 * mechanized, armored lifeform set and a real fleet — so the outcome is a roll,
 * and `battle/battle-live.spec.js` already fights a real engagement end to end.
 * What this file drives is `settleSystemAfterBattle`, the game's own conquest
 * handler, which is the single function all three access points (`battle`,
 * `surrender`, `noSentientLife`) call once the fighting is decided. Everything
 * *after* that moment — possession, the pane, the AP, the stages, the force
 * field — is played through the real UI.
 *
 * Likewise the rebirth into a conquered system is set up with
 * `setCurrentRunIsMegaStructureRun`, the flag `rebirth()` itself computes;
 * `rebirth/rebirth-live.spec.js` owns the rebirth.
 *
 * ## What each structure's five stages actually do
 *
 * | | 1 | 2 | 3 | 4 | 5 |
 * |---|---|---|---|---|---|
 * | Dyson Sphere | batteries and the energy store double | every power plant +25% | force field | infinite power | infinite power, captured |
 * | Celestial Processing Core | — | — | force field | — | captured |
 * | Plasma Forge | resource rates x1.25 | x1.5 | force field | x1.75 | x2, resource bonus |
 * | Galactic Memory Archive | +100K storage | +1M | force field | +1B | +10B, storage bonus |
 *
 * The Plasma Forge and Archive stages are *cumulative* — each one multiplies or
 * adds on top of the last — which is the "more conquered, better bonuses" rule,
 * and the specs measure the compounding rather than the individual step.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** The four structures, in the order `applyMegaStructureBonuses` indexes them. */
const STRUCTURES = {
  1: 'Dyson Sphere',
  2: 'Celestial Processing Core',
  3: 'Plasma Forge',
  4: 'Galactic Memory Archive'
};

/** The table's column key for each structure, and the tech behind each stage. */
const STRUCTURE_KEYS = {
  'Dyson Sphere': 'DysonSphere',
  'Celestial Processing Core': 'CelestialProcessingCore',
  'Plasma Forge': 'PlasmaForge',
  'Galactic Memory Archive': 'GalacticMemoryArchive'
};

/** The five stage names every structure's techs are built from. */
const STAGE_SUFFIXES = ['Understanding', 'Capabilities', 'Disconnect', 'Power', 'Connect'];

/** The tech id prefix for each structure. */
const TECH_PREFIX = {
  'Dyson Sphere': 'dysonSphere',
  'Celestial Processing Core': 'celestialProcessingCore',
  'Plasma Forge': 'plasmaForge',
  'Galactic Memory Archive': 'galacticMemoryArchive'
};

/** Star-vision distances at which a manuscript is guaranteed rather than rolled. */
const GUARANTEED_AT = [5, 20, 35, 45];

/** The most manuscripts a save will ever hand out. */
const MAX_MANUSCRIPTS = 4;

/** Plasma Forge resource-rate multipliers, applied cumulatively stage by stage. */
const FORGE_MULTIPLIERS = { 1: 1.25, 2: 1.5, 4: 1.75, 5: 2 };

/** Galactic Memory Archive storage additions, applied cumulatively. */
const ARCHIVE_ADDITIONS = { 1: 100_000, 2: 1_000_000, 4: 1_000_000_000, 5: 10_000_000_000 };

// Studying a run's way to four manuscripts, conquering four systems and buying
// twenty techs is a long chapter even with the debug tooling doing the walking.
test.describe.configure({ timeout: 420_000 });

// --------------------------------------------------------------------- helpers

/** Close whatever modal is currently up, however many are queued behind it. */
async function dismissModals(page, attempts = 8) {
  for (let i = 0; i < attempts; i++) {
    const closed = await page.evaluate(() => {
      const confirm = document.getElementById('modalConfirm');
      if (confirm?.offsetParent) { confirm.click(); return true; }
      const cancel = document.getElementById('modalCancel');
      if (cancel?.offsetParent) { cancel.click(); return true; }
      return false;
    });
    if (!closed) return;
    await page.waitForTimeout(400);
  }
}

/** Open a side-menu row by id, the way a player clicks it. */
async function openOptionById(game, tab, optionId) {
  await dismissModals(game.page);
  await game.openTab(tab);
  const found = await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.classList.remove('invisible');
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, optionId);
  if (!found) throw new Error(`No side-menu row with id ${optionId}`);
  await game.page.waitForTimeout(700);
  return found;
}

const openMegastructuresPane = (game) => openOptionById(game, 7, 'megastructuresOption');

/**
 * Open the pane the megastructure stages are actually offered on.
 *
 * They are *built* inside `drawTab3Content`'s `Research` branch but appended to
 * the **Technology** pane's container, which is where the tech tree's rows live.
 * Opening Research shows the science upgrades and none of the stages.
 */
const openTechnologyPane = (game) => openOptionById(game, 3, 'technologyOption');

/** A localized string, resolved the way the game resolves it. */
const say = (game, key) => game.withMods((m, k) => m.loc.localize(k, m.cg.getLanguage()), key);

/** Press a control by selector. */
async function press(page, selector, settleMs = 300) {
  const hit = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, selector);
  if (!hit) throw new Error(`Nothing matched ${selector}`);
  await page.waitForTimeout(settleMs);
}

/**
 * A stocked run with the tabs open and the grid up — and **no stars studied**.
 *
 * `prepareRunForStarshipLaunch` is deliberately not used here: its chain clicks
 * Add Star five times, which takes star vision to exactly five light years and
 * therefore hands the run its first manuscript before a single spec has run. The
 * whole point of this file's first group is to watch that happen.
 */
async function stockedRun(game) {
  await game.debugClick('give1BButton');
  await game.debugClick('give1MAllResourcesAndCompounds');
  await game.debugClick('grantAllTechsButton');
  await game.debugClick('unlockAllTabsButton');
  await game.page.waitForTimeout(600);
  await dismissModals(game.page);
  await game.withMods((m) => {
    m.cg.setInfinitePower(true);
    m.cg.setPowerOnOff(true);
  });
  await game.page.waitForTimeout(400);
}

/** Every manuscript the run holds, as objects rather than positional arrays. */
async function manuscripts(game) {
  return game.withMods((m) => (m.cg.getStarsWithAncientManuscripts() || []).map((entry) => ({
    manuscriptStar: entry[0],
    factoryStar: entry[1],
    position: entry[2],
    reported: entry[3]
  })));
}

/**
 * Study stars through the game's own **Add Star** debug button until the run
 * holds at least `wanted` manuscripts, or the study budget runs out.
 *
 * That button is `extendStarDataRange`, the same call the Space Telescope's
 * Study Stars timer makes when it completes — so the manuscript rolls happen the
 * way they do in play rather than being written into the array.
 */
async function studyUntilManuscripts(game, wanted = 1, maxStudies = 60) {
  for (let i = 0; i < maxStudies; i++) {
    const held = (await manuscripts(game)).length;
    if (held >= wanted) return manuscripts(game);
    await game.debugClick('addStarButton', { delayMs: 120 });
  }
  return manuscripts(game);
}

/**
 * Settle a star the way the game settles one after a decided engagement.
 *
 * `settleSystemAfterBattle` is the single handler every access point funnels
 * into; the battle that precedes it belongs to the Battle area, and a factory
 * star's is a roll by design.
 *
 * The call is fired rather than awaited inside the page: the handler `await`s
 * several real confirmation modals, so awaiting its promise from `page.evaluate`
 * would block the very round trip that has to click Confirm. The modals are
 * cleared from out here instead, and the settle is waited on by its effect.
 */
async function conquer(game, starName) {
  await game.withMods((m, name) => {
    m.game.generateStarDataAndAddToDataObject({ id: name }, 12);
    m.cg.setDestinationStar(name);
    m.rdo.copyStarDataToDestinationStarField(name);
    m.cg.setDestinationStarScanned(true);
    m.cg.setApAwardedThisRun(false);
    globalThis.__settleFinished = false;
    Promise.resolve(m.game.settleSystemAfterBattle('battle'))
      .finally(() => { globalThis.__settleFinished = true; });
  }, starName);

  for (let i = 0; i < 20; i++) {
    await dismissModals(game.page, 3);
    const done = await game.page.evaluate(() => globalThis.__settleFinished === true);
    if (done) break;
    await game.page.waitForTimeout(400);
  }
  await dismissModals(game.page);
  await game.page.waitForTimeout(400);
}

/**
 * Put the run inside a conquered factory system, as a rebirth into one leaves it.
 *
 * `rebirth()` computes `currentRunIsMegaStructureRun` from whether the star it
 * lands in is a factory star; that rebirth is the Rebirth area's to prove, and
 * repeating it here would cost four full run resets for no extra coverage.
 */
async function standInFactorySystem(game, starName, structure) {
  await game.withMods((m, cfg) => {
    m.game.generateStarDataAndAddToDataObject({ id: cfg.star }, 12);
    m.rdo.setStarSystemDataObject(cfg.structure, 'stars', [cfg.star.toLowerCase(), 'factoryStar']);
    m.cg.setCurrentStarSystem(cfg.star.toLowerCase());
    m.cg.setSettledStars(cfg.star.toLowerCase());
    m.cg.setCurrentRunIsMegaStructureRun(true);
  }, { star: starName, structure });
  await game.page.waitForTimeout(400);
}

/** Research points enough for a whole structure's five stages, and then some. */
async function stockResearch(game, times = 3) {
  await game.debugClick('give1MResearch', { times, delayMs: 150 });
}

/** The megastructure tech rows the Research pane is currently offering. */
async function offeredStageRows(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('.option-row[id^="tech"][id$="Row"]'))
      .map((row) => row.id)
      .filter((id) => /DysonSphere|CelestialProcessingCore|PlasmaForge|GalacticMemoryArchive/.test(id)));
}

/** Buy one stage through its own Research button, and clear the story modal. */
async function researchStage(game, structure, stageIndex) {
  const techId = `${TECH_PREFIX[structure]}${STAGE_SUFFIXES[stageIndex - 1]}`;
  const rowId = `tech${techId.charAt(0).toUpperCase()}${techId.slice(1)}Row`;
  await openTechnologyPane(game);

  const present = await game.page.evaluate((id) => Boolean(document.getElementById(id)), rowId);
  if (!present) throw new Error(`The Technology pane is not offering ${rowId}`);

  await press(game.page, `#${rowId} button`, 500);
  await dismissModals(game.page);
  await game.page.waitForTimeout(500);

  const done = await game.withMods((m, id) => m.cg.getTechUnlockedArray().includes(id), techId);
  if (!done) throw new Error(`${techId} did not unlock`);
  return techId;
}

/** Buy every stage of a structure, in the order the chain demands. */
async function researchAllStages(game, structure) {
  await stockResearch(game);
  for (let stage = 1; stage <= 5; stage++) {
    await researchStage(game, structure, stage);
  }
}

/** The stage pairs the run has researched, as `[structureIndex, stage]`. */
const researched = (game) => game.withMods((m) => m.cg.getMegaStructureTechsResearched());

/** What the diagram is currently drawing, image by image. */
async function diagramState(page) {
  return page.evaluate(() => {
    const src = (id) => document.getElementById(id)?.querySelector('img')?.getAttribute('src') ?? null;
    return {
      forceField: src('forceFieldBox'),
      starSystem: src('starSystemBox'),
      dysonSphere: src('dysonSphereContainer'),
      celestialProcessingCore: src('celestialProcessingCoreContainer'),
      plasmaForge: src('plasmaForgeContainer'),
      galacticMemoryArchive: src('galacticMemoryArchiveContainer')
    };
  });
}

/** The colour every cell of the megastructure table is currently painted. */
async function tableState(page) {
  return page.evaluate(() => {
    const cells = {};
    for (const key of ['DysonSphere', 'CelestialProcessingCore', 'PlasmaForge', 'GalacticMemoryArchive']) {
      const read = (id) => {
        const el = document.getElementById(id);
        const span = el?.querySelector('span');
        return el
          ? { text: span?.textContent?.trim(), cls: span?.className, background: el.style.backgroundColor }
          : null;
      };
      cells[key] = {
        name: read(`name${key}`),
        research: [1, 2, 3, 4, 5].map((i) => read(`research${key}${i}`)),
        effect: [1, 2, 3, 4, 5].map((i) => read(`effect${key}${i}`))
      };
    }
    return cells;
  });
}

/** Total storage capacity across every resource and compound. */
async function totalStorage(game) {
  return game.withMods((m) => {
    const sum = (category, skip = []) => Object.keys(m.rdo.getResourceDataObject(category))
      .filter((key) => !skip.includes(key))
      .reduce((total, key) => total + (m.rdo.getResourceDataObject(category, [key, 'storageCapacity']) || 0), 0);
    return { resources: sum('resources', ['solar']), compounds: sum('compounds') };
  });
}

/** Every resource autobuyer rate, tier by tier, as one flat map. */
async function autoBuyerRates(game) {
  return game.withMods((m) => {
    const rates = {};
    for (const key of Object.keys(m.rdo.getResourceDataObject('resources'))) {
      if (key === 'solar') continue;
      for (let tier = 1; tier <= 4; tier++) {
        rates[`${key}.tier${tier}`] =
          m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', `tier${tier}`, 'rate']);
      }
    }
    return rates;
  });
}

// ============================================ manuscripts and factory stars

test.describe('Megastructures — the manuscripts that point at them', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stockedRun(game);
  });

  test('studying out to five light years turns up the first manuscript', async ({ game }) => {
    const before = await manuscripts(game);
    expect(before, 'a fresh run holds no manuscripts').toHaveLength(0);

    const found = await studyUntilManuscripts(game, 1);
    expect(found.length, 'the first manuscript is guaranteed by five light years')
      .toBeGreaterThanOrEqual(1);

    const vision = await game.withMods((m) => m.cg.getStarVisionDistance());
    expect(vision, 'and it arrives no later than that threshold')
      .toBeGreaterThanOrEqual(GUARANTEED_AT[0]);
  });

  test('a manuscript records its star, the structure it points at, and that nobody has read it', async ({ game }) => {
    const [first] = await studyUntilManuscripts(game, 1);
    expect(first, 'the study should have produced a manuscript').toBeTruthy();

    expect(typeof first.manuscriptStar, 'the star holding the manuscript').toBe('string');
    expect(first.manuscriptStar).not.toBe('');
    expect(typeof first.factoryStar, 'the star it points at').toBe('string');
    expect(first.factoryStar).not.toBe(first.manuscriptStar);
    expect(first.position, 'manuscripts are numbered from one').toBe(1);
    expect(first.reported, 'and start unread').toBe(false);

    // The factory star is registered the moment the manuscript exists, which is
    // what lets the clue name it — but it is still a rumour until it is read.
    const factoryStars = await game.withMods((m) => m.cg.getFactoryStarsArray());
    expect(factoryStars, 'the factory star joins the register')
      .toContain(first.factoryStar.toLowerCase());

    const possession = await game.withMods((m) => m.cg.getMegaStructuresInPossessionArray());
    expect(possession, 'but nothing is owned yet').toHaveLength(0);
  });

  test('the manuscript star is never one the run could not sensibly hold a clue', async ({ game }) => {
    const found = await studyUntilManuscripts(game, MAX_MANUSCRIPTS);
    expect(found.length, 'the study should have produced several').toBeGreaterThanOrEqual(2);

    const context = await game.withMods((m) => ({
      current: String(m.cg.getCurrentStarSystem() || '').toLowerCase(),
      settled: (m.cg.getSettledStars() || []).map((n) => String(n).toLowerCase()),
      home: String(m.cg.getHomeStarName() || '').toLowerCase()
    }));

    const seen = new Set();
    for (const entry of found) {
      const star = entry.manuscriptStar.toLowerCase();
      expect(star, 'never the home system').not.toBe('miaplacidus');
      expect(star, 'never the system the run is standing in').not.toBe(context.current);
      expect(context.settled, 'never a system already settled').not.toContain(star);
      expect(seen.has(star), 'and never the same star twice').toBe(false);
      seen.add(star);

      const type = await game.withMods((m, name) => m.desc.getStarTypeByName(name), star);
      expect(type, 'and never an O-type, which is hard mode already').not.toBe('O');
    }
  });

  test('the four manuscripts point at four different megastructures, and there is no fifth', async ({ game }) => {
    const found = await studyUntilManuscripts(game, MAX_MANUSCRIPTS, 120);
    expect(found.length, 'a save hands out four manuscripts').toBe(MAX_MANUSCRIPTS);

    const positions = found.map((entry) => entry.position).sort((a, b) => a - b);
    expect(positions, 'numbered one to four').toEqual([1, 2, 3, 4]);

    const factoryStars = found.map((entry) => entry.factoryStar.toLowerCase());
    expect(new Set(factoryStars).size, 'each points at a star of its own').toBe(MAX_MANUSCRIPTS);

    // Studying further must not produce a fifth.
    await game.debugClick('addStarButton', { times: 10, delayMs: 100 });
    const after = await manuscripts(game);
    expect(after.length, 'the fourth is the last').toBe(MAX_MANUSCRIPTS);
  });

  test('settling the manuscript star is what reveals the megastructure', async ({ game }) => {
    const [first] = await studyUntilManuscripts(game, 1);
    expect(first).toBeTruthy();

    await conquer(game, first.manuscriptStar);

    const after = await manuscripts(game);
    const entry = after.find((m) => m.manuscriptStar === first.manuscriptStar);
    expect(entry.reported, 'reading the manuscript marks it read').toBe(true);
    expect(entry.factoryStar, 'and the star it names is normalised as it is registered')
      .toBe(first.factoryStar.toLowerCase());

    const registered = await game.withMods((m) => m.cg.getFactoryStarsArray());
    expect(registered).toContain(entry.factoryStar);

    // Which structure sits at that star is decided when the run gets there, not
    // when the manuscript names it: `activateFactoryStar` can only stamp a star
    // that already has a record, and `ensureFactoryStarMegaStructureAssigned`
    // fills the gap at conquest. Both routes end at the same four names.
    await conquer(game, entry.factoryStar);
    const assigned = await game.withMods((m, name) =>
      m.rdo.getStarSystemDataObject('stars', [name, 'factoryStar'], true), entry.factoryStar);
    expect(Object.values(STRUCTURES), `the factory star was assigned ${assigned}`)
      .toContain(assigned);
  });

  test('reading a manuscript sets the achievement that records the find', async ({ game }) => {
    const [first] = await studyUntilManuscripts(game, 1);
    await conquer(game, first.manuscriptStar);
    await game.page.waitForTimeout(800);

    // `checkForAchievements` consumes the flag in the frame it grants the
    // achievement, so the grant is what lasts.
    const granted = await game.withMods((m) =>
      m.rdo.getAchievementDataObject('findAncientManuscript', ['active']));
    expect(granted, 'finding an ancient manuscript is an achievement in its own right').toBe(true);
  });

  test('an unread manuscript is the only kind the news ticker will hint at', async ({ game }) => {
    const [first] = await studyUntilManuscripts(game, 1);

    // Unread: the star is a legitimate clue subject.
    const beforeRead = await manuscripts(game);
    expect(beforeRead.some((entry) => entry.reported === false)).toBe(true);

    await conquer(game, first.manuscriptStar);

    const afterRead = await manuscripts(game);
    const entry = afterRead.find((m) => m.manuscriptStar === first.manuscriptStar);
    expect(entry.reported, 'a read manuscript is no longer a mystery to hint at').toBe(true);

    // The ticker's own eligibility rule is `reported === false`; with only one
    // manuscript held and that one read, nothing is left to hint at.
    if (afterRead.length === 1) {
      expect(afterRead.filter((e) => e.reported === false)).toHaveLength(0);
    }
  });
});

// ================================================= conquering a factory star

test.describe('Megastructures — taking one', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stockedRun(game);
  });

  test('conquering a factory star takes possession of its structure', async ({ game }) => {
    const [first] = await studyUntilManuscripts(game, 1);
    await conquer(game, first.manuscriptStar);

    const factoryStar = (await manuscripts(game))
      .find((entry) => entry.manuscriptStar === first.manuscriptStar).factoryStar;

    const before = await game.withMods((m) => ({
      possession: [...m.cg.getMegaStructuresInPossessionArray()],
      tabUnlocked: m.cg.getMegaStructureTabUnlocked()
    }));
    expect(before.possession, 'a revealed structure is not an owned one').toHaveLength(0);

    await conquer(game, factoryStar);

    const after = await game.withMods((m) => ({
      possession: [...m.cg.getMegaStructuresInPossessionArray()],
      tabUnlocked: m.cg.getMegaStructureTabUnlocked()
    }));

    expect(after.possession, 'exactly one structure changes hands').toHaveLength(1);
    expect(Object.values(STRUCTURES), `possession reads ${after.possession[0]}`)
      .toContain(after.possession[0]);
    expect(after.tabUnlocked, 'and the Megastructures pane opens up').toBe(true);
    expect(before.tabUnlocked, 'which it was not before').toBe(false);
  });

  test('the Megastructures side-menu row appears only once a structure is held', async ({ game }) => {
    await game.openTab(7);
    await game.page.waitForTimeout(900);
    const hiddenAtFirst = await game.page.evaluate(() =>
      document.getElementById('megastructuresOption')?.parentElement?.parentElement
        ?.classList.contains('invisible'));
    expect(hiddenAtFirst, 'nothing to look at before there is anything to own').toBe(true);

    const [first] = await studyUntilManuscripts(game, 1);
    await conquer(game, first.manuscriptStar);
    const factoryStar = (await manuscripts(game))
      .find((entry) => entry.manuscriptStar === first.manuscriptStar).factoryStar;
    await conquer(game, factoryStar);

    await game.openTab(7);
    await game.page.waitForTimeout(900);
    const shownAfter = await game.page.evaluate(() =>
      document.getElementById('megastructuresOption')?.parentElement?.parentElement
        ?.classList.contains('invisible'));
    expect(shownAfter, 'and it is on the menu the moment one is').toBe(false);
  });

  test('a factory star is worth more ascendency than an ordinary one', async ({ game }) => {
    const [first] = await studyUntilManuscripts(game, 1);
    await conquer(game, first.manuscriptStar);
    const factoryStar = (await manuscripts(game))
      .find((entry) => entry.manuscriptStar === first.manuscriptStar).factoryStar;

    // The award is computed from the destination's own ascendencyPoints, so the
    // two settlements are compared against their own base rather than each other.
    const plainBefore = await game.withMods((m) => m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']));
    await conquer(game, 'vega');
    const plainAfter = await game.withMods((m) => ({
      ap: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']),
      base: m.rdo.getStarSystemDataObject('stars', ['destinationStar', 'ascendencyPoints'])
    }));
    const plainGain = plainAfter.ap - plainBefore;

    const factoryBefore = await game.withMods((m) => m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']));
    await conquer(game, factoryStar);
    const factoryAfter = await game.withMods((m) => ({
      ap: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']),
      base: m.rdo.getStarSystemDataObject('stars', ['destinationStar', 'ascendencyPoints'])
    }));
    const factoryGain = factoryAfter.ap - factoryBefore;

    // `settleSystemAfterBattle` doubles for a won battle and doubles again for a
    // factory star, so the multiplier on the base is 2 against 4.
    expect(plainGain / plainAfter.base, 'a battle for an ordinary system pays double')
      .toBeCloseTo(2, 1);
    expect(factoryGain / factoryAfter.base, 'a megastructure system pays double again')
      .toBeCloseTo(4, 1);
  });

  test('holding a structure is not the same as being able to work on it', async ({ game }) => {
    const [first] = await studyUntilManuscripts(game, 1);
    await conquer(game, first.manuscriptStar);
    const factoryStar = (await manuscripts(game))
      .find((entry) => entry.manuscriptStar === first.manuscriptStar).factoryStar;
    await conquer(game, factoryStar);

    // Owned, but the run is still standing in its old system.
    await openTechnologyPane(game);
    const offered = await offeredStageRows(game.page);
    expect(offered, 'the stages are not on offer from another system').toHaveLength(0);

    const structure = (await game.withMods((m) => m.cg.getMegaStructuresInPossessionArray()))[0];
    await standInFactorySystem(game, factoryStar, structure);
    await openTechnologyPane(game);

    const nowOffered = await offeredStageRows(game.page);
    expect(nowOffered, 'standing in the system is what opens the work').toHaveLength(5);
    for (const suffix of STAGE_SUFFIXES) {
      const expectedId = `tech${TECH_PREFIX[structure].charAt(0).toUpperCase()}` +
        `${TECH_PREFIX[structure].slice(1)}${suffix}Row`;
      expect(nowOffered).toContain(expectedId);
    }
  });

  test('a megastructure run offers its own structure’s stages and nobody else’s', async ({ game }) => {
    await standInFactorySystem(game, 'vega', 'Plasma Forge');
    await game.withMods((m) => {
      m.cg.setMegaStructuresInPossessionArray('Plasma Forge');
      m.cg.setMegaStructureTabUnlocked(true);
    });
    await openTechnologyPane(game);

    const offered = await offeredStageRows(game.page);
    expect(offered, 'five stages, one structure').toHaveLength(5);
    for (const id of offered) {
      expect(id, `${id} belongs to the Plasma Forge`).toContain('PlasmaForge');
    }
    expect(offered.join(' '), 'and no other structure gets a look in')
      .not.toContain('DysonSphere');
  });
});

// =============================================== the five stages and bonuses

test.describe('Megastructures — the Dyson Sphere, stage by stage', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stockedRun(game);
    await standInFactorySystem(game, 'vega', 'Dyson Sphere');
    await game.withMods((m) => {
      m.cg.setMegaStructuresInPossessionArray('Dyson Sphere');
      m.cg.setMegaStructureTabUnlocked(true);
    });
    await stockResearch(game);
  });

  test('stage one doubles every battery and the energy store with them', async ({ game }) => {
    const before = await game.withMods((m) => ({
      batteries: ['battery1', 'battery2', 'battery3'].map((key) =>
        m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'capacity'])),
      store: m.rdo.getResourceDataObject('buildings', ['energy', 'storageCapacity'])
    }));

    await researchStage(game, 'Dyson Sphere', 1);

    const after = await game.withMods((m) => ({
      batteries: ['battery1', 'battery2', 'battery3'].map((key) =>
        m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'capacity'])),
      store: m.rdo.getResourceDataObject('buildings', ['energy', 'storageCapacity'])
    }));

    for (let i = 0; i < 3; i++) {
      expect(after.batteries[i], `battery ${i + 1} doubles`)
        .toBe(Math.floor(before.batteries[i] * 2));
    }
    expect(after.store, 'and so does the store they feed').toBe(Math.floor(before.store * 2));

    expect(await researched(game)).toContainEqual([1, 1]);
  });

  test('stage two raises every power plant a quarter, measured off generation', async ({ game }) => {
    await researchStage(game, 'Dyson Sphere', 1);

    const before = await game.withMods((m) =>
      ['powerPlant1', 'powerPlant2', 'powerPlant3'].map((key) => ({
        key,
        rate: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'rate']),
        purchased: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'purchasedRate']),
        max: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'maxPurchasedRate'])
      })));

    await researchStage(game, 'Dyson Sphere', 2);

    const after = await game.withMods((m) =>
      ['powerPlant1', 'powerPlant2', 'powerPlant3'].map((key) => ({
        key,
        rate: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'rate']),
        purchased: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'purchasedRate']),
        max: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'maxPurchasedRate'])
      })));

    for (let i = 0; i < after.length; i++) {
      expect(after[i].max, `${after[i].key} ceiling`).toBeCloseTo(before[i].max * 1.25, 5);
      expect(after[i].rate, `${after[i].key} rate`).toBeCloseTo(before[i].rate * 1.25, 5);
      expect(after[i].purchased, `${after[i].key} purchased rate`)
        .toBeCloseTo(before[i].purchased * 1.25, 5);
    }

    expect(await researched(game)).toContainEqual([1, 2]);
  });

  test('stage three brings the force field down a level and unlocks antimatter for good', async ({ game }) => {
    await researchStage(game, 'Dyson Sphere', 1);
    await researchStage(game, 'Dyson Sphere', 2);

    const before = await game.withMods((m) => ({
      milestone: m.cg.getMiaplacidusMilestoneLevel(),
      permanent: m.cg.getPermanentAntimatterUnlock(),
      megaAntimatter: m.cg.getMegaStructureAntimatterAmount()
    }));

    await researchStage(game, 'Dyson Sphere', 3);

    const after = await game.withMods((m) => ({
      milestone: m.cg.getMiaplacidusMilestoneLevel(),
      permanent: m.cg.getPermanentAntimatterUnlock(),
      megaAntimatter: m.cg.getMegaStructureAntimatterAmount()
    }));

    expect(after.milestone, 'the force field falls one level').toBe(before.milestone + 1);
    expect(after.permanent, 'and antimatter is never locked away again').toBe(true);
    expect(after.megaAntimatter, 'the structure starts producing antimatter itself')
      .toBeCloseTo(0.15, 6);
    expect(before.megaAntimatter).not.toBeCloseTo(0.15, 6);

    expect(await researched(game)).toContainEqual([1, 3]);
  });

  test('stages four and five switch the grid on for ever', async ({ game }) => {
    for (const stage of [1, 2, 3]) await researchStage(game, 'Dyson Sphere', stage);

    await game.withMods((m) => {
      m.cg.setInfinitePower(false);
      m.cg.setPowerOnOff(false);
    });

    await researchStage(game, 'Dyson Sphere', 4);
    const afterFour = await game.withMods((m) => ({
      infinite: m.cg.getInfinitePower(),
      on: m.cg.getPowerOnOff()
    }));
    expect(afterFour.infinite, 'the fourth stage is the one that ends power management').toBe(true);
    expect(afterFour.on).toBe(true);

    await researchStage(game, 'Dyson Sphere', 5);
    const afterFive = await game.withMods((m) => ({
      infinite: m.cg.getInfinitePower(),
      on: m.cg.getPowerOnOff()
    }));
    expect(afterFive.infinite, 'and the fifth keeps it that way').toBe(true);
    expect(afterFive.on).toBe(true);

    const pairs = await researched(game);
    for (let stage = 1; stage <= 5; stage++) {
      expect(pairs, `stage ${stage} is on the record`).toContainEqual([1, stage]);
    }
  });
});

test.describe('Megastructures — the Plasma Forge compounds its own bonus', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stockedRun(game);
    await standInFactorySystem(game, 'vega', 'Plasma Forge');
    await game.withMods((m) => {
      m.cg.setMegaStructuresInPossessionArray('Plasma Forge');
      m.cg.setMegaStructureTabUnlocked(true);
    });
    await stockResearch(game);
  });

  test('each stage multiplies every autobuyer tier on top of the last', async ({ game }) => {
    const baseline = await autoBuyerRates(game);
    expect(Object.keys(baseline).length, 'there are rates to multiply').toBeGreaterThan(8);

    let cumulative = 1;
    for (const stage of [1, 2, 4, 5]) {
      // Stage 3 sits between 2 and 4 in the chain and grants no rate at all, so
      // it is taken in order but measured separately.
      if (stage === 4) await researchStage(game, 'Plasma Forge', 3);
      await researchStage(game, 'Plasma Forge', stage);
      cumulative *= FORGE_MULTIPLIERS[stage];

      const now = await autoBuyerRates(game);
      for (const [key, rate] of Object.entries(baseline)) {
        if (!rate) continue;
        expect(now[key], `${key} after stage ${stage}: cumulative x${cumulative}`)
          .toBeCloseTo(rate * cumulative, 5);
      }
    }

    // 1.25 x 1.5 x 1.75 x 2 — six and a half times the rate a run starts with,
    // which is the whole point of finishing a structure rather than starting one.
    expect(cumulative).toBeCloseTo(6.5625, 6);
    const bonusFlag = await game.withMods((m) => m.cg.getMegaStructureResourceBonus());
    expect(bonusFlag, 'and the completed structure is flagged as such').toBe(true);
  });

  test('the multiplier reaches resources and leaves the solar pseudo-resource alone', async ({ game }) => {
    const before = await game.withMods((m) => ({
      solar: m.rdo.getResourceDataObject('resources', ['solar', 'upgrades', 'autoBuyer', 'tier1', 'rate']),
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate'])
    }));

    await researchStage(game, 'Plasma Forge', 1);

    const after = await game.withMods((m) => ({
      solar: m.rdo.getResourceDataObject('resources', ['solar', 'upgrades', 'autoBuyer', 'tier1', 'rate']),
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate'])
    }));

    expect(after.hydrogen, 'a real resource is multiplied').toBeCloseTo(before.hydrogen * 1.25, 6);
    expect(after.solar, 'solar is generation, not production, and is skipped')
      .toBeCloseTo(before.solar, 6);
  });

  test('a faster autobuyer really does put more in the store', async ({ game }) => {
    // The rate is only worth measuring where the player feels it. Ten tier-1
    // autobuyers at a known rate, one driven window before and one after.
    const measure = async () => {
      await game.withMods((m) => m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']));
      await game.advanceTimers(100_000);
      await game.page.waitForTimeout(300);
      return game.withMods((m) => m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']));
    };

    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e15, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(0.5, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(10, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      for (const tier of ['tier2', 'tier3', 'tier4']) {
        m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', tier, 'quantity']);
      }
    });

    const plain = await measure();
    await researchStage(game, 'Plasma Forge', 1);
    const boosted = await measure();

    // Ten autobuyers at 0.5 a tick over 10,000 driven ticks, then the same at
    // 0.625. Compared against the formula rather than against each other: the
    // frame loop keeps producing between the windows and a ratio would absorb it.
    const expectedPlain = 10 * 0.5 * 10_000;
    const expectedBoosted = 10 * 0.625 * 10_000;

    expect(plain, `plain production was ${plain}, expected about ${expectedPlain}`)
      .toBeGreaterThan(expectedPlain * 0.97);
    expect(plain).toBeLessThan(expectedPlain * 1.05);
    expect(boosted, `boosted production was ${boosted}, expected about ${expectedBoosted}`)
      .toBeGreaterThan(expectedBoosted * 0.97);
    expect(boosted).toBeLessThan(expectedBoosted * 1.05);
  });
});

test.describe('Megastructures — the Archive stacks storage', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stockedRun(game);
    await standInFactorySystem(game, 'vega', 'Galactic Memory Archive');
    await game.withMods((m) => {
      m.cg.setMegaStructuresInPossessionArray('Galactic Memory Archive');
      m.cg.setMegaStructureTabUnlocked(true);
    });
    await stockResearch(game);
  });

  test('every stage adds its own step to every store, and the steps accumulate', async ({ game }) => {
    // `solar` is generation rather than a stored resource, and the Archive skips
    // it exactly as the Forge's rate multiplier does.
    const counts = await game.withMods((m) => ({
      resources: Object.keys(m.rdo.getResourceDataObject('resources'))
        .filter((key) => key !== 'solar').length,
      compounds: Object.keys(m.rdo.getResourceDataObject('compounds')).length
    }));

    let expected = await totalStorage(game);

    for (const stage of [1, 2, 4, 5]) {
      if (stage === 4) await researchStage(game, 'Galactic Memory Archive', 3);
      await researchStage(game, 'Galactic Memory Archive', stage);

      expected = {
        resources: expected.resources + ARCHIVE_ADDITIONS[stage] * counts.resources,
        compounds: expected.compounds + ARCHIVE_ADDITIONS[stage] * counts.compounds
      };

      const now = await totalStorage(game);
      expect(now.resources, `resource storage after stage ${stage}`).toBe(expected.resources);
      expect(now.compounds, `compound storage after stage ${stage}`).toBe(expected.compounds);
    }

    const flag = await game.withMods((m) => m.cg.getStorageAdderBonus());
    expect(flag, 'the finished Archive is flagged').toBe(true);
  });
});

test.describe('Megastructures — the Processing Core', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stockedRun(game);
    await standInFactorySystem(game, 'vega', 'Celestial Processing Core');
    await game.withMods((m) => {
      m.cg.setMegaStructuresInPossessionArray('Celestial Processing Core');
      m.cg.setMegaStructureTabUnlocked(true);
    });
    await stockResearch(game);
  });

  test('its stages are recorded even where they grant nothing but the force field', async ({ game }) => {
    const before = await game.withMods((m) => ({
      storage: m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']),
      rate: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']),
      battery: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'capacity']),
      milestone: m.cg.getMiaplacidusMilestoneLevel()
    }));

    for (const stage of [1, 2]) await researchStage(game, 'Celestial Processing Core', stage);

    const afterTwo = await game.withMods((m) => ({
      storage: m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']),
      rate: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']),
      battery: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'capacity']),
      milestone: m.cg.getMiaplacidusMilestoneLevel()
    }));

    expect(afterTwo.storage, 'the Core is not the Archive').toBe(before.storage);
    expect(afterTwo.rate, 'nor the Forge').toBeCloseTo(before.rate, 6);
    expect(afterTwo.battery, 'nor the Sphere').toBe(before.battery);
    expect(afterTwo.milestone, 'and the force field has not moved yet').toBe(before.milestone);

    expect(await researched(game)).toContainEqual([2, 1]);
    expect(await researched(game)).toContainEqual([2, 2]);

    await researchStage(game, 'Celestial Processing Core', 3);
    const afterThree = await game.withMods((m) => m.cg.getMiaplacidusMilestoneLevel());
    expect(afterThree, 'the third stage is the one that counts for the force field')
      .toBe(before.milestone + 1);
  });
});

// =============================================== the pane: diagram and table

test.describe('Megastructures — the pane', () => {
  /** Own every structure, and research the given structures' third stages. */
  async function ownAll(game, disconnected = []) {
    await game.withMods((m, cfg) => {
      for (const name of Object.values(cfg.all)) {
        m.cg.setMegaStructuresInPossessionArray(name);
      }
      m.cg.setMegaStructureTabUnlocked(true);
      for (const index of cfg.disconnected) {
        m.game.applyMegaStructureBonuses(index, 3);
      }
    }, { all: STRUCTURES, disconnected });
    await game.page.waitForTimeout(400);
  }

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stockedRun(game);
  });

  test('the diagram draws a box for the field, the system and all four structures', async ({ game }) => {
    await ownAll(game);
    await openMegastructuresPane(game);

    const boxes = await game.page.evaluate(() => [
      'megaStructureDiagramContainer',
      'forceFieldBox',
      'starSystemBox',
      'dysonSphereContainer',
      'celestialProcessingCoreContainer',
      'plasmaForgeContainer',
      'galacticMemoryArchiveContainer'
    ].map((id) => ({ id, present: Boolean(document.getElementById(id)) })));

    for (const box of boxes) expect(box.present, `${box.id} is drawn`).toBe(true);

    const state = await diagramState(game.page);
    for (const [key, src] of Object.entries(state)) {
      expect(src, `${key} carries an image`).toBeTruthy();
    }
  });

  test('a structure lights up when its own third stage is taken, and not before', async ({ game }) => {
    await ownAll(game);
    await openMegastructuresPane(game);

    const before = await diagramState(game.page);
    expect(before.dysonSphere).toContain('DysonSphereNotActive');
    expect(before.plasmaForge).toContain('PlasmaForgeNotActive');

    await game.withMods((m) => m.game.applyMegaStructureBonuses(3, 3));
    await openMegastructuresPane(game);
    await game.page.waitForTimeout(700);

    const after = await diagramState(game.page);
    expect(after.plasmaForge, 'the Forge lights up').toContain('PlasmaForgeActive');
    expect(after.dysonSphere, 'and only the Forge').toContain('DysonSphereNotActive');
    expect(after.celestialProcessingCore).toContain('CelestialProcessingCoreNotActive');
    expect(after.galacticMemoryArchive).toContain('GalacticMemoryArchiveNotActive');
  });

  test('the force field image is indexed by how many structures are disconnected', async ({ game }) => {
    await ownAll(game);
    await openMegastructuresPane(game);

    expect((await diagramState(game.page)).forceField, 'four layers, none down')
      .toContain('ForceField0');

    const order = [1, 2, 3, 4];
    for (let taken = 1; taken <= 4; taken++) {
      await game.withMods((m, index) => m.game.applyMegaStructureBonuses(index, 3), order[taken - 1]);
      await openMegastructuresPane(game);
      await game.page.waitForTimeout(700);

      const state = await diagramState(game.page);
      expect(state.forceField, `${taken} structure(s) disconnected`)
        .toContain(`ForceField${taken}`);

      const milestone = await game.withMods((m) => m.cg.getMiaplacidusMilestoneLevel());
      expect(milestone, 'and the milestone counts the same way').toBe(taken);
    }
  });

  test('the home system only lights up when all four are disconnected', async ({ game }) => {
    await ownAll(game, [1, 2, 3]);
    await openMegastructuresPane(game);
    await game.page.waitForTimeout(700);

    expect((await diagramState(game.page)).starSystem, 'three of four is not enough')
      .toContain('MiaplacidusNotActive');

    await game.withMods((m) => m.game.applyMegaStructureBonuses(4, 3));
    await openMegastructuresPane(game);
    await game.page.waitForTimeout(700);

    expect((await diagramState(game.page)).starSystem, 'the fourth is what does it')
      .toContain('MiaplacidusActive');
  });

  test('every image follows the theme the player has chosen', async ({ game }) => {
    await ownAll(game, [1]);
    await openMegastructuresPane(game);
    await game.page.waitForTimeout(700);

    const first = await diagramState(game.page);
    const firstTheme = await game.withMods((m) => m.cg.getCurrentTheme());
    for (const [key, src] of Object.entries(first)) {
      expect(String(src).toLowerCase(), `${key} is drawn from the ${firstTheme} set`)
        .toContain(`/${String(firstTheme).toLowerCase()}/`);
    }

    const otherTheme = firstTheme === 'light' ? 'misty' : 'light';
    await game.withMods((m, theme) => m.ui.selectTheme(theme), otherTheme);
    await openMegastructuresPane(game);
    await game.page.waitForTimeout(900);

    const second = await diagramState(game.page);
    for (const [key, src] of Object.entries(second)) {
      expect(String(src).toLowerCase(), `${key} follows the theme change`)
        .toContain(`/${otherTheme.toLowerCase()}/`);
    }
  });

  test('the table lists all four structures with five stages and five effects each', async ({ game }) => {
    await ownAll(game);
    await openMegastructuresPane(game);
    await game.page.waitForTimeout(700);

    const catalogue = await game.withMods((m) => m.desc.getMegaStructureTableText());
    const cells = await tableState(game.page);

    for (const key of Object.values(STRUCTURE_KEYS)) {
      expect(cells[key].name.text, `${key} name cell`).toBe(catalogue[`name${key}`]);
      for (let i = 1; i <= 5; i++) {
        expect(cells[key].research[i - 1].text, `${key} stage ${i}`)
          .toBe(catalogue[`research${key}${i}`]);
        expect(cells[key].effect[i - 1].text, `${key} effect ${i}`)
          .toBe(catalogue[`effect${key}${i}`]);
      }
    }
  });

  test('a cell is red until it is earned, then green', async ({ game }) => {
    // Nothing owned, nothing researched: the whole table is still to come.
    await game.withMods((m) => m.cg.setMegaStructureTabUnlocked(true));
    await openMegastructuresPane(game);
    await game.page.waitForTimeout(700);

    const cold = await tableState(game.page);
    for (const key of Object.values(STRUCTURE_KEYS)) {
      expect(cold[key].name.cls, `${key} is not owned`).toBe('red-disabled-text');
      for (const cell of [...cold[key].research, ...cold[key].effect]) {
        expect(cell.cls, `${key} stage cell`).toBe('red-disabled-text');
      }
    }

    // Own one structure and take two of its stages.
    await game.withMods((m) => {
      m.cg.setMegaStructuresInPossessionArray('Dyson Sphere');
      m.game.applyMegaStructureBonuses(1, 1);
      m.game.applyMegaStructureBonuses(1, 2);
    });
    await openMegastructuresPane(game);
    await game.page.waitForTimeout(700);

    const warm = await tableState(game.page);
    expect(warm.DysonSphere.name.cls, 'the name greens when the structure is held')
      .toBe('green-ready-text');
    expect(warm.DysonSphere.research[0].cls, 'stage one taken').toBe('green-ready-text');
    expect(warm.DysonSphere.effect[0].cls).toBe('green-ready-text');
    expect(warm.DysonSphere.research[1].cls, 'stage two taken').toBe('green-ready-text');
    expect(warm.DysonSphere.research[2].cls, 'stage three still to come')
      .toBe('red-disabled-text');
    expect(warm.CelestialProcessingCore.name.cls, 'and the other structures are untouched')
      .toBe('red-disabled-text');
  });

  test('a structure finished outright gets its whole row tinted', async ({ game }) => {
    await game.withMods((m) => {
      m.cg.setMegaStructureTabUnlocked(true);
      m.cg.setMegaStructuresInPossessionArray('Dyson Sphere');
      for (let stage = 1; stage <= 5; stage++) m.game.applyMegaStructureBonuses(1, stage);
    });
    await openMegastructuresPane(game);
    await game.page.waitForTimeout(900);

    const cells = await tableState(game.page);
    const dyson = [cells.DysonSphere.name, ...cells.DysonSphere.research, ...cells.DysonSphere.effect];
    for (const cell of dyson) {
      expect(cell.cls, 'every cell of a finished structure is green').toBe('green-ready-text');
      expect(cell.background, 'and the row carries the finished tint').not.toBe('');
    }

    const unfinished = [
      cells.PlasmaForge.name,
      ...cells.PlasmaForge.research
    ];
    for (const cell of unfinished) {
      expect(cell.background, 'an unfinished structure has no tint').toBe('');
    }
  });
});

// ==================================================== Miaplacidus at the end

test.describe('Megastructures — what four conquests buy', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stockedRun(game);
  });

  test('the force field falls one level per structure and no faster', async ({ game }) => {
    expect(await game.withMods((m) => m.cg.getMiaplacidusMilestoneLevel()),
      'a run starts with the field intact').toBe(0);

    for (let index = 1; index <= 4; index++) {
      // Only the third stage moves it; the other four of each structure do not.
      for (const stage of [1, 2]) {
        await game.withMods((m, cfg) => m.game.applyMegaStructureBonuses(cfg.index, cfg.stage),
          { index, stage });
      }
      expect(await game.withMods((m) => m.cg.getMiaplacidusMilestoneLevel()),
        `structure ${index}: stages one and two do not touch the field`).toBe(index - 1);

      await game.withMods((m, i) => m.game.applyMegaStructureBonuses(i, 3), index);
      expect(await game.withMods((m) => m.cg.getMiaplacidusMilestoneLevel()),
        `structure ${index}: the third stage does`).toBe(index);

      for (const stage of [4, 5]) {
        await game.withMods((m, cfg) => m.game.applyMegaStructureBonuses(cfg.index, cfg.stage),
          { index, stage });
      }
      expect(await game.withMods((m) => m.cg.getMiaplacidusMilestoneLevel()),
        `structure ${index}: nor do stages four and five`).toBe(index);
    }
  });

  test('taking the field to its last level flags the endgame achievement', async ({ game }) => {
    for (let index = 1; index <= 4; index++) {
      await game.withMods((m, i) => m.game.applyMegaStructureBonuses(i, 3), index);
    }
    await game.page.waitForTimeout(800);

    const granted = await game.withMods((m) =>
      m.rdo.getAchievementDataObject('bringDownMiaplacideanForceField', ['active']));
    expect(granted, 'bringing the field down is the achievement the chapter exists for').toBe(true);
  });

  test('Miaplacidus is locked until all four are done, then becomes a destination', async ({ game }) => {
    // Three structures is not enough. The star is drawn locked and refuses to be
    // chosen — the drawing itself belongs to the Star Map area; what is asserted
    // here is that the milestone the map reads is driven by the conquests.
    for (let index = 1; index <= 3; index++) {
      await game.withMods((m, i) => m.game.applyMegaStructureBonuses(i, 3), index);
    }
    expect(await game.withMods((m) => m.cg.getMiaplacidusMilestoneLevel()),
      'three of four leaves the field standing').toBe(3);

    await game.openTab(5);
    await openOptionById(game, 5, 'starMapOption');
    await game.page.waitForTimeout(900);

    const locked = await game.page.evaluate(() =>
      Array.from(document.getElementById('Miaplacidus')?.classList ?? []));
    expect(locked, 'and the home star is still drawn behind it').toContain('home-star');
    expect(locked).not.toContain('home-star-accessible');

    await game.withMods((m) => m.game.applyMegaStructureBonuses(4, 3));
    await openOptionById(game, 5, 'starMapOption');
    await game.page.waitForTimeout(900);

    const open = await game.page.evaluate(() =>
      Array.from(document.getElementById('Miaplacidus')?.classList ?? []));
    expect(open, 'the fourth conquest opens the way home').toContain('home-star-accessible');
    expect(open).not.toContain('home-star');

    // Selecting it now produces a real destination row. The journey itself is
    // deliberately not taken: arriving plays the end-credits cinematic, which
    // blocks interaction permanently by design.
    await game.page.evaluate(() =>
      document.getElementById('Miaplacidus')?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await game.page.waitForTimeout(900);

    const destinationName = await game.page.evaluate(() =>
      document.getElementById('starDestinationName')?.textContent?.trim());
    expect(destinationName, 'Miaplacidus can now be chosen as a destination')
      .toContain('Miaplacidus');
  });

  test('four structures held is four structures in possession, without duplicates', async ({ game }) => {
    await game.withMods((m, all) => {
      for (const name of Object.values(all)) m.cg.setMegaStructuresInPossessionArray(name);
    }, STRUCTURES);

    const held = await game.withMods((m) => m.cg.getMegaStructuresInPossessionArray());
    expect(held, 'all four').toHaveLength(4);
    expect(new Set(held).size, 'each once').toBe(4);
    for (const name of Object.values(STRUCTURES)) {
      expect(held, `${name} is held`).toContain(name);
    }
  });
});
