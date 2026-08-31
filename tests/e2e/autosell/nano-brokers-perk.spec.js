/**
 * Area: Autosell — the Nano Brokers ladder and the retired unlocks
 * Plan: docs/player-feedback-improvement-plan.md, P9
 *
 * ## What changed
 *
 * P9 folded two separate unlocks into one three-rung ascendency perk:
 *
 *   - the **`nanoBrokers` tech** (19000 research points, `resourceDataObject.js`)
 *     which gated autosell, and
 *   - the **`compoundAutomation` perk** (15 AP) which gated everything compound
 *     by pushing a `compoundMachining` pseudo-tech into `techUnlockedArray` at
 *     run start.
 *
 * Both are gone. In their place, one `nanoBrokers` perk bought up to three times:
 *
 *   | level | grants | cost |
 *   |---|---|---|
 *   | 1 | autosell — the allocation line, one handle | 15 AP |
 *   | 2 | compound auto-create, and the compound band on the line | 30 AP |
 *   | 3 | the compound auto-buyer tiers | 50 AP |
 *
 * ## Why this shape
 *
 * The levels are bought in order, so *"compound automation implies autosell
 * exists"* is structurally true rather than something every gate has to check
 * and every tooltip has to explain. That matters because a compound's
 * ingredients now arrive as an allocation, and an allocation only exists once
 * there is an allocation line to set it on.
 *
 * ## What would regress first
 *
 * - **Level 2 must not open the autobuyer tiers.** The old `compoundMachining`
 *   gate granted auto-create *and* the tiers together; splitting them is the
 *   whole reason level 3 exists, and a lazy port that leaves one gate covering
 *   both sells the third rung for nothing. Spec 4.
 * - **A level must apply the moment it is bought.** `compoundMachining` was
 *   pushed into the tech array only at run start, so a mid-run purchase did
 *   nothing until the next rebirth. Spec 5.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 240_000 });

const ladderState = (game) => game.withMods((m) => ({
  level: m.rdo.getNanoBrokersLevel(),
  autoSell: m.rdo.getAutoSellUnlocked(),
  autoCreate: m.rdo.getCompoundAutoCreateUnlocked(),
  autoBuyers: m.rdo.getCompoundAutoBuyersUnlocked(),
  cost: m.rdo.getAscendencyBuffCost(m.rdo.getBuffNanoBrokersData()),
  maxed: m.rdo.isAscendencyBuffMaxed(m.rdo.getBuffNanoBrokersData()),
  ap: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity'])
}));

async function buyOneLevel(game) {
  await game.withMods((m) => m.game.purchaseBuff('nanoBrokers'));
  await game.page.waitForTimeout(200);
  await game.page.evaluate(() => {
    const confirm = document.getElementById('modalConfirm');
    const modal = document.getElementById('modal');
    if (confirm && modal && getComputedStyle(modal).display !== 'none') confirm.click();
  });
  await game.page.waitForTimeout(150);
}

test.describe('Autosell — the Nano Brokers ladder', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('1. the retired tech is gone from the tree, and nothing depends on it', async ({ game }) => {
    const state = await game.withMods((m) => ({
      techExists: !!m.rdo.getResourceDataObject('techs', ['nanoBrokers'], true),
      // Nothing may name it as a prerequisite, or that tech becomes unreachable.
      dependents: Object.entries(m.rdo.getResourceDataObject('techs') || {})
        .filter(([, data]) => Array.isArray(data?.appearsAt) && data.appearsAt.includes('nanoBrokers'))
        .map(([key]) => key),
      retiredPerk: !!m.rdo.getAscendencyBuffDataObject()?.compoundAutomation
    }));

    expect(state.techExists, 'the Nano Brokers tech is removed').toBe(false);
    expect(state.dependents, 'and no tech is left with a dangling prerequisite').toEqual([]);
    expect(state.retiredPerk, 'the Compound Automation perk is removed too').toBe(false);

    // No row for it in the technology tree either.
    const rows = await game.page.locator('#techNanoBrokersRow').count();
    expect(rows, 'and no orphan row is rendered').toBe(0);
  });

  test('2. a fresh run owns nothing, and the sell rows are the manual ones', async ({ game }) => {
    const state = await ladderState(game);

    expect(state.level).toBe(0);
    expect(state.autoSell).toBe(false);
    expect(state.autoCreate).toBe(false);
    expect(state.autoBuyers).toBe(false);
    expect(state.cost, 'the first rung costs 15 AP').toBe(15);
    expect(state.maxed).toBe(false);

    await game.openResourcePane?.('hydrogen');
    const lines = await game.page.locator('.allocation-line-container').count();
    expect(lines, 'no allocation line exists before the perk').toBe(0);
  });

  test('3. level 1 buys autosell and nothing more', async ({ game }) => {
    await game.debugClick('add100ApButton');
    await game.page.waitForTimeout(200);
    await buyOneLevel(game);

    const state = await ladderState(game);
    expect(state.level).toBe(1);
    expect(state.autoSell, 'autosell is unlocked').toBe(true);
    expect(state.autoCreate, 'auto-create is NOT').toBe(false);
    expect(state.autoBuyers, 'and neither are the autobuyer tiers').toBe(false);
    expect(state.cost, 'the second rung costs 30 AP').toBe(30);
  });

  test('4. level 2 buys auto-create but NOT the autobuyer tiers', async ({ game }) => {
    // The regression test for the split. The retired `compoundMachining` gate
    // granted both at once; if a port leaves one gate covering both, level 3 is
    // sold for something the player already has.
    await game.debugClick('add100ApButton');
    await game.page.waitForTimeout(200);
    await buyOneLevel(game);
    await buyOneLevel(game);

    const state = await ladderState(game);
    expect(state.level).toBe(2);
    expect(state.autoCreate, 'auto-create is unlocked').toBe(true);
    expect(state.autoBuyers, 'the autobuyer tiers are still behind the third rung').toBe(false);
    expect(state.cost, 'the third rung costs 50 AP').toBe(50);

    await buyOneLevel(game);
    const atThree = await ladderState(game);
    expect(atThree.level).toBe(3);
    expect(atThree.autoBuyers, 'and the third rung opens them').toBe(true);
    expect(atThree.maxed, 'the ladder has no fourth rung').toBe(true);
  });

  test('5. a level applies immediately, without a reload or a rebirth', async ({ game }) => {
    // `compoundMachining` used to be granted only at run start, so a mid-run
    // purchase did nothing until the next run. The gates now read the perk live.
    await game.debugClick('add100ApButton');
    await game.page.waitForTimeout(200);
    await buyOneLevel(game);
    await buyOneLevel(game);

    const immediately = await game.withMods((m) => ({
      autoCreate: m.rdo.getCompoundAutoCreateUnlocked(),
      marker: m.cg.getTechUnlockedArray().includes('compoundMachining')
    }));

    expect(immediately.autoCreate, 'the capability is live the moment it is bought').toBe(true);
    expect(immediately.marker, 'and the compatibility marker is set with it').toBe(true);
  });

  test('6. the ladder cannot be bought past its cap, or without the AP', async ({ game }) => {
    await game.debugClick('add100ApButton');
    await game.page.waitForTimeout(200);
    for (let i = 0; i < 3; i++) {
      await buyOneLevel(game);
    }

    const before = await ladderState(game);
    expect(before.level).toBe(3);

    await buyOneLevel(game);
    const after = await ladderState(game);
    expect(after.level, 'a fourth purchase must do nothing').toBe(3);
    expect(after.ap, 'and must not charge for it').toBeCloseTo(before.ap, 6);
  });

  test('7. the perk row states what each level grants, in every language', async ({ game }) => {
    const languages = await game.withMods((m) => m.loc.getSupportedLanguages());

    for (const language of languages) {
      const copy = await game.withMods((m, lang) => {
        m.cg.setLanguage(lang);
        return {
          name: m.loc.localize('buffNameNanoBrokers', lang),
          description: m.loc.localize('buffNanoBrokersContent1', lang)
        };
      }, language);

      expect(copy.name, `${language}: the perk has a translated name`).not.toBe('buffNameNanoBrokers');
      expect(copy.description, `${language}: and translated level copy`).not.toBe('buffNanoBrokersContent1');
      expect(copy.description.length, `${language}: which actually says something`).toBeGreaterThan(20);
    }
  });
});

test.describe('Autosell — the allocation line follows the ladder', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.debugClick('add100ApButton');
    await game.page.waitForTimeout(200);
  });

  test('8. at level 1 the line has one handle; at level 2, two — but only where a recipe draws', async ({ game }) => {
    await buyOneLevel(game);

    // Iron feeds steel and titanium; helium feeds nothing at all.
    const atOne = await game.withMods((m) => ({
      ironIsIngredient: m.game.resourceIsCompoundIngredient('iron'),
      heliumIsIngredient: m.game.resourceIsCompoundIngredient('helium'),
      autoCreate: m.rdo.getCompoundAutoCreateUnlocked()
    }));

    expect(atOne.ironIsIngredient, 'iron is drawn on by steel and titanium').toBe(true);
    expect(atOne.heliumIsIngredient, 'helium is drawn on by nothing').toBe(false);
    expect(atOne.autoCreate, 'so at level 1 no resource shows a compound band').toBe(false);

    await buyOneLevel(game);

    const atTwo = await game.withMods((m) => ({
      autoCreate: m.rdo.getCompoundAutoCreateUnlocked(),
      // The band is offered only where it would do something: a recipe must
      // actually draw on the resource.
      ironBand: m.rdo.getCompoundAutoCreateUnlocked() && m.game.resourceIsCompoundIngredient('iron'),
      heliumBand: m.rdo.getCompoundAutoCreateUnlocked() && m.game.resourceIsCompoundIngredient('helium')
    }));

    expect(atTwo.ironBand, 'iron gains its compound band').toBe(true);
    expect(atTwo.heliumBand, 'helium never does, however far up the ladder').toBe(false);
  });

  test('9. the compound share is remembered while the band is not shown', async ({ game }) => {
    // A player who tuned a split at level 2 and later loads a state where the
    // band is not rendered must not have the value silently reset to a default.
    await buyOneLevel(game);
    await buyOneLevel(game);

    await game.withMods((m) => {
      m.rdo.setResourceDataObject(40, 'resources', ['iron', 'compoundShare']);
    });

    await game.advanceTimers(2_000);

    const kept = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['iron', 'compoundShare'], true));
    expect(kept, 'the share the player set is still there').toBe(40);
  });
});
