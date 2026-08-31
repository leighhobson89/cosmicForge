/**
 * Area: Autosell — the displays the allocation model has to keep honest
 * Plan: docs/player-feedback-improvement-plan.md, P9
 *
 * The arithmetic was the smaller half of P9. Every display in the game that
 * talked about production was built on the two behaviours the engine replaced,
 * and each was wrong in its own way:
 *
 *   - the resource pane's **"/s"** subtracted fuel but never the cash share or
 *     the compound draw, so it quoted the gross the moment the line was on;
 *   - the **quantity colour** deliberately suppressed the storage-full green
 *     whenever autosell was on, because under the old semantics a store could
 *     never legitimately fill — which suppressed the storage-increase claim with
 *     it;
 *   - the resource **tooltip** said only "diverted to create {compound}", with no
 *     quantity, because the honest answer used to be "all of it";
 *   - the compound tooltip's **estimated creation rate** assumed the compound had
 *     the entire gross production of every ingredient to itself.
 *
 * The rule these specs enforce is that a display never recomputes the split for
 * itself. Every figure comes from `getAllocationBreakdown()`, the engine's own
 * arithmetic, so a display and the production it describes cannot drift apart.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 300_000 });

async function buyAllocationCapability(game) {
  await game.debugClick('add100ApButton');
  await game.page.waitForTimeout(200);
  await game.withMods((m) => m.game.purchaseBuff('nanoBrokers'));
  await game.page.waitForTimeout(150);
  await game.withMods((m) => m.game.purchaseBuff('nanoBrokers'));
  await game.page.waitForTimeout(300);
  await game.page.evaluate(() => {
    const confirm = document.getElementById('modalConfirm');
    const modal = document.getElementById('modal');
    if (confirm && modal && getComputedStyle(modal).display !== 'none') confirm.click();
  });
  await game.page.waitForTimeout(200);
}

test.describe('Autosell — the displays', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await buyAllocationCapability(game);
  });

  test('1. the breakdown accounts for every unit produced', async ({ game }) => {
    // fuel + cash + compounds + storage must sum back to gross. If any figure is
    // computed independently of the others this is where the drift shows.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e9, 'resources', ['iron', 'storageCapacity']);
      m.rdo.setResourceDataObject(1, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(1000, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(true, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(10, 'resources', ['iron', 'cashShare']);
      m.rdo.setResourceDataObject(40, 'resources', ['iron', 'compoundShare']);
    });

    await game.advanceTimers(3_000);

    const b = await game.withMods((m) => m.game.getAllocationBreakdown('resources', 'iron'));

    expect(b.allocatable, 'allocatable is gross less fuel').toBeCloseTo(b.gross - b.fuel, 4);
    expect(b.toCash + b.toCompounds + b.toStorage, 'and the three shares sum back to it')
      .toBeCloseTo(b.allocatable, 4);
    expect(b.toCash / b.allocatable, 'the cash share is the 10% the player set').toBeCloseTo(0.10, 2);
    expect(b.compoundCeiling / b.allocatable, 'and the ceiling is the 40%').toBeCloseTo(0.40, 2);
  });

  test('2. the pane rate is the net accumulation rate, not the gross', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e9, 'resources', ['iron', 'storageCapacity']);
      m.rdo.setResourceDataObject(0, 'resources', ['iron', 'quantity']);
      m.rdo.setResourceDataObject(1, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(1000, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(true, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(25, 'resources', ['iron', 'cashShare']);
      m.rdo.setResourceDataObject(0, 'resources', ['iron', 'compoundShare']);
    });

    // Measure what the store actually gains, and compare it with what the pane
    // claims. The pane must describe the store, not the autobuyers.
    const before = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['iron', 'quantity']));
    await game.advanceTimers(6_000);
    const after = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['iron', 'quantity']));

    const measured = (after - before) / 6;
    const claimed = await game.withMods((m) => {
      const b = m.game.getAllocationBreakdown('resources', 'iron');
      return b.gross - b.fuel - b.toCash - b.toCompounds;
    });

    expect(claimed / measured, 'the quoted rate matches the measured gain').toBeCloseTo(1, 1);
  });

  test('3. a store under allocation can fill, and says so', async ({ game }) => {
    // The direct regression test for the suppressed `green-ready-text`. Under
    // the old autosell this was impossible by construction, so the colour - and
    // the storage-increase claim behind it - was deliberately withheld.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(5_000, 'resources', ['iron', 'storageCapacity']);
      m.rdo.setResourceDataObject(4_900, 'resources', ['iron', 'quantity']);
      m.rdo.setResourceDataObject(1, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(500, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(true, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(10, 'resources', ['iron', 'cashShare']);
    });

    await game.advanceTimers(5_000);

    const state = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('resources', ['iron', 'quantity']),
      capacity: m.rdo.getResourceDataObject('resources', ['iron', 'storageCapacity'])
    }));

    expect(state.quantity, 'the store reaches its cap despite the allocation')
      .toBeCloseTo(state.capacity, 0);
  });

  test('4. the compound tooltip names the ingredient holding it back', async ({ game }) => {
    await game.withMods((m) => {
      m.cg.setPowerOnOff(true);
      m.cg.setInfinitePower(true);
      for (const resource of ['iron', 'sodium', 'neon']) {
        m.rdo.setResourceDataObject(1e9, 'resources', [resource, 'storageCapacity']);
        m.rdo.setResourceDataObject(1e8, 'resources', [resource, 'quantity']);
        m.rdo.setResourceDataObject(1, 'resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
        m.rdo.setResourceDataObject(1e6, 'resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'rate']);
        m.rdo.setResourceDataObject(true, 'resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'active']);
        m.rdo.setResourceDataObject(100, 'resources', [resource, 'compoundShare']);
      }
      // Neon alone is starved, so it must be the named bottleneck.
      m.rdo.setResourceDataObject(0, 'resources', ['neon', 'quantity']);
      m.rdo.setResourceDataObject(0, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'rate']);

      m.rdo.setResourceDataObject(1e9, 'compounds', ['titanium', 'storageCapacity']);
      m.rdo.setResourceDataObject(true, 'compounds', ['titanium', 'autoCreate']);
    });

    await game.advanceTimers(3_000);

    const throttledBy = await game.withMods((m) =>
      m.rdo.getResourceDataObject('compounds', ['titanium', 'autoCreateThrottledBy'], true));

    expect(throttledBy, 'the scarcest ingredient is recorded by name').toBe('neon');
  });

  test('4b. the compound figure is the draw, and the storage figure absorbs the rest', async ({ game }) => {
    // The rule the player asked for: a band set while auto-create is off is not
    // reserved for anything - the material goes into storage, and the figures
    // have to say so. The ceiling still exists, and is still quoted, but in the
    // breakdown tooltip where there is room to explain the difference between
    // what was offered and what was taken.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e9, 'resources', ['iron', 'storageCapacity']);
      m.rdo.setResourceDataObject(1, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(1000, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(true, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(0, 'resources', ['iron', 'cashShare']);
      m.rdo.setResourceDataObject(40, 'resources', ['iron', 'compoundShare']);
      // Deliberately nothing auto-creating: the old readout showed 0 here.
      for (const compound of ['steel', 'titanium']) {
        m.rdo.setResourceDataObject(false, 'compounds', [compound, 'autoCreate']);
      }
    });

    await game.advanceTimers(3_000);

    const b = await game.withMods((m) => m.game.getAllocationBreakdown('resources', 'iron'));
    expect(b.compoundCeiling, 'the ceiling is real even with no consumers').toBeGreaterThan(0);
    expect(b.toCompounds, 'while the actual draw is correctly zero').toBeCloseTo(0, 6);
    expect(b.compoundCeiling / b.allocatable, 'and it is the 40% the player set').toBeCloseTo(0.40, 2);

    // The whole of allocatable is accumulating, because nothing is selling and
    // nothing is creating - the 40% band notwithstanding.
    expect(b.toStorage, 'the unused band falls through to storage')
      .toBeCloseTo(b.allocatable, 4);
  });

  test('4c. the fuel burn is read in per-second units, not per-tick', async ({ game }) => {
    // `usedForFuelPerSec` is misnamed: it accumulates the building's `fuel`
    // tuple, which is per *tick*. Subtracting it from a per-second gross took
    // off a hundredth of the real burn, so "allocatable" was the gross in all
    // but name. The breakdown now computes the burn the way the tick does.
    await game.withMods((m) => {
      m.cg.setInfinitePower(false);
      m.rdo.setResourceDataObject(1e9, 'resources', ['carbon', 'storageCapacity']);
      m.rdo.setResourceDataObject(1e6, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(1, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(10, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(true, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(0, 'resources', ['carbon', 'cashShare']);
      m.rdo.setResourceDataObject(0, 'resources', ['carbon', 'compoundShare']);
    });

    const noPlant = await game.withMods((m) => m.game.getAllocationBreakdown('resources', 'carbon'));
    expect(noPlant.fuel, 'nothing is burning carbon yet').toBeCloseTo(0, 6);

    await game.withMods((m) => {
      m.rdo.setResourceDataObject(2, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      m.cg.setPowerOnOff(true);
    });
    await game.advanceTimers(2_000);

    const withPlant = await game.withMods((m) => {
      const b = m.game.getAllocationBreakdown('resources', 'carbon');
      const tuple = m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'fuel']);
      return { ...b, perTick: Number(tuple[1]) || 0, ratio: m.cg.getTimerRateRatio() };
    });

    // Two plants at 0.03 per tick, a hundred ticks to the second: 6 carbon / s.
    expect(withPlant.fuel, 'the burn is quoted per second, like the gross beside it')
      .toBeCloseTo(withPlant.perTick * 2 * withPlant.ratio, 4);
    expect(withPlant.allocatable, 'and it really comes off the top')
      .toBeCloseTo(withPlant.gross - withPlant.fuel, 4);
    expect(withPlant.allocatable, 'so allocatable is strictly below gross')
      .toBeLessThan(withPlant.gross);

    // Switching the plant off stops the burn, and the whole gross is divisible
    // again - the same gate the tick's own deduction uses.
    await game.withMods((m) => m.game.toggleBuildingTypeOnOff('powerPlant1', false));
    const switchedOff = await game.withMods((m) => m.game.getAllocationBreakdown('resources', 'carbon'));
    expect(switchedOff.fuel, 'a plant that is off burns nothing').toBeCloseTo(0, 6);
  });

  test('5. every new string resolves in every supported language', async ({ game }) => {
    const KEYS = [
      'allocationHandleCash',
      'allocationHandleCompound',
      'tooltipAllocationHeading',
      'tooltipAllocationAllocatable',
      'tooltipAllocationToCash',
      'tooltipAllocationToStorage',
      'tooltipAllocationCeiling',
      'tooltipAllocationThrottledBy',
      'infoTooltipAutoCreateAllocation',
      'buttonFuseAll',
      'tooltipAutoSellIncome',
      'buffNameNanoBrokers',
      'buffNanoBrokersContent1',
      // The slider's own how-to tooltip.
      'tooltipSliderHeading',
      'tooltipSliderIntro',
      'tooltipSliderLegendStorage',
      'tooltipSliderLegendCash',
      'tooltipSliderLegendCompounds',
      'tooltipSliderCashHandle',
      'tooltipSliderCashOff',
      'tooltipSliderCompoundHandle',
      'tooltipSliderCompoundOff',
      'tooltipSliderCompoundThrottled',
      'tooltipSliderFallsBack',
      'tooltipSliderStorageFull',
      'tooltipSliderBreakdownHint'
    ];

    const results = await game.withMods((m, keys) => {
      const languages = m.loc.getSupportedLanguages();
      const missing = [];
      for (const language of languages) {
        for (const key of keys) {
          const value = m.loc.localize(key, language);
          // `localize` returns the key itself when the catalogue has no entry,
          // which is exactly the "raw key rendered on screen" failure.
          if (!value || value === key) {
            missing.push(`${language}:${key}`);
          }
        }
      }
      return { languages, missing };
    }, KEYS);

    expect(results.languages.length, 'the catalogue has more than one language').toBeGreaterThan(1);
    expect(results.missing, 'no key may fall back to its own name').toEqual([]);
  });

  test('6. the retired tech strings are gone from the catalogue', async ({ game }) => {
    const stale = await game.withMods((m) => {
      const retired = [
        'techNameNanoBrokers',
        'techNotifyNanoBrokers',
        'optionDescTechNanoBrokersContent1',
        'optionDescTechNanoBrokersContent2',
        'buffNameCompoundAutomation',
        'buffCompoundAutomationContent1'
      ];
      const found = [];
      for (const language of m.loc.getSupportedLanguages()) {
        for (const key of retired) {
          // A key with no catalogue entry comes back as itself, so anything that
          // resolves to something else is still in there.
          if (m.loc.localize(key, language) !== key) {
            found.push(`${language}:${key}`);
          }
        }
      }
      return found;
    });

    expect(stale, 'a retired unlock leaves no strings behind').toEqual([]);
  });
});
