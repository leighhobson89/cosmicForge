/**
 * Area: Compounds & Crafting — played through the Compounds tab
 * Plan: tests/docs/areas/compounds.md
 *
 * This file replaces the accessor-level specs that used to live here. Those
 * checked the data shape — that each compound had ingredients, a ratio and a
 * sale value — and called `sellCompound()` directly. Nothing ever pressed
 * **Create**, which is the only thing this tab is for.
 *
 * The reason crafting has to be tested through the DOM is that the *rendered
 * text is the contract*. The chain is:
 *
 *   dropdown option  -> setCreateCompoundPreview()      how many, and from what
 *                    -> setCompoundCreatePreview()      "5 Diesel (130 Hydrogen, 60 Carbon)"
 *                    -> the frame loop renders it into #createDieselDescription
 *                    -> getConstituentComponents()      parses that string back out
 *                    -> createCompound()                moves the quantities
 *
 * So the amount crafted and the resources spent are read back out of a localized
 * sentence. That is why a spec that calls `createCompound()` directly proves
 * almost nothing, and why crafting in German is a genuinely different test from
 * crafting in English: the ingredient *names* have to survive the round trip
 * through the catalogue and back.
 *
 * Autobuyers are deliberately not covered here — they belong to the autobuyers
 * area, which measures them as throughput.
 *
 * Shipped numbers this file relies on, asserted where they matter so a data
 * change reports itself rather than silently changing what is being tested:
 *
 *   diesel   26 hydrogen + 12 carbon per unit, cap 500,  sale 0.3
 *   water    20 hydrogen + 10 oxygen  per unit, cap 100,  sale 1.6
 *
 * ## Precipitation, and why every measurement here clears the weather first
 *
 * Compounds do not only arrive by being crafted. Each star system is generated
 * with a `precipitationType`, drawn by `calculatePrecipitationType()` from a
 * weighted table over the *compounds* — water is merely the most likely at 40%,
 * with diesel 30%, glass 19%, steel 7% and titanium 4% all real possibilities.
 * That compound then falls out of the sky, but only while `changeWeather()` has
 * the system on `rain`, and only at `getCurrentPrecipitationRate()`, which is
 * re-rolled to 1-4 per second when the rain starts and pinned to 0 the rest of
 * the time.
 *
 * So the drift these specs have to survive is not "water goes up". It is "one
 * unpredictable compound goes up, sometimes". Hard-coding water as the exception
 * is wrong twice over: it forgives drift in a compound that may not be raining
 * at all, and it holds the compound that *is* raining to an exact figure it
 * cannot meet.
 *
 * The fix is to stop guessing and turn the rain off. `clearWeather()` presses the
 * debug menu's own Sunny button — `forceClearWeather()`, which sets the rate to 0
 * and forces the system to sunny — and then asserts that it worked. Weather runs
 * for a minimum of 60 seconds once selected, so a measurement taken in the
 * seconds after that press cannot be rained on, and every craft, storage upgrade
 * and sale below is therefore asserted exactly, for every compound alike.
 *
 * The precipitation rules themselves are not swept under the carpet: the last
 * describe block drives them deliberately, forcing the weather round until it
 * rains and measuring what does and does not fill up.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const COMPOUNDS = ['diesel', 'glass', 'steel', 'concrete', 'water', 'titanium'];

/** Compounds whose storage upgrade costs only themselves — water is the exception. */
const SIMPLE_STORAGE = ['diesel', 'glass', 'steel', 'concrete', 'titanium'];

/**
 * Every compound `calculatePrecipitationType()` can pick, with its shipped weight.
 * Concrete is in the table at weight 0, so it is listed but can never be drawn.
 */
const PRECIPITATION_WEIGHTS = {
  titanium: 4, water: 40, glass: 19, diesel: 30, concrete: 0, steel: 7
};

const LANGUAGES = ['en', 'es', 'pt', 'de', 'it', 'fr'];

/** Every value the create dropdown offers, in the order it lists them. */
const CREATE_OPTIONS = [
  'fillToCapacity', 'max', 'threeQuarters', 'twoThirds', 'half', 'oneThird',
  '50000', '5000', '500', '50', '5', '1'
];

/**
 * Grant the techs that reveal compounds and put the grid up.
 *
 * `compounds` is the tech that makes the tab usable at all. Note that the debug
 * grant does **not** provide `compoundMachining`, the tech behind the auto-create
 * toggle: that one is not researchable, and comes only from the ascendency perk
 * — see `buyCompoundAutomation` below.
 */
async function prepareCraftingRun(game, { power = true } = {}) {
  await game.debugClick('grantAllTechsButton');
  await game.page.waitForTimeout(700);
  await game.withMods((m, powered) => {
    m.cg.setInfinitePower(powered);
    m.cg.setPowerOnOff(powered);
  }, power);
  // Nothing below wants weather in its measurements. The precipitation specs at
  // the foot of the file put the rain back deliberately.
  await clearWeather(game);
}

/**
 * What this star system rains, and whether it is raining right now.
 *
 * `precipitationType` is fixed when the system is generated; the weather on top
 * of it changes every one to three minutes. Both halves matter: a compound only
 * gains from the sky if it is *the* precipitation type **and** the current
 * weather is `rain`, and even then only at whatever rate the shower rolled.
 */
async function precipitationState(game) {
  return game.withMods((m) => {
    const system = m.cg.getCurrentStarSystem();
    return {
      system,
      type: m.rdo.getStarSystemDataObject('stars', [system, 'precipitationType']),
      category: m.rdo.getStarSystemDataObject('stars', [system, 'precipitationResourceCategory']),
      weather: m.cg.getCurrentStarSystemWeatherEfficiency()[2],
      rate: m.cg.getCurrentPrecipitationRate()
    };
  });
}

/**
 * Turn the rain off through the debug menu's own Sunny button.
 *
 * `#clearWeatherButton` calls `forceClearWeather()`, which zeroes the
 * precipitation rate and forces the weather to sunny. Nothing falls from the sky
 * afterwards, so a craft or a sale measured in the following seconds moves
 * exactly the amount it was asked to and no more — for whichever compound this
 * system happens to rain.
 *
 * This throws rather than warns if the weather did not clear: a spec that
 * silently carried on would be measuring drift it had promised to remove.
 */
async function clearWeather(game) {
  await game.debugClick('clearWeatherButton');
  await game.page.waitForTimeout(300);
  const state = await precipitationState(game);
  if (state.weather === 'rain' || state.rate !== 0) {
    throw new Error(`Weather did not clear: ${state.weather} at rate ${state.rate}`);
  }
  return state;
}

/**
 * Force the weather round until it rains, and wait for the shower to roll a rate.
 *
 * `forceWeatherCycle()` is the game's own re-roll — it is what the endlessSummer
 * event calls when it expires — and it picks from the star system's weighted
 * weather table, so rain comes up roughly one time in five. The rate is not set
 * by the cycle itself but by the first tick of the weather countdown a second
 * later, which is why this waits for a non-zero rate rather than returning as
 * soon as the weather reads `rain`.
 */
async function forceRain(game, { attempts = 60 } = {}) {
  for (let i = 0; i < attempts; i++) {
    const weather = await game.withMods((m) => {
      m.game.forceWeatherCycle();
      return m.cg.getCurrentStarSystemWeatherEfficiency()[2];
    });
    if (weather !== 'rain') continue;

    await game.page.waitForFunction(
      () => globalThis.__mods.cg.getCurrentPrecipitationRate() > 0,
      null, { timeout: 5000 }
    );
    return precipitationState(game);
  }
  throw new Error(`Weather never came up rain in ${attempts} cycles`);
}

/**
 * Buy the ascendency perk that unlocks compound automation.
 *
 * `compoundMachining` is **not** one of the researchable techs, so Grant All
 * Techs does not provide it — it comes only from the `compoundAutomation`
 * ascendency perk. `purchaseBuff` is the function the ascendency pane's own
 * buttons call, so this is the real purchase rather than a flag being set.
 */
async function buyCompoundAutomation(game) {
  await game.debugClick('add100ApButton');
  await game.page.waitForTimeout(300);
  await game.withMods((m) => m.game.purchaseBuff('compoundAutomation'));
  await game.page.waitForTimeout(400);

  // Run 1 celebrates the unlock with a modal, which would sit over the pane.
  await game.page.evaluate(() => {
    const confirm = document.getElementById('modalConfirm');
    const modal = document.getElementById('modal');
    if (confirm && modal && getComputedStyle(modal).display !== 'none') confirm.click();
  });
  await game.page.waitForTimeout(400);
}

/** Open a compound's pane by clicking its side-menu row. */
async function openCompound(game, compound) {
  await game.openTab(4);
  const opened = await game.page.evaluate((key) => {
    const option = document.getElementById(`${key}Option`);
    if (!option) return false;
    option.classList.remove('invisible');
    option.closest('.row-side-menu')?.classList.remove('invisible');
    option.closest('.collapsible')?.classList.remove('invisible');
    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, compound);
  if (!opened) throw new Error(`No side-menu row for ${compound}`);
  await game.page.waitForTimeout(800);

  const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());
  if (pane !== compound) throw new Error(`Expected the ${compound} pane, got ${pane}`);
}

/** Choose a value in one of the pane's dropdowns, through the dropdown itself. */
async function chooseDropdown(game, dropdownId, value) {
  const ok = await game.page.evaluate(({ id, option }) => {
    const container = document.getElementById(id);
    if (!container) return false;
    container.querySelector('div.dropdown')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const choice = container.querySelector(`div.dropdown-option[data-value="${option}"]`);
    if (!choice) return false;
    choice.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, { id: dropdownId, option: value });
  if (!ok) throw new Error(`Could not choose "${value}" in #${dropdownId}`);
  // The preview is regenerated by the frame loop, which is also what the Create
  // button ends up parsing.
  await game.page.waitForTimeout(600);
}

/** Press a button inside one of the pane's option rows. */
async function clickRowButton(game, rowId, selector = 'button') {
  const clicked = await game.page.evaluate(({ row, sel }) => {
    const button = document.getElementById(row)?.querySelector(sel);
    if (!button) return false;
    // Dispatched, because these controls carry `red-disabled-text`
    // (pointer-events: none) whenever the player cannot afford them, and a real
    // click would be swallowed by the CSS gate rather than reaching the handler.
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, { row: rowId, sel: selector });
  if (!clicked) throw new Error(`No ${selector} inside #${rowId}`);
  await game.page.waitForTimeout(600);
}

/** Stock ingredients and clear the compound, so a craft is the only thing moving. */
async function stageIngredients(game, compound, { each = 100000, compoundQuantity = 0, capacity = null } = {}) {
  return game.withMods((m, config) => {
    const parts = [1, 2, 3, 4]
      .map((i) => m.rdo.getResourceDataObject('compounds', [config.compound, `createsFrom${i}`]))
      .filter((entry) => Array.isArray(entry) && entry[0]);

    for (const [name, category] of parts) {
      m.rdo.setResourceDataObject(1e9, category, [name, 'storageCapacity']);
      m.rdo.setResourceDataObject(config.each, category, [name, 'quantity']);
      m.rdo.setResourceDataObject(false, category, [name, 'autoSell']);
    }

    if (config.capacity !== null) {
      m.rdo.setResourceDataObject(config.capacity, 'compounds', [config.compound, 'storageCapacity']);
    }
    m.rdo.setResourceDataObject(config.compoundQuantity, 'compounds', [config.compound, 'quantity']);
    m.rdo.setResourceDataObject(false, 'compounds', [config.compound, 'autoCreate']);
    // Autobuyers belong to another area; silence them so a craft is measurable.
    for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
      m.rdo.setResourceDataObject(0, 'compounds', [config.compound, 'upgrades', 'autoBuyer', tier, 'quantity']);
    }

    return parts.map(([name, category], index) => ({
      name,
      category,
      ratio: m.rdo.getResourceDataObject('compounds', [config.compound, `createsFromRatio${index + 1}`])
    }));
  }, { compound, each, compoundQuantity, capacity });
}

/** Compound quantity, capacity, cash, both previews and every ingredient level. */
async function readCraftState(game, compound) {
  return game.withMods((m, key) => {
    const parts = [1, 2, 3, 4]
      .map((i) => m.rdo.getResourceDataObject('compounds', [key, `createsFrom${i}`]))
      .filter((entry) => Array.isArray(entry) && entry[0]);

    return {
      quantity: m.rdo.getResourceDataObject('compounds', [key, 'quantity']),
      capacity: m.rdo.getResourceDataObject('compounds', [key, 'storageCapacity']),
      cash: m.rdo.getResourceDataObject('currency', ['cash']),
      createPreview: m.cg.getCompoundCreatePreview(key),
      salePreview: m.cg.getCompoundSalePreview(key),
      ingredients: Object.fromEntries(
        parts.map(([name, category]) => [name, m.rdo.getResourceDataObject(category, [name, 'quantity'])])
      )
    };
  }, compound);
}

test.describe('Compounds — creating from the dropdown', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareCraftingRun(game);
  });

  test('the shipped diesel recipe is 26 hydrogen and 12 carbon per unit', async ({ game }) => {
    const recipe = await stageIngredients(game, 'diesel');
    expect(recipe).toEqual([
      { name: 'hydrogen', category: 'resources', ratio: 26 },
      { name: 'carbon', category: 'resources', ratio: 12 }
    ]);
  });

  test('each fixed quantity in the dropdown crafts that many and charges the exact ratio', async ({ game }) => {
    await openCompound(game, 'diesel');

    const outcomes = [];
    for (const option of ['1', '5', '50', '500']) {
      await stageIngredients(game, 'diesel', { each: 100000, capacity: 1e6 });
      await chooseDropdown(game, 'dieselCreateSelectQuantity', option);

      const before = await readCraftState(game, 'diesel');
      await clickRowButton(game, 'dieselCreateRow', 'button.create');
      const after = await readCraftState(game, 'diesel');

      outcomes.push({
        option,
        made: after.quantity - before.quantity,
        hydrogen: before.ingredients.hydrogen - after.ingredients.hydrogen,
        carbon: before.ingredients.carbon - after.ingredients.carbon
      });
    }

    expect(outcomes).toEqual([
      { option: '1', made: 1, hydrogen: 26, carbon: 12 },
      { option: '5', made: 5, hydrogen: 130, carbon: 60 },
      { option: '50', made: 50, hydrogen: 1300, carbon: 600 },
      { option: '500', made: 500, hydrogen: 13000, carbon: 6000 }
    ]);
  });

  test('the preview is the contract: what it says is exactly what the button does', async ({ game }) => {
    await openCompound(game, 'diesel');
    await stageIngredients(game, 'diesel', { each: 100000, capacity: 1e6 });
    await chooseDropdown(game, 'dieselCreateSelectQuantity', '50');

    const before = await readCraftState(game, 'diesel');
    // "50 Diesel (1300 Hydrogen, 600 Carbon)" — the string the Create button
    // parses back out to decide what to move.
    expect(before.createPreview).toMatch(/^50 \w+ \(1300 \w+, 600 \w+\)$/);

    await clickRowButton(game, 'dieselCreateRow', 'button.create');
    const after = await readCraftState(game, 'diesel');

    expect(after.quantity - before.quantity).toBe(50);
    expect(before.ingredients.hydrogen - after.ingredients.hydrogen).toBe(1300);
    expect(before.ingredients.carbon - after.ingredients.carbon).toBe(600);
  });

  test('“max” crafts everything the ingredients allow and no more', async ({ game }) => {
    await openCompound(game, 'diesel');
    // 260 hydrogen and 240 carbon: hydrogen allows 10, carbon allows 20, so the
    // scarcer ingredient has to be the one that decides.
    await stageIngredients(game, 'diesel', { each: 0, capacity: 1e6 });
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(260, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(240, 'resources', ['carbon', 'quantity']);
    });
    await chooseDropdown(game, 'dieselCreateSelectQuantity', 'max');

    const before = await readCraftState(game, 'diesel');
    await clickRowButton(game, 'dieselCreateRow', 'button.create');
    const after = await readCraftState(game, 'diesel');

    expect(after.quantity - before.quantity).toBe(10);
    expect(after.ingredients.hydrogen).toBe(0);
    // Carbon is left over, because hydrogen ran out first.
    expect(after.ingredients.carbon).toBe(120);
  });

  test('“fill to capacity” stops at the storage cap rather than overfilling it', async ({ game }) => {
    await openCompound(game, 'diesel');
    // Ingredients for far more than the store can hold.
    await stageIngredients(game, 'diesel', { each: 1000000, capacity: 500, compoundQuantity: 200 });
    await chooseDropdown(game, 'dieselCreateSelectQuantity', 'fillToCapacity');

    const before = await readCraftState(game, 'diesel');
    await clickRowButton(game, 'dieselCreateRow', 'button.create');
    const after = await readCraftState(game, 'diesel');

    // 300 of headroom, so exactly 300 are made and the store ends full.
    expect(after.quantity).toBe(500);
    expect(after.quantity - before.quantity).toBe(300);
    expect(before.ingredients.hydrogen - after.ingredients.hydrogen).toBe(300 * 26);
  });

  test('crafting past the cap is clamped and the waste is called out', async ({ game }) => {
    await openCompound(game, 'diesel');
    await stageIngredients(game, 'diesel', { each: 1000000, capacity: 500, compoundQuantity: 400 });
    // 500 asked for, only 100 will fit.
    await chooseDropdown(game, 'dieselCreateSelectQuantity', '500');

    await clickRowButton(game, 'dieselCreateRow', 'button.create');
    const after = await readCraftState(game, 'diesel');

    expect(after.quantity).toBe(500);

    // The player is told, because they were charged for 500 and kept 100.
    const notifications = await game.notifications('create');
    expect(notifications.length).toBeGreaterThan(0);
  });

  test('crafting with too few ingredients makes nothing and takes nothing', async ({ game }) => {
    await openCompound(game, 'diesel');
    await stageIngredients(game, 'diesel', { each: 0, capacity: 1e6 });
    await game.withMods((m) => {
      // Not even one unit's worth: a unit needs 26 hydrogen and 12 carbon.
      m.rdo.setResourceDataObject(10, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(5, 'resources', ['carbon', 'quantity']);
    });
    await chooseDropdown(game, 'dieselCreateSelectQuantity', '5');

    const before = await readCraftState(game, 'diesel');
    await clickRowButton(game, 'dieselCreateRow', 'button.create');
    const after = await readCraftState(game, 'diesel');

    expect(after.quantity).toBe(before.quantity);
    expect(after.ingredients).toEqual(before.ingredients);
    expect(Number.isNaN(after.quantity)).toBe(false);
  });

  test('every compound can be crafted through its own pane', async ({ game }) => {
    const failures = [];

    for (const compound of COMPOUNDS) {
      await openCompound(game, compound);
      await stageIngredients(game, compound, { each: 1000000, capacity: 1e6 });
      await chooseDropdown(game, `${compound}CreateSelectQuantity`, '5');

      // Six compounds take a while to walk, and the weather re-rolls on its own
      // every one to three minutes, so clear it again for each measurement
      // rather than relying on the clear that `prepareCraftingRun` did. Whatever
      // this system rains, the only thing moving now is the Create button.
      await clearWeather(game);

      const before = await readCraftState(game, compound);
      await clickRowButton(game, `${compound}CreateRow`, 'button.create');
      const after = await readCraftState(game, compound);

      const made = after.quantity - before.quantity;
      if (made !== 5) failures.push(`${compound}: made ${made}`);

      for (const [name, level] of Object.entries(after.ingredients)) {
        const spent = before.ingredients[name] - level;
        if (!(spent > 0)) failures.push(`${compound}: ${name} was not charged`);
      }
    }

    expect(failures).toEqual([]);
  });
});

test.describe('Compounds — the create dropdown is localized', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareCraftingRun(game);
  });

  test('every phrase the create dropdown is built from resolves in all six languages', async ({ game }) => {
    // The dropdown text is assembled from two families of catalogue keys: the
    // proportional options, and the short material names that spell each recipe
    // out. Either one going missing leaves a raw key on screen.
    const problems = await game.withMods(async (m, config) => {
      const { languages, phraseKeys, materialKeys } = config;
      const original = m.cg.getLanguage();
      const issues = [];

      for (const language of languages) {
        await m.loc.initLocalization(language);
        for (const key of [...phraseKeys, ...materialKeys]) {
          const value = m.loc.localize(key, language);
          if (!value || value === key) issues.push(`${language}/${key}: unresolved`);
        }
      }

      await m.loc.initLocalization(original);
      return issues;
    }, {
      languages: LANGUAGES,
      phraseKeys: [
        'compoundCreateFillToCapacity', 'compoundCreateMaxPossible', 'compoundCreateUpTo75',
        'compoundCreateUpTo67', 'compoundCreateUpTo50', 'compoundCreateUpTo33'
      ],
      materialKeys: [
        'resourceShortHydrogen', 'resourceShortCarbon', 'resourceShortSilicon', 'resourceShortOxygen',
        'resourceShortSodium', 'resourceShortIron', 'resourceShortNeon'
      ]
    });

    expect(problems).toEqual([]);
  });

  test('every compound offers the full set of create options, each with text', async ({ game }) => {
    const problems = await game.withMods((m, config) => {
      const { compounds, options } = config;
      const issues = [];

      for (const compound of compounds) {
        const table = m.cg.getCompoundCreateDropdownRecipeText(compound);
        if (!table) { issues.push(`${compound}: no recipe table`); continue; }

        for (const option of options) {
          const text = table[option]?.text;
          if (!text || typeof text !== 'string' || !text.trim()) {
            issues.push(`${compound}/${option}: missing`);
          } else if (/^compoundCreate[A-Za-z0-9]*$/.test(text.trim()) || /resourceShort[A-Z]/.test(text)) {
            issues.push(`${compound}/${option}: unresolved "${text}"`);
          }
        }
      }
      return issues;
    }, { compounds: COMPOUNDS, options: CREATE_OPTIONS });

    expect(problems).toEqual([]);
  });

  test('switching language relabels the create dropdown on screen', async ({ game }) => {
    await openCompound(game, 'diesel');

    const english = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#dieselCreateSelectQuantity div.dropdown-option'))
        .map((option) => (option.textContent || '').trim()));
    expect(english.length).toBe(12);

    // The real language-change path, the one the Settings dropdown calls.
    await game.withMods(async (m) => { await m.ui.relocalizeAll('de'); });
    await game.page.waitForTimeout(1200);
    await openCompound(game, 'diesel');

    const german = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#dieselCreateSelectQuantity div.dropdown-option'))
        .map((option) => (option.textContent || '').trim()));

    expect(await game.withMods((m) => m.cg.getLanguage())).toBe('de');
    expect(german.length).toBe(12);
    // A player who switches language must not be left reading the recipe list in
    // the language they just left.
    expect(german).not.toEqual(english);
  });

  test('the dropdown on screen renders one option per recipe entry, all with text', async ({ game }) => {
    await openCompound(game, 'diesel');

    const rendered = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#dieselCreateSelectQuantity div.dropdown-option'))
        .map((option) => ({
          value: option.getAttribute('data-value'),
          text: (option.textContent || '').trim()
        })));

    expect(rendered.map((option) => option.value)).toEqual(CREATE_OPTIONS);
    expect(rendered.filter((option) => option.text.length === 0)).toEqual([]);
    // The quantity options spell the recipe out — "5 - 130 H, 60 C" — which is
    // the only place a player sees what a craft will cost before committing.
    const five = rendered.find((option) => option.value === '5');
    expect(five.text).toMatch(/130/);
    expect(five.text).toMatch(/60/);
  });

  test('crafting in another language still charges the right resources', async ({ game }) => {
    // The ingredient names are read back out of a localized sentence, so this is
    // a genuinely different path from the English one — a name that fails to
    // reverse-resolve would silently charge nothing, or the wrong resource.
    await game.withMods(async (m) => { await m.ui.relocalizeAll('de'); });
    await game.page.waitForTimeout(1200);

    await openCompound(game, 'diesel');
    await stageIngredients(game, 'diesel', { each: 100000, capacity: 1e6 });
    await chooseDropdown(game, 'dieselCreateSelectQuantity', '5');

    const before = await readCraftState(game, 'diesel');
    await clickRowButton(game, 'dieselCreateRow', 'button.create');
    const after = await readCraftState(game, 'diesel');

    expect(after.quantity - before.quantity).toBe(5);
    expect(before.ingredients.hydrogen - after.ingredients.hydrogen).toBe(130);
    expect(before.ingredients.carbon - after.ingredients.carbon).toBe(60);
  });

  test('the Create button crafts diesel and deducts its ingredients in every supported language', async ({ game }) => {
    // The Create handler parses the localized preview back into canonical
    // resource keys.  Keep the supported-language list in the game rather than
    // duplicating a (historically stale) "six languages" test constant here.
    const languages = await game.withMods((m) => m.loc.getSupportedLanguages());
    expect(languages, 'the game must expose at least one supported language').not.toEqual([]);

    const outcomes = [];
    for (const language of languages) {
      // This is the same real redraw path the Settings language dropdown uses.
      await game.withMods(async (m, lang) => { await m.ui.relocalizeAll(lang); }, language);
      await game.page.waitForTimeout(900);

      // Reset every moving input for this language. In particular, no rain,
      // auto-create or autobuyer may make a successful click look successful.
      await clearWeather(game);
      await openCompound(game, 'diesel');
      await stageIngredients(game, 'diesel', { each: 100000, capacity: 1e6, compoundQuantity: 0 });
      await chooseDropdown(game, 'dieselCreateSelectQuantity', '5');

      const before = await readCraftState(game, 'diesel');
      await clickRowButton(game, 'dieselCreateRow', 'button.create');
      const after = await readCraftState(game, 'diesel');

      outcomes.push({
        language,
        dieselMade: after.quantity - before.quantity,
        hydrogenSpent: before.ingredients.hydrogen - after.ingredients.hydrogen,
        carbonSpent: before.ingredients.carbon - after.ingredients.carbon,
        cashChanged: after.cash - before.cash
      });
    }

    expect(outcomes).toEqual(languages.map((language) => ({
      language,
      dieselMade: 5,
      hydrogenSpent: 130,
      carbonSpent: 60,
      // Crafting must not be accidentally satisfied by a sale or another
      // economy action while the localized preview is being exercised.
      cashChanged: 0
    })));
  });
});

test.describe('Compounds — automatic creation behind the perk', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('the auto-create toggle is hidden until compoundMachining is unlocked', async ({ game }) => {
    await game.withMods((m) => {
      m.cg.setPowerOnOff(true);
      m.rdo.setResourceDataObject(true, 'compounds', ['diesel', 'revealedYet']);
      m.cg.setUnlockedCompoundsArray('diesel');
      m.cg.setTechUnlockedArray('compounds');
    });
    await openCompound(game, 'diesel');

    // The frame loop is what hides the row, so wait for the state rather than
    // guessing how many frames that takes.
    await game.page.waitForFunction(
      () => document.getElementById('autoCreateToggle')?.parentElement.classList.contains('invisible') === true,
      null, { timeout: 15000 }
    );

    // Grant All Techs is deliberately included here and must *not* be enough:
    // compoundMachining is not a researchable tech.
    await prepareCraftingRun(game);
    await game.page.waitForTimeout(1000);
    expect(
      await game.withMods((m) => m.cg.getTechUnlockedArray().includes('compoundMachining')),
      'every tech researched, and still no compoundMachining'
    ).toBe(false);
    expect(await game.page.evaluate(
      () => document.getElementById('autoCreateToggle')?.parentElement.classList.contains('invisible')
    )).toBe(true);

    // The ascendency perk is the only thing that unlocks it.
    await buyCompoundAutomation(game);
    await openCompound(game, 'diesel');

    expect(await game.withMods((m) => m.cg.getTechUnlockedArray().includes('compoundMachining'))).toBe(true);
    await game.page.waitForFunction(
      () => document.getElementById('autoCreateToggle')?.parentElement.classList.contains('invisible') === false,
      null, { timeout: 15000 }
    );
  });

  test('switching auto-create on crafts continuously and consumes the ingredients', async ({ game }) => {
    await prepareCraftingRun(game);
    await buyCompoundAutomation(game);
    await openCompound(game, 'diesel');
    await stageIngredients(game, 'diesel', { each: 1000000, capacity: 1e6 });

    // Ingredients need to be arriving for auto-create to have anything to work
    // with: its rate is the slowest ingredient's gross production per interval
    // divided by that ingredient's ratio.
    await game.withMods((m) => {
      for (const resource of ['hydrogen', 'carbon']) {
        m.rdo.setResourceDataObject(true, 'resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'active']);
        m.rdo.setResourceDataObject(50, 'resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      }
    });

    const idle = await readCraftState(game, 'diesel');
    await game.page.waitForTimeout(2000);
    const stillIdle = await readCraftState(game, 'diesel');
    expect(stillIdle.quantity, 'nothing is crafted while the toggle is off').toBe(idle.quantity);

    await game.page.locator('label[for="autoCreateToggle"]').click();
    await game.page.waitForTimeout(500);
    expect(await game.withMods((m) => m.rdo.getResourceDataObject('compounds', ['diesel', 'autoCreate']))).toBe(true);

    const before = await readCraftState(game, 'diesel');
    await game.page.waitForTimeout(3000);
    const after = await readCraftState(game, 'diesel');

    expect(after.quantity, 'diesel appears with nobody pressing Create').toBeGreaterThan(before.quantity);
    // And it is manufactured, not conjured: the ingredients are drawn down.
    const made = after.quantity - before.quantity;
    expect(made).toBeGreaterThan(0);
    expect(after.ingredients.hydrogen).toBeLessThan(before.ingredients.hydrogen + made * 26);
  });

  test('auto-create needs the grid, and stops at the storage cap', async ({ game }) => {
    await prepareCraftingRun(game);
    await buyCompoundAutomation(game);
    await openCompound(game, 'diesel');
    await stageIngredients(game, 'diesel', { each: 1000000, capacity: 1e6 });

    await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'compounds', ['diesel', 'autoCreate']);
      for (const resource of ['hydrogen', 'carbon']) {
        m.rdo.setResourceDataObject(true, 'resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'active']);
        m.rdo.setResourceDataObject(50, 'resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      }
    });

    // With the grid down, `calculateCompoundAutoCreateRatePerInterval` returns 0
    // before it looks at anything else.
    await game.withMods((m) => {
      m.cg.setInfinitePower(false);
      m.cg.setPowerOnOff(false);
    });
    await game.page.waitForTimeout(800);

    const unpoweredStart = await readCraftState(game, 'diesel');
    await game.page.waitForTimeout(2500);
    const unpoweredEnd = await readCraftState(game, 'diesel');
    expect(unpoweredEnd.quantity).toBe(unpoweredStart.quantity);

    // At capacity it also stops, even with the grid up and ingredients to spare.
    await game.withMods((m) => {
      m.cg.setInfinitePower(true);
      m.cg.setPowerOnOff(true);
      m.rdo.setResourceDataObject(500, 'compounds', ['diesel', 'storageCapacity']);
      m.rdo.setResourceDataObject(500, 'compounds', ['diesel', 'quantity']);
    });
    await game.page.waitForTimeout(2500);

    const full = await readCraftState(game, 'diesel');
    expect(full.quantity).toBe(500);
  });

  test('auto-create switches off auto-sell on the resources it eats', async ({ game }) => {
    await prepareCraftingRun(game);
    await buyCompoundAutomation(game);
    await openCompound(game, 'diesel');
    await stageIngredients(game, 'diesel', { each: 1000000, capacity: 1e6 });

    // Selling the ingredients out from under an auto-crafter would deadlock the
    // pipeline, so enabling one has to switch the other off.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'autoSell']);
      m.rdo.setResourceDataObject(true, 'resources', ['carbon', 'autoSell']);
      m.rdo.setResourceDataObject(true, 'compounds', ['diesel', 'autoCreate']);
    });

    await game.page.waitForTimeout(1500);

    const autoSell = await game.withMods((m) => ({
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'autoSell']),
      carbon: m.rdo.getResourceDataObject('resources', ['carbon', 'autoSell'])
    }));
    expect(autoSell).toEqual({ hydrogen: false, carbon: false });
  });
});

test.describe('Compounds — storage, including the water reservoir', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareCraftingRun(game);
  });

  test('Increase Storage doubles the cap and charges the old cap for every simple compound', async ({ game }) => {
    const failures = [];

    for (const compound of SIMPLE_STORAGE) {
      await openCompound(game, compound);
      // Four of these five can be the star system's precipitation type, and the
      // weather re-rolls on its own part-way through a five-compound walk.
      await clearWeather(game);

      const before = await game.withMods((m, key) => {
        const capacity = m.rdo.getResourceDataObject('compounds', [key, 'storageCapacity']);
        m.rdo.setResourceDataObject(capacity, 'compounds', [key, 'quantity']);
        m.rdo.setResourceDataObject(false, 'compounds', [key, 'autoCreate']);
        return capacity;
      }, compound);

      await clickRowButton(game, `${compound}IncreaseStorageRow`);
      await game.page.waitForTimeout(600);

      const after = await readCraftState(game, compound);
      if (after.capacity !== before * 2) {
        failures.push(`${compound}: capacity ${before} -> ${after.capacity}, expected ${before * 2}`);
      }
      // The charge is the cap that was outgrown, less one — the game leaves a
      // single unit behind on purpose.
      if (after.quantity !== 1) {
        failures.push(`${compound}: ${after.quantity} left, expected 1`);
      }
    }

    expect(failures).toEqual([]);
  });

  test('the water reservoir charges water and concrete together', async ({ game }) => {
    await openCompound(game, 'water');

    const before = await game.withMods((m) => {
      const capacity = m.rdo.getResourceDataObject('compounds', ['water', 'storageCapacity']);
      m.rdo.setResourceDataObject(capacity, 'compounds', ['water', 'quantity']);
      m.rdo.setResourceDataObject(1e6, 'compounds', ['concrete', 'storageCapacity']);
      m.rdo.setResourceDataObject(1000, 'compounds', ['concrete', 'quantity']);
      m.rdo.setResourceDataObject(false, 'compounds', ['water', 'autoCreate']);
      m.rdo.setResourceDataObject(false, 'compounds', ['concrete', 'autoCreate']);
      return { capacity, water: capacity, concrete: 1000 };
    });
    expect(before.capacity).toBe(100);

    await clickRowButton(game, 'waterIncreaseStorageRow');
    await game.page.waitForTimeout(700);

    const after = await game.withMods((m) => ({
      capacity: m.rdo.getResourceDataObject('compounds', ['water', 'storageCapacity']),
      water: m.rdo.getResourceDataObject('compounds', ['water', 'quantity']),
      concrete: m.rdo.getResourceDataObject('compounds', ['concrete', 'quantity']),
      nextConcretePrice: m.rdo.getResourceDataObject('compounds', ['concrete', 'currentSecondaryIncreasePrice'])
    }));

    expect(after.capacity).toBe(200);
    // Water pays the old cap less one, exactly as the simple compounds do. This
    // is an exact figure because the weather is clear: if this star system rains
    // water, `clearWeather()` has already stopped it falling.
    expect(before.water - after.water).toBe(99);
    // …and concrete pays 30% of that same old cap on top. This is the only
    // storage upgrade in the game that bills a second material.
    expect(before.concrete - after.concrete).toBeCloseTo(30, 6);
    // The next reservoir is quoted against the *new* cap, so it scales with it.
    expect(after.nextConcretePrice).toBeCloseTo(60, 6);
  });

  test('a second reservoir costs the new, larger amounts of both materials', async ({ game }) => {
    await openCompound(game, 'water');

    await game.withMods((m) => {
      m.rdo.setResourceDataObject(100, 'compounds', ['water', 'storageCapacity']);
      m.rdo.setResourceDataObject(100, 'compounds', ['water', 'quantity']);
      m.rdo.setResourceDataObject(1e6, 'compounds', ['concrete', 'storageCapacity']);
      m.rdo.setResourceDataObject(10000, 'compounds', ['concrete', 'quantity']);
      m.rdo.setResourceDataObject(false, 'compounds', ['water', 'autoCreate']);
      m.rdo.setResourceDataObject(false, 'compounds', ['concrete', 'autoCreate']);
    });

    await clickRowButton(game, 'waterIncreaseStorageRow');
    await game.page.waitForTimeout(700);

    // Refill to the new cap and enlarge again.
    const midpoint = await game.withMods((m) => {
      m.rdo.setResourceDataObject(200, 'compounds', ['water', 'quantity']);
      return {
        capacity: m.rdo.getResourceDataObject('compounds', ['water', 'storageCapacity']),
        concrete: m.rdo.getResourceDataObject('compounds', ['concrete', 'quantity'])
      };
    });
    expect(midpoint.capacity).toBe(200);

    await clickRowButton(game, 'waterIncreaseStorageRow');
    await game.page.waitForTimeout(700);

    const after = await game.withMods((m) => ({
      capacity: m.rdo.getResourceDataObject('compounds', ['water', 'storageCapacity']),
      water: m.rdo.getResourceDataObject('compounds', ['water', 'quantity']),
      concrete: m.rdo.getResourceDataObject('compounds', ['concrete', 'quantity'])
    }));

    expect(after.capacity).toBe(400);
    // One unit is left behind, exactly as for the simple compounds — the reservoir
    // is not refilling itself, because the weather was cleared before the run.
    expect(after.water).toBe(1);
    // 30% of 200, not of the original 100.
    expect(midpoint.concrete - after.concrete).toBeCloseTo(60, 6);
  });

  test('filling a compound to its cap raises a storage-full notification', async ({ game }) => {
    await openCompound(game, 'diesel');
    await stageIngredients(game, 'diesel', { each: 1000000, capacity: 500, compoundQuantity: 0 });

    await game.withMods((m) => {
      // A tier 1 autobuyer is the simplest way to have the frame loop walk the
      // quantity up to the cap, which is what the notification watches for.
      m.rdo.setResourceDataObject(490, 'compounds', ['diesel', 'quantity']);
      m.rdo.setResourceDataObject(true, 'compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(20, 'compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
    });

    const action = game.page.locator('.notification-container.classification-storage button.notification-action-button');
    await action.waitFor({ state: 'visible', timeout: 30000 });

    const messages = await game.notifications('storage');
    expect(messages.join(' ')).toMatch(/diesel/i);

    const atCap = await readCraftState(game, 'diesel');
    expect(atCap.quantity).toBe(500);
  });
});

test.describe('Compounds — selling', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareCraftingRun(game);
  });

  test('the Sell button sells exactly the previewed amount and pays for it', async ({ game }) => {
    await openCompound(game, 'diesel');
    await stageIngredients(game, 'diesel', { each: 0, capacity: 1e6, compoundQuantity: 137 });
    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'currency', ['cash']));

    await chooseDropdown(game, 'dieselSellSelectQuantity', '100');

    const before = await readCraftState(game, 'diesel');
    expect(before.salePreview).toContain('(100 ');

    await clickRowButton(game, 'dieselSellRow', 'button.sell');

    const after = await readCraftState(game, 'diesel');
    const saleValue = await game.withMods((m) => m.rdo.getResourceDataObject('compounds', ['diesel', 'saleValue']));

    expect(after.quantity).toBe(37);
    expect(after.cash).toBeCloseTo(100 * saleValue, 6);
  });

  test('the quantity selector decides how much the Sell button sells', async ({ game }) => {
    await openCompound(game, 'diesel');

    const cases = [
      { option: 'all', expected: 120 },
      { option: 'threeQuarters', expected: 90 },
      { option: 'twoThirds', expected: 80 },
      { option: 'half', expected: 60 },
      { option: 'oneThird', expected: 40 },
      { option: '100', expected: 100 },
      { option: '10', expected: 10 },
      { option: '1', expected: 1 }
    ];

    const sold = [];
    for (const { option, expected } of cases) {
      await stageIngredients(game, 'diesel', { each: 0, capacity: 1e6, compoundQuantity: 120 });
      await chooseDropdown(game, 'dieselSellSelectQuantity', option);
      await clickRowButton(game, 'dieselSellRow', 'button.sell');
      const after = await readCraftState(game, 'diesel');
      sold.push({ option, sold: 120 - after.quantity, expected });
    }

    expect(sold.filter((entry) => entry.sold !== entry.expected)).toEqual([]);
  });

  test('Sell All empties every unlocked compound and then disables itself', async ({ game }) => {
    await game.debugClick('give100AllResourcesAndCompounds');
    await game.page.waitForTimeout(800);
    // The control lives in the Compounds tab header, so the tab has to be open.
    await game.openTab(4);
    await game.page.waitForTimeout(400);

    // Freeze production so the total banked is exactly the total snapshotted.
    // That includes the sky: `give100AllResourcesAndCompounds` fills the store
    // this system rains, and rain would put some of it straight back.
    await clearWeather(game);
    await game.withMods((m, compounds) => {
      m.rdo.setResourceDataObject(0, 'currency', ['cash']);
      for (const compound of compounds) {
        m.rdo.setResourceDataObject(false, 'compounds', [compound, 'autoCreate']);
        for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
          m.rdo.setResourceDataObject(0, 'compounds', [compound, 'upgrades', 'autoBuyer', tier, 'quantity']);
        }
      }
    }, COMPOUNDS);
    await game.page.waitForTimeout(400);

    const expectedCash = await game.withMods((m) => {
      const unlocked = new Set((m.cg.getUnlockedCompoundsArray() || []).map((v) => String(v).toLowerCase()));
      const compounds = m.rdo.getResourceDataObject('compounds') || {};
      return Object.keys(compounds)
        .filter((key) => unlocked.has(key.toLowerCase()))
        .reduce((sum, key) => {
          const quantity = Number(m.rdo.getResourceDataObject('compounds', [key, 'quantity'])) || 0;
          const saleValue = Number(m.rdo.getResourceDataObject('compounds', [key, 'saleValue'])) || 0;
          return sum + quantity * saleValue;
        }, 0);
    });
    expect(expectedCash).toBeGreaterThan(0);

    const sellAll = game.page.locator('#sellAllCompoundsButton');
    await expect(sellAll).toBeEnabled();
    await sellAll.click();
    await game.page.waitForTimeout(800);

    const outcome = await game.withMods((m) => {
      const unlocked = new Set((m.cg.getUnlockedCompoundsArray() || []).map((v) => String(v).toLowerCase()));
      const compounds = m.rdo.getResourceDataObject('compounds') || {};
      return {
        cash: m.rdo.getResourceDataObject('currency', ['cash']),
        leftover: Object.keys(compounds)
          .filter((key) => unlocked.has(key.toLowerCase()))
          .map((key) => ({ key, quantity: m.rdo.getResourceDataObject('compounds', [key, 'quantity']) }))
          .filter((entry) => entry.quantity !== 0)
      };
    });

    // Every unlocked compound is emptied, with no exception for whichever one
    // this star system rains: the weather was cleared before the snapshot, so
    // nothing is trickling back in behind the sale.
    expect(outcome.leftover).toEqual([]);
    expect(outcome.cash).toBeCloseTo(expectedCash, 4);

    // Sell All disables itself once there is nothing left worth selling.
    await game.page.waitForFunction(
      () => document.getElementById('sellAllCompoundsButton')?.disabled === true,
      null, { timeout: 15000 }
    );
  });

  test('every compound name is localized in all six languages', async ({ game }) => {
    const problems = await game.withMods(async (m, config) => {
      const { compounds, languages } = config;
      const original = m.cg.getLanguage();
      const issues = [];

      for (const language of languages) {
        await m.loc.initLocalization(language);
        for (const compound of compounds) {
          const token = `compound${compound.charAt(0).toUpperCase()}${compound.slice(1)}`;
          const value = m.loc.localize(token, language);
          if (!value || value === token) issues.push(`${language}/${compound}: unresolved`);
        }
      }

      await m.loc.initLocalization(original);
      return issues;
    }, { compounds: COMPOUNDS, languages: LANGUAGES });

    expect(problems).toEqual([]);
  });

  test('driving every compound pane raises no console or page errors', async ({ game }) => {
    await game.debugClick('give100AllResourcesAndCompounds');
    await game.page.waitForTimeout(600);

    for (const compound of COMPOUNDS) {
      await openCompound(game, compound);
    }

    expect(game.significantErrors()).toEqual([]);
  });
});

test.describe('Compounds — precipitation', () => {
  test.setTimeout(240000);

  /**
   * Silence every other source of compounds, so the only thing that can move a
   * quantity is the sky. Autobuyers and auto-create both write into the same
   * field precipitation does, and either would be mistaken for rainfall.
   */
  async function freezeCompounds(game, { headroom = true } = {}) {
    await game.withMods((m, config) => {
      for (const compound of config.compounds) {
        m.rdo.setResourceDataObject(false, 'compounds', [compound, 'autoCreate']);
        m.rdo.setResourceDataObject(false, 'compounds', [compound, 'autoSell']);
        for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
          m.rdo.setResourceDataObject(0, 'compounds', [compound, 'upgrades', 'autoBuyer', tier, 'quantity']);
          m.rdo.setResourceDataObject(false, 'compounds', [compound, 'upgrades', 'autoBuyer', tier, 'active']);
        }
        if (config.headroom) {
          // Precipitation is refused outright once the store is full, so leave
          // room — otherwise a "nothing fell" pass would prove only that the
          // reservoir was already brimming.
          m.rdo.setResourceDataObject(1e6, 'compounds', [compound, 'storageCapacity']);
          m.rdo.setResourceDataObject(0, 'compounds', [compound, 'quantity']);
        }
      }
    }, { compounds: COMPOUNDS, headroom });
  }

  /** Every compound's quantity in one read, so a whole-tab comparison is one object. */
  async function compoundQuantities(game) {
    return game.withMods((m, compounds) => Object.fromEntries(
      compounds.map((compound) => [compound, m.rdo.getResourceDataObject('compounds', [compound, 'quantity'])])
    ), COMPOUNDS);
  }

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareCraftingRun(game);
  });

  test('the star system rains one compound, drawn from the shipped weighted table', async ({ game }) => {
    const state = await precipitationState(game);

    // The category is what `addPrecipitationResource()` indexes the data object
    // with, so a star generated against 'resources' would write into the wrong
    // half of the game.
    expect(state.category).toBe('compounds');
    expect(Object.keys(PRECIPITATION_WEIGHTS)).toContain(state.type);
    // Concrete sits in the table at weight 0 and must never actually be drawn.
    expect(PRECIPITATION_WEIGHTS[state.type]).toBeGreaterThan(0);

    // …and whatever was drawn is a real compound with its own pane, which is the
    // pane the rain will fill.
    await openCompound(game, state.type);
  });

  test('with the weather clear, nothing arrives from the sky', async ({ game }) => {
    await freezeCompounds(game);
    const state = await clearWeather(game);
    expect(state.rate).toBe(0);

    const before = await compoundQuantities(game);
    await game.page.waitForTimeout(3000);
    const after = await compoundQuantities(game);

    // Including the compound this system rains: no rain, no gain.
    expect(after).toEqual(before);
  });

  test('while it rains, the precipitation type fills up and no other compound does', async ({ game }) => {
    await freezeCompounds(game);
    const raining = await forceRain(game);
    expect(raining.weather).toBe('rain');
    // The shower rolls 1-4 per second, divided by the timer rate ratio.
    expect(raining.rate).toBeGreaterThan(0);
    expect(raining.rate * 100).toBeLessThanOrEqual(4);

    const before = await compoundQuantities(game);
    await game.page.waitForTimeout(3000);
    const after = await compoundQuantities(game);

    expect(after[raining.type]).toBeGreaterThan(before[raining.type]);

    const others = COMPOUNDS.filter((compound) => compound !== raining.type);
    expect(Object.fromEntries(others.map((c) => [c, after[c]])))
      .toEqual(Object.fromEntries(others.map((c) => [c, before[c]])));
  });

  test('clearing the weather stops the compound filling', async ({ game }) => {
    await freezeCompounds(game);
    const raining = await forceRain(game);

    const wetStart = await compoundQuantities(game);
    await game.page.waitForTimeout(2000);
    const wetEnd = await compoundQuantities(game);
    const gainedWhileRaining = wetEnd[raining.type] - wetStart[raining.type];
    expect(gainedWhileRaining).toBeGreaterThan(0);

    await clearWeather(game);

    const dryStart = await compoundQuantities(game);
    await game.page.waitForTimeout(2000);
    const dryEnd = await compoundQuantities(game);

    // Exactly nothing, not merely less: the rate is pinned to zero when the
    // weather is not rain, so this is an equality rather than a comparison.
    expect(dryEnd[raining.type]).toBe(dryStart[raining.type]);
  });

  test('precipitation stops at the storage cap rather than overfilling it', async ({ game }) => {
    await freezeCompounds(game);
    const raining = await forceRain(game);

    // Fill the store this system rains into, and leave every other one empty.
    await game.withMods((m, type) => {
      m.rdo.setResourceDataObject(500, 'compounds', [type, 'storageCapacity']);
      m.rdo.setResourceDataObject(500, 'compounds', [type, 'quantity']);
    }, raining.type);

    await game.page.waitForTimeout(2500);

    const after = await compoundQuantities(game);
    expect(after[raining.type]).toBe(500);
  });
});
