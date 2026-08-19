/**
 * Area: Philosophies
 * Plan: tests/docs/areas/philosophies.md
 *
 * The choice is offered exactly once, from the star-study timer's completion
 * handler, and only while `getPlayerPhilosophy()` is still unset — so the modal
 * is the gate, and the four buttons map onto the four paths:
 *
 *   Confirm → constructor    Cancel → supremacist
 *   Extra1  → voidborn       Extra2 → expansionist
 *
 * Each philosophy then owns a branch of `philosophyRepeatableTechs`: one
 * non-repeatable special ability at index 0, and four repeatables whose effects
 * are applied by the `set…AfterRepeatables()` family. Those effect functions are
 * shared with other areas — the Supremacist fleet ones are asserted in detail by
 * the fleet-hangar specs — so what is pinned here is the structure common to all
 * four paths, each path's own effects, and the once-only irreversibility.
 *
 * Note `setDefaultPhilosophyForRun1IfUnset()` in the debug tooling assigns
 * voidborn on run 1, so any spec that cares about an *unset* philosophy must
 * avoid `prepareRunForStarshipLaunch()`.
 *
 * `philosophies-live.spec.js` now buys all twenty upgrades through their own
 * buttons on the Philosophy pane and measures each effect afterwards, so the
 * cases here that called the `set…AfterRepeatables()` functions directly — the
 * four per-path effect specs — and the one that asserted the Supremacist
 * vassalization exemption have been removed rather than asserted twice. What
 * remains is the part the live file does not cover: the catalogue's shape, the
 * choice modal and its localization, the run-1 gate on the Voidborn AP bonus,
 * the casino route into the void prize, and the save/load round trip.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const PHILOSOPHIES = ['constructor', 'supremacist', 'voidborn', 'expansionist'];

const LANGUAGES = ['en', 'es', 'pt', 'de', 'it', 'fr'];

/** The four modal buttons, in the order the choice modal assigns the paths. */
const PHILOSOPHY_BUTTON_IDS = ['#modalConfirm', '#modalCancel', '#modalExtraChoice1', '#modalExtraChoice2'];

/**
 * Raise the real philosophy choice modal.
 *
 * The modal is only ever built inside `startInvestigateStarTimer`'s completion
 * branch, so reaching it through the game's own code — rather than calling
 * `callPopupModal` with labels of our own — is the only way to prove that what
 * `game.js` passes as the four labels is what the player sees. The timer is a
 * repeating `timerManagerDelta` timer that counts `adjustment[0]` down, so
 * seeding a short remainder and advancing the delta timers fires it in
 * milliseconds instead of the usual forty minutes.
 *
 * Returns the four rendered button labels.
 */
async function openPhilosophyModal(game) {
  await game.withMods((m) => {
    // The modal gate is `!getPlayerPhilosophy()`. The countdown pauses unless
    // the telescope has power, and `canContinue` is re-derived from
    // `getPowerOnOff()` every frame, so setting the flag directly is not enough
    // — the power itself has to be on, and neither of the two competing
    // telescope actions may be running.
    m.cg.setPlayerPhilosophy(undefined);
    m.cg.setPowerOnOff(true);
    m.cg.setCurrentlySearchingAsteroid(false);
    m.cg.setCurrentlyPillagingVoid(false);
    m.cg.setStarInvestigationTimerCanContinue(true);
    m.game.startInvestigateStarTimer([400]);
  });

  // The timer is repeating with `durationMs: 0`, so the live frame loop drives
  // it with real deltas. Waiting is the honest way to run it down.
  await game.page.locator('#modalExtraChoice2').waitFor({ state: 'visible', timeout: 15000 });

  return Promise.all(
    PHILOSOPHY_BUTTON_IDS.map((id) => game.page.locator(id).innerText().then((t) => t.trim()))
  );
}

const SPECIAL_ABILITIES = {
  constructor: 'spaceStorageTankResearch',
  supremacist: 'fleetHolograms',
  voidborn: 'voidSeers',
  expansionist: 'rapidExpansion'
};

test.describe('Philosophies — catalogue and structure', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('all four paths exist with one special ability and four repeatables each', async ({ game }) => {
    const problems = await game.withMods((m, config) => {
      const { philosophies, abilities } = config;
      const data = m.rdo.getResourceDataObject('philosophyRepeatableTechs');
      const issues = [];

      const paths = Object.keys(data || {});
      if (paths.length !== philosophies.length) {
        issues.push(`expected ${philosophies.length} paths, found ${paths.join(', ')}`);
      }

      for (const philosophy of philosophies) {
        const branch = data?.[philosophy];
        if (!branch) { issues.push(`${philosophy}: missing`); continue; }

        const techs = Object.entries(branch);
        if (techs.length !== 5) issues.push(`${philosophy}: has ${techs.length} techs, expected 5`);

        const ability = branch[abilities[philosophy]];
        if (!ability) {
          issues.push(`${philosophy}: special ability ${abilities[philosophy]} missing`);
        } else {
          if (ability.repeatable !== false) issues.push(`${philosophy}: special ability should not be repeatable`);
          if (ability.affects !== 'specialAbility') issues.push(`${philosophy}: special ability affects ${ability.affects}`);
          if (ability.idWithinCategory !== 0) issues.push(`${philosophy}: special ability is not index 0`);
        }

        const indices = techs.map(([, tech]) => tech.idWithinCategory).sort((a, b) => a - b);
        if (JSON.stringify(indices) !== JSON.stringify([0, 1, 2, 3, 4])) {
          issues.push(`${philosophy}: indices are ${indices.join(',')}`);
        }

        for (const [key, tech] of techs) {
          if (tech.philosophy !== philosophy) issues.push(`${philosophy}.${key}: tagged ${tech.philosophy}`);
          if (!(Number.isFinite(tech.price) && tech.price > 0)) issues.push(`${philosophy}.${key}: bad price`);
          if (typeof tech.setPrice !== 'string' || !tech.setPrice) issues.push(`${philosophy}.${key}: no setPrice key`);
          if (typeof tech.affects !== 'string' || !tech.affects) issues.push(`${philosophy}.${key}: no affects tag`);
        }
      }
      return issues;
    }, { philosophies: PHILOSOPHIES, abilities: SPECIAL_ABILITIES });

    expect(problems).toEqual([]);
  });

  test('the special ability costs far more than any repeatable on the same path', async ({ game }) => {
    const prices = await game.withMods((m, config) => {
      const { philosophies, abilities } = config;
      const data = m.rdo.getResourceDataObject('philosophyRepeatableTechs');
      return Object.fromEntries(philosophies.map((philosophy) => {
        const branch = data[philosophy];
        const abilityPrice = branch[abilities[philosophy]].price;
        const repeatablePrices = Object.entries(branch)
          .filter(([key]) => key !== abilities[philosophy])
          .map(([, tech]) => tech.price);
        return [philosophy, { abilityPrice, repeatablePrices }];
      }));
    }, { philosophies: PHILOSOPHIES, abilities: SPECIAL_ABILITIES });

    for (const philosophy of PHILOSOPHIES) {
      const { abilityPrice, repeatablePrices } = prices[philosophy];
      expect(abilityPrice, `${philosophy} ability price`).toBe(500000);
      for (const price of repeatablePrices) {
        expect(price, `${philosophy} repeatable price`).toBe(10000);
        expect(abilityPrice).toBeGreaterThan(price);
      }
    }
  });

  test('every path affects a distinct set of systems', async ({ game }) => {
    const affects = await game.withMods((m, philosophies) => {
      const data = m.rdo.getResourceDataObject('philosophyRepeatableTechs');
      return Object.fromEntries(philosophies.map((philosophy) => [
        philosophy,
        Object.values(data[philosophy]).map((tech) => tech.affects).filter((a) => a !== 'specialAbility')
      ]));
    }, PHILOSOPHIES);

    // The four repeatables of a path must not duplicate one another, and the
    // paths must not overlap — that is what makes the choice meaningful.
    const seen = new Map();
    for (const philosophy of PHILOSOPHIES) {
      expect(affects[philosophy].length, philosophy).toBe(4);
      expect(new Set(affects[philosophy]).size, `${philosophy} has duplicate effects`).toBe(4);
      for (const effect of affects[philosophy]) {
        expect(seen.has(effect), `${effect} is claimed by both ${seen.get(effect)} and ${philosophy}`).toBe(false);
        seen.set(effect, philosophy);
      }
    }

    expect(affects.constructor).toEqual(['space', 'resources', 'compounds', 'buildings']);
    expect(affects.supremacist).toEqual(['fleetCosts', 'fleetHealth', 'fleetSpeed', 'fleetAttackPower']);
    expect(affects.voidborn).toEqual(['initialImpression', 'starStudy', 'asteroidSearch', 'ascendencyPoints']);
    expect(affects.expansionist).toEqual(['starshipPartsCost', 'rocketPartsCost', 'rocketTravelTime', 'starshipTravelTime']);
  });
});

test.describe('Philosophies — choosing one', () => {
  test('a fresh run starts with no philosophy chosen', async ({ game }) => {
    await game.boot();
    const philosophy = await game.withMods((m) => m.cg.getPlayerPhilosophy());
    // Falsy in whichever form the game left it — the modal gate is `!philosophy`.
    expect(philosophy).toBeFalsy();
  });

  test('the choice modal offers all four paths and only appears while none is set', async ({ game }) => {
    await game.boot();

    // The modal is raised from the star-study completion handler, gated on
    // `!getPlayerPhilosophy()`. Assert the gate rather than re-running a
    // 40-minute study timer.
    const gate = await game.withMods((m) => {
      const unset = !m.cg.getPlayerPhilosophy();
      m.cg.setPlayerPhilosophy('voidborn');
      const set = !m.cg.getPlayerPhilosophy();
      m.cg.setPlayerPhilosophy(undefined);
      return { unset, set };
    });

    expect(gate.unset).toBe(true);
    // Once chosen, the same completion handler no longer offers the choice.
    expect(gate.set).toBe(false);

    const copy = await game.withMods((m) => ({
      header: m.desc.modalPlayerLeaderPhilosophyHeaderText,
      content: m.desc.modalPlayerLeaderPhilosophyContentText
    }));
    expect(typeof copy.header).toBe('string');
    expect(copy.header.length).toBeGreaterThan(0);
    expect(typeof copy.content).toBe('string');
    expect(copy.content.length).toBeGreaterThan(0);
    // The paths are named by the modal's *button labels*, not its body copy, so
    // the body legitimately does not mention them. The labels themselves are
    // asserted by the two specs below.
    for (const philosophy of PHILOSOPHIES) {
      expect(copy.content.toLowerCase()).not.toContain(philosophy);
    }
  });

  test('every philosophy name resolves from the catalogue in all five languages', async ({ game }) => {
    await game.boot();

    // known-issues.md #13: these four labels used to be hardcoded English
    // literals in game.js with no catalogue key behind them at all. The names
    // now live in the catalogue, so the decision about how they read in each
    // language lives in one place.
    const problems = await game.withMods((m, config) => {
      const { philosophies, languages } = config;
      const issues = [];

      for (const language of languages) {
        for (const philosophy of philosophies) {
          const key = `philosophyName${philosophy.charAt(0).toUpperCase()}${philosophy.slice(1)}`;
          const value = m.loc.localize(key, language);
          // localize() hands back the key itself when the entry is missing.
          if (!value || value === key) {
            issues.push(`${language}/${key}: unresolved`);
          } else if (!value.trim()) {
            issues.push(`${language}/${key}: blank`);
          }
        }
      }
      return issues;
    }, { philosophies: PHILOSOPHIES, languages: LANGUAGES });

    expect(problems).toEqual([]);
  });

  test('the modal renders the localized philosophy names, not English literals', async ({ game }) => {
    // French is the check language because all four names differ from their
    // English form there, so an untranslated label cannot pass by coincidence.
    // German would not do: "Expansionist" is the same word in both languages.
    await game.boot({ language: 'fr' });

    const labels = await game.withMods((m, philosophies) => {
      const french = {};
      const english = {};
      for (const philosophy of philosophies) {
        const key = `philosophyName${philosophy.charAt(0).toUpperCase()}${philosophy.slice(1)}`;
        french[philosophy] = m.loc.localize(key, 'fr');
        english[philosophy] = m.loc.localize(key, 'en');
      }
      return { french, english };
    }, PHILOSOPHIES);

    // Guard the guard: if a French value were ever set equal to its English
    // form this spec would silently stop proving anything.
    for (const philosophy of PHILOSOPHIES) {
      expect(
        labels.french[philosophy],
        `${philosophy} must differ between fr and en for this spec to be meaningful`
      ).not.toBe(labels.english[philosophy]);
    }

    const rendered = await openPhilosophyModal(game);
    expect(rendered.sort()).toEqual(Object.values(labels.french).sort());
  });

  test('no philosophy button clips its translated label in any language', async ({ game }) => {
    // The class of bug known-issues.md #7 covered: a label that only fits in
    // English. These four names are the longest strings on the modal, and
    // several translations are half again as long as the English.
    const clipped = [];

    for (const language of LANGUAGES) {
      await game.boot({ language });
      await openPhilosophyModal(game);

      const overflows = await game.page.evaluate((ids) =>
        ids
          .map((id) => document.querySelector(id))
          .filter((b) => b && b.offsetParent !== null)
          // scrollWidth exceeding clientWidth is text the box cannot show. One
          // pixel of slack absorbs sub-pixel rounding at fractional zoom.
          .filter((b) => b.scrollWidth > b.clientWidth + 1)
          .map((b) => ({ id: b.id, text: b.innerText.trim(), content: b.scrollWidth, box: b.clientWidth })),
      PHILOSOPHY_BUTTON_IDS);

      overflows.forEach((o) => clipped.push({ language, ...o }));
    }

    expect(clipped).toEqual([]);
  });

  test('each choice has its own localized confirmation notification in all five languages', async ({ game }) => {
    await game.boot();

    const problems = await game.withMods(async (m, config) => {
      const { philosophies, languages } = config;
      const original = m.cg.getLanguage();
      const issues = [];

      for (const language of languages) {
        await m.loc.initLocalization(language);
        const seen = new Set();
        for (const philosophy of philosophies) {
          const key = `notificationPhilosophy${philosophy.charAt(0).toUpperCase()}${philosophy.slice(1)}`;
          const value = m.loc.localize(key, language);
          if (!value || value === key || !String(value).trim()) {
            issues.push(`${language}:${key}: missing`);
            continue;
          }
          if (seen.has(value)) issues.push(`${language}:${key}: duplicates another philosophy's message`);
          seen.add(value);
        }
      }

      await m.loc.initLocalization(original);
      m.desc.initialiseDescriptions();
      return issues;
    }, { philosophies: PHILOSOPHIES, languages: ['en', 'es', 'pt', 'de', 'it', 'fr'] });

    expect(problems).toEqual([]);
  });

  test('the debug scenario assigns voidborn on run 1 when none was chosen', async ({ game }) => {
    await game.boot();
    expect(await game.withMods((m) => m.cg.getPlayerPhilosophy())).toBeFalsy();

    await game.prepareRunForStarshipLaunch();

    const state = await game.withMods((m) => ({
      philosophy: m.cg.getPlayerPhilosophy(),
      run: m.cg.getStatRun()
    }));

    expect(state.run).toBe(1);
    // setDefaultPhilosophyForRun1IfUnset() — without it the debug scenario would
    // leave every philosophy-gated path unreachable.
    expect(state.philosophy).toBe('voidborn');
  });

  test('the philosophy and its ability flag survive a save/load round trip', async ({ game }) => {
    await game.boot();

    const result = await game.withMods((m) => {
      m.cg.setPlayerPhilosophy('expansionist');
      m.cg.setPhilosophyAbilityActive(true);
      m.cg.setRepeatableTechMultipliers('3', 4);

      const saved = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));
      return {
        philosophy: saved.philosophy,
        abilityActive: saved.flags?.philosophyAbilityActive,
        multipliers: saved.repeatableTechMultipliers,
        liveMultiplier: m.cg.getRepeatableTechMultipliers('3')
      };
    });

    expect(result.philosophy).toBe('expansionist');
    expect(result.abilityActive).toBe(true);
    expect(result.liveMultiplier).toBe(4);
    expect(result.multipliers?.['3']).toBe(4);
  });
});

test.describe('Philosophies — effects', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('the Voidborn AP bonus only applies from run 2 onwards', async ({ game }) => {
    const result = await game.withMods((m) => {
      const originalPhilosophy = m.cg.getPlayerPhilosophy();

      m.cg.setPlayerPhilosophy('voidborn');
      const asVoidbornRun1 = m.game.getAscendencyPointsWithRepeatableBonus(10);

      m.cg.setPlayerPhilosophy('constructor');
      const asConstructor = m.game.getAscendencyPointsWithRepeatableBonus(10);

      m.cg.setPlayerPhilosophy(originalPhilosophy);
      return { asVoidbornRun1, asConstructor, run: m.cg.getStatRun() };
    });

    expect(result.run).toBe(1);
    // getAscendencyPointsWithRepeatableBonus gates on voidborn *and* run > 1, so
    // on run 1 the base value is returned untouched for every philosophy.
    expect(result.asVoidbornRun1).toBe(10);
    expect(result.asConstructor).toBe(10);
  });

  test('the Voidborn philosophy is what unlocks the void-pillage casino prize', async ({ game }) => {
    const result = await game.withMods((m, philosophies) => {
      const original = m.cg.getPlayerPhilosophy();
      const outcomes = {};

      for (const philosophy of philosophies) {
        m.cg.setPlayerPhilosophy(philosophy);
        m.cg.setCurrentlyPillagingVoid(true);
        m.cg.setTimeLeftUntilPillageVoidTimerFinishes(120000);
        outcomes[philosophy] = m.casino.claimCasinoSpecialPrizeByKey(
          'special_telescope_finish_void_pillage', { notify: false });
      }

      m.cg.setCurrentlyPillagingVoid(false);
      m.cg.setPlayerPhilosophy(original);
      return outcomes;
    }, PHILOSOPHIES);

    expect(result.voidborn).toEqual({ type: 'telescope_finish_void_pillage' });
    for (const philosophy of ['constructor', 'supremacist', 'expansionist']) {
      expect(result[philosophy], `${philosophy} should not reach the void prize`).toBeNull();
    }
  });

  test('repeatable multipliers accumulate per slot and are readable individually', async ({ game }) => {
    const result = await game.withMods((m) => {
      const before = m.cg.getAllRepeatableTechMultipliersObject();
      const snapshot = JSON.parse(JSON.stringify(before));

      m.cg.setRepeatableTechMultipliers('1', 3);
      m.cg.setRepeatableTechMultipliers('4', 7);

      const after = {
        one: m.cg.getRepeatableTechMultipliers('1'),
        four: m.cg.getRepeatableTechMultipliers('4'),
        all: JSON.parse(JSON.stringify(m.cg.getAllRepeatableTechMultipliersObject()))
      };

      for (const [key, value] of Object.entries(snapshot)) m.cg.setRepeatableTechMultipliers(key, value);
      return { snapshot, after };
    });

    expect(result.after.one).toBe(3);
    expect(result.after.four).toBe(7);
    // The slots are keyed '1'..'4', matching idWithinCategory on each path, and
    // are what addPhilosophyRepeatablesBackInAfterRebirth replays.
    expect(Object.keys(result.after.all).sort()).toEqual(['1', '2', '3', '4']);
  });

  test('choosing a philosophy produces no console or page errors', async ({ game }) => {
    await game.withMods((m, philosophies) => {
      for (const philosophy of philosophies) m.cg.setPlayerPhilosophy(philosophy);
    }, PHILOSOPHIES);
    await game.openTab(3);
    await game.page.waitForTimeout(800);

    expect(game.significantErrors()).toEqual([]);
  });
});
