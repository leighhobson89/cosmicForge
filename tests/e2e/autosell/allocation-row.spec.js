/**
 * Area: Autosell — the sell row itself, after the allocation line replaces it
 * Plan: docs/player-feedback-improvement-plan.md, P9
 *
 * Every spec in this file exists because manual testing found the behaviour
 * wrong. They are written against the row as the player meets it — what is on
 * screen, what moves, what is still clickable — rather than against the engine,
 * because that is where all seven of these went wrong.
 *
 * What was found, and what each spec now pins:
 *
 * 1. **A legacy lock made the slider immovable.** `handleAutoCreateResourceSellRows`
 *    set `pointer-events: none` on a resource's whole sell row whenever any
 *    auto-creating compound drew on that resource. It was the companion to the
 *    old every-frame `autoSell = false` loop — the game switched the toggle off
 *    behind the player's back, and greying the row hid it. Both are gone: feeding
 *    compounds *and* selling *and* accumulating is what the line exists to
 *    balance, so the row must stay live.
 * 2. **Compounds must not get a slider at all.** They are not ingredients for
 *    anything, so there is no band to offer and nothing for a cash slider to
 *    balance against. Compound selling stays manual, exactly as before.
 * 3. **The compound band must not appear at level 1.** Owning only autosell means
 *    one handle, always.
 * 4. **The row must stay one line tall.** A column layout made the line taller
 *    than the Fuse button beside it and pushed the row out of alignment.
 * 5. **Fuse became all-or-nothing.** `fuseResource()` reads its quantity out of
 *    the sale preview, and the sell dropdown used to drive that preview. With the
 *    dropdown gone the preview is pinned to all stock — so the button has to say
 *    "Fuse All" rather than quietly meaning something new.
 * 6. **The autosell toggle is gone.** Buying the perk once is the only gate; the
 *    slider is always live after that, and dragging the cash handle back to the
 *    storage end is how a material is left alone. A second control that could
 *    contradict the bar was the confusion, not the cure.
 * 7. **The readout is three destinations, and all three move.** It used to lead
 *    with the allocatable total, which does not change when a handle does — a
 *    fixed number sitting beside a slider the player was dragging.
 * 8. **The bar explains itself.** A two-handle partition is not self-evident, so
 *    hovering it says what the handles do, what the three figures mean, and where
 *    a share that cannot be used actually ends up — with the player's own
 *    numbers in the sentences.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 300_000 });

async function buyLevels(game, levels) {
  await game.debugClick('add100ApButton');
  await game.page.waitForTimeout(200);
  for (let i = 0; i < levels; i++) {
    await game.withMods((m) => m.game.purchaseBuff('nanoBrokers'));
    await game.page.waitForTimeout(200);
    await game.page.evaluate(() => {
      const confirm = document.getElementById('modalConfirm');
      const modal = document.getElementById('modal');
      if (confirm && modal && getComputedStyle(modal).display !== 'none') confirm.click();
    });
  }
  await game.page.waitForTimeout(300);
}

/**
 * Open a material's pane the way a player does - by clicking its side-menu row.
 *
 * `setCurrentOptionPane` alone only records which pane is current; it does not
 * draw one, so a spec that used it found an empty content column and every row
 * query came back null.
 *
 * The click is dispatched rather than driven through the mouse because these
 * rows sit inside collapsibles that may be shut, and the row itself has to be
 * un-hidden first: revealing a row is a test affordance, not a claim about
 * unlock order.
 */
async function openPane(game, key, tab) {
  await game.openTab(tab);
  await game.page.waitForTimeout(200);
  const opened = await game.page.evaluate((id) => {
    const option = document.getElementById(`${id}Option`);
    if (!option) return false;
    option.classList.remove('invisible');
    option.closest('.row-side-menu')?.classList.remove('invisible');
    option.closest('.collapsible')?.classList.remove('invisible');
    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, key);
  await game.page.waitForTimeout(600);
  return opened;
}

test.describe('Autosell — the sell row', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('1. an auto-creating compound no longer locks its ingredient’s sell row', async ({ game }) => {
    // The row used to become unclickable, so the slider could not be dragged at
    // all once auto-create was on - which is precisely when a player most wants
    // to change the split.
    await buyLevels(game, 2);
    await game.withMods((m) => {
      m.cg.setPowerOnOff(true);
      m.cg.setInfinitePower(true);
      // Steel draws on iron.
      m.rdo.setResourceDataObject(true, 'compounds', ['steel', 'autoCreate']);
    });
    await openPane(game, 'iron', 1);
    await game.advanceTimers(2_000);

    const rowState = await game.page.evaluate(() => {
      const row = document.getElementById('ironSellRow');
      if (!row) return null;
      const style = getComputedStyle(row);
      return { pointerEvents: style.pointerEvents, opacity: Number(style.opacity) };
    });

    expect(rowState, 'the iron sell row exists').not.toBeNull();
    expect(rowState.pointerEvents, 'the row must stay clickable while steel auto-creates').not.toBe('none');
    expect(rowState.opacity, 'and must not be greyed out').toBeGreaterThan(0.9);
  });

  test('2. the handles actually move the stored shares', async ({ game }) => {
    await buyLevels(game, 2);
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(0, 'resources', ['iron', 'cashShare']);
      m.rdo.setResourceDataObject(0, 'resources', ['iron', 'compoundShare']);
    });
    await openPane(game, 'iron', 1);

    // Arrow keys are the same code path as a drag, without needing pointer
    // geometry, and they are a real way in that has to keep working.
    const moved = await game.page.evaluate(() => {
      const cash = document.getElementById('ironAllocationHandleCash');
      const compound = document.getElementById('ironAllocationHandleCompound');
      if (!cash || !compound) return null;
      for (let i = 0; i < 3; i++) {
        cash.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      }
      for (let i = 0; i < 4; i++) {
        compound.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      }
      return true;
    });

    expect(moved, 'both handles are on the page at level 2').toBe(true);

    const shares = await game.withMods((m) => ({
      cash: m.rdo.getResourceDataObject('resources', ['iron', 'cashShare'], true),
      compound: m.rdo.getResourceDataObject('resources', ['iron', 'compoundShare'], true)
    }));

    // 5% per step, and the handles push rather than clamp. Both start at 0, so
    // the three cash steps carry the compound handle along in front of them to
    // 15; the compound band is still zero wide at that point. Its own four steps
    // then take its edge to 35, which is a 20-point band from 15.
    expect(shares.cash, 'the cash handle moved the stored share').toBe(15);
    expect(shares.compound, 'and the compound handle opened a band beyond it').toBe(20);
  });

  test('3. the compound band does not exist at level 1', async ({ game }) => {
    await buyLevels(game, 1);
    await openPane(game, 'iron', 1);

    const handles = await game.page.evaluate(() => ({
      cash: !!document.getElementById('ironAllocationHandleCash'),
      compound: !!document.getElementById('ironAllocationHandleCompound'),
      bands: document.querySelectorAll('#ironSellRow .slider-segment').length
    }));

    expect(handles.cash, 'the cash handle is there').toBe(true);
    expect(handles.compound, 'the compound handle is NOT - only autosell is owned').toBe(false);
    expect(handles.bands, 'two segments: cash and storage').toBe(2);
  });

  test('4. helium never gets a compound band, even at level 3', async ({ game }) => {
    await buyLevels(game, 3);
    await openPane(game, 'helium', 1);

    const handles = await game.page.evaluate(() => ({
      cash: !!document.getElementById('heliumAllocationHandleCash'),
      compound: !!document.getElementById('heliumAllocationHandleCompound')
    }));

    expect(handles.cash).toBe(true);
    expect(handles.compound, 'nothing is made from helium, so the band would be a dead control').toBe(false);
  });

  test('5. compounds keep manual selling and get no slider', async ({ game }) => {
    await buyLevels(game, 3);
    await openPane(game, 'diesel', 4);

    const row = await game.page.evaluate(() => {
      const sellRow = document.getElementById('dieselSellRow');
      if (!sellRow) return null;
      const dropdown = sellRow.querySelector('#dieselSellSelectQuantity');
      const sellButton = sellRow.querySelector('button.sell');
      return {
        hasLine: !!sellRow.querySelector('.allocation-line-container'),
        dropdownVisible: !!dropdown && !dropdown.classList.contains('invisible'),
        sellVisible: !!sellButton && !sellButton.classList.contains('invisible')
      };
    });

    expect(row, 'the diesel sell row exists').not.toBeNull();
    expect(row.hasLine, 'no allocation line on a compound, at any level').toBe(false);
    expect(row.dropdownVisible, 'the quantity dropdown stays').toBe(true);
    expect(row.sellVisible, 'and so does the Sell button').toBe(true);
  });

  test('6. the row stays one line — the Fuse button keeps its alignment', async ({ game }) => {
    await buyLevels(game, 2);
    await openPane(game, 'hydrogen', 1);
    // Fusion has to be researched for the button to be on screen at all.
    await game.withMods((m) => m.cg.setTechUnlockedArray('hydrogenFusion'));
    await game.advanceTimers(1_000);

    const geometry = await game.page.evaluate(() => {
      const row = document.getElementById('hydrogenSellRow');
      const line = row?.querySelector('.allocation-line-container');
      const fuse = row?.querySelector('button.fuse');
      if (!line || !fuse) return null;
      const l = line.getBoundingClientRect();
      const f = fuse.getBoundingClientRect();
      return {
        lineHeight: l.height,
        lineCentre: l.top + l.height / 2,
        fuseCentre: f.top + f.height / 2,
        fuseLeftOfLineRight: f.left >= l.right - 1
      };
    });

    expect(geometry, 'both the line and the Fuse button are on screen').not.toBeNull();
    // A column layout made the container roughly twice a control's height, which
    // is what pushed the row out of line.
    expect(geometry.lineHeight, 'the line is one control tall').toBeLessThan(46);
    expect(Math.abs(geometry.lineCentre - geometry.fuseCentre),
      'the Fuse button is vertically centred with the line').toBeLessThan(6);
    expect(geometry.fuseLeftOfLineRight, 'and sits after it on the same line').toBe(true);
  });

  test('7. the Fuse button says Fuse All once the quantity dropdown is gone', async ({ game }) => {
    await buyLevels(game, 1);
    await game.withMods((m) => m.cg.setTechUnlockedArray('hydrogenFusion'));
    await openPane(game, 'hydrogen', 1);
    await game.advanceTimers(1_000);

    const label = await game.page.evaluate(() =>
      document.querySelector('#hydrogenSellRow button.fuse')?.textContent?.trim());
    const expected = await game.withMods((m) => m.loc.localize('buttonFuseAll', m.cg.getLanguage()));

    expect(label, 'the button states that it fuses everything').toBe(expected);
  });

  test('8. fusing takes the whole stock, since there is no amount to choose', async ({ game }) => {
    // The preview `fuseResource()` reads is pinned to all stock when the
    // dropdown is hidden. Without that pin it would keep whatever the player had
    // last selected before the perk, which is invisible and unchangeable.
    await buyLevels(game, 1);
    await game.withMods((m) => {
      m.cg.setTechUnlockedArray('hydrogenFusion');
      m.rdo.setResourceDataObject(1e6, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(4_000, 'resources', ['hydrogen', 'quantity']);
    });
    await openPane(game, 'hydrogen', 1);
    await game.advanceTimers(1_000);

    const preview = await game.withMods((m) => m.cg.getResourceSalePreview('hydrogen'));
    const quoted = Number(String(preview || '').match(/\((\d+)/)?.[1] ?? 0);

    expect(quoted, 'the preview quotes the entire stock').toBeGreaterThan(3_900);
  });

  test('9. the readout is three destinations and no total', async ({ game }) => {
    // The readout used to lead with the *allocatable* total, which does not move
    // when a handle does - so beside two figures that did it read as a band that
    // never changed. All three figures are now destinations: storage, cash and
    // the compound draw. The total is quoted once, in the breakdown tooltip on
    // the production figure in the left pane.
    await buyLevels(game, 2);
    await openPane(game, 'iron', 1);

    const figures = await game.page.evaluate(() => ({
      storage: document.querySelectorAll('#ironSellRow .allocation-figure-storage').length,
      cash: document.querySelectorAll('#ironSellRow .allocation-figure-cash').length,
      compound: document.querySelectorAll('#ironSellRow .allocation-figure-compound').length,
      allocatable: document.querySelectorAll('#ironSellRow .allocation-figure-allocatable').length
    }));

    expect(figures.storage, 'the storage figure leads').toBe(1);
    expect(figures.cash, 'the cash figure stays').toBe(1);
    expect(figures.compound, 'and the compound one, at level 2 on an ingredient').toBe(1);
    expect(figures.allocatable, 'the allocatable total is gone from the row').toBe(0);
  });

  test('10. the compound Create row carries the shared info marker', async ({ game }) => {
    // The game already has an info-tooltip mechanism - an `info-emoji` element
    // whose text is registered by id in `infoTooltipDescriptions`. A hand-rolled
    // `title` attribute looked different and bypassed that localisation path.
    await buyLevels(game, 2);
    await openPane(game, 'diesel', 4);
    await game.withMods((m) => m.game.setAutoCreateToggleState('diesel'));
    await game.page.waitForTimeout(300);

    const marker = await game.page.evaluate(() => {
      const el = document.getElementById('info_autoCreateAllocation');
      return el ? { isInfoEmoji: el.classList.contains('info-emoji'), text: el.textContent } : null;
    });

    expect(marker, 'the marker is on the Create row').not.toBeNull();
    expect(marker.isInfoEmoji, 'and uses the shared info-emoji class').toBe(true);

    const registered = await game.withMods((m) =>
      m.desc.infoTooltipDescriptions?.info_autoCreateAllocation || '');
    expect(registered.length, 'with its text in the shared registry').toBeGreaterThan(20);
  });

  test('11. there is no autosell toggle left to find', async ({ game }) => {
    // Autosell has one gate now - buying the perk once - and no second control
    // that can undo it. A player who wants a material left alone drags the cash
    // handle back to the storage end. Anything still rendering a toggle would be
    // a second, contradictory answer to "is this selling?".
    await buyLevels(game, 2);
    await openPane(game, 'iron', 1);

    const onResource = await game.page.evaluate(() =>
      document.querySelectorAll('#autoSellToggle').length);
    expect(onResource, 'no toggle on a resource sell row').toBe(0);

    // And none on a compound row either, where it had only been hidden rather
    // than removed - a hidden control is still a control the next change trips
    // over.
    await openPane(game, 'diesel', 4);
    const onCompound = await game.page.evaluate(() =>
      document.querySelectorAll('#autoSellToggle').length);
    expect(onCompound, 'nor on a compound sell row').toBe(0);
  });

  test('12. the storage figure moves with the cash handle', async ({ game }) => {
    // The bug this pins: the first figure in the readout was the *allocatable*
    // total, which does not change when a handle does, so the row showed a fixed
    // number beside a slider the player was dragging. All three figures now
    // report where production is going, and all three move.
    await buyLevels(game, 1);
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e9, 'resources', ['iron', 'storageCapacity']);
      m.rdo.setResourceDataObject(0, 'resources', ['iron', 'quantity']);
      m.rdo.setResourceDataObject(1, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(1000, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(true, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(0, 'resources', ['iron', 'cashShare']);
    });
    await openPane(game, 'iron', 1);
    await game.advanceTimers(2_000);

    // Compare the rendered string with the engine's own figure rather than
    // parsing it back into a number: the formatter abbreviates, so a parsed
    // comparison would be a test of the formatter.
    const shownStorage = () => game.page.evaluate(() =>
      document.querySelector('#ironSellRow .allocation-figure-storage')?.textContent ?? null);
    const engineStorage = () => game.withMods((m) => {
      const b = m.game.getAllocationBreakdown('resources', 'iron');
      const suffix = m.loc.localize('textPerSecond', m.cg.getLanguage());
      return { text: `${m.game.formatProductionRateValue(b.toStorage)} ${suffix}`, value: b.toStorage };
    });

    const atZero = { shown: await shownStorage(), engine: await engineStorage() };
    expect(atZero.shown, 'the readout agrees with the engine at 0% sold').toBe(atZero.engine.text);

    // Ten steps of 5% is the cash handle at 50%, driven the way a player using
    // the keyboard would drive it.
    await game.page.evaluate(() => {
      const handle = document.getElementById('ironAllocationHandleCash');
      for (let i = 0; i < 10; i++) {
        handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      }
    });
    await game.advanceTimers(2_000);

    const atHalf = { shown: await shownStorage(), engine: await engineStorage() };

    expect(await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['iron', 'cashShare'], true)),
      'the handle really moved to 50%').toBe(50);
    expect(atHalf.shown, 'the readout still agrees with the engine').toBe(atHalf.engine.text);
    expect(atHalf.engine.value, 'and half as much is now accumulating')
      .toBeCloseTo(atZero.engine.value / 2, 1);
    expect(atHalf.shown, 'so the figure on screen changed').not.toBe(atZero.shown);
  });

  test('13. hovering the bar explains it, in the player’s own numbers', async ({ game }) => {
    // The slider is the only place the split is set, so it is where the
    // explanation belongs. It is built from the live breakdown rather than
    // written as static prose - a rule stated with the player's own figures in
    // it is the difference between "the rest is stored" and seeing the amount.
    await buyLevels(game, 2);
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e9, 'resources', ['iron', 'storageCapacity']);
      m.rdo.setResourceDataObject(1, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(1000, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(true, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(20, 'resources', ['iron', 'cashShare']);
      m.rdo.setResourceDataObject(40, 'resources', ['iron', 'compoundShare']);
      // Nothing auto-creating, so the tooltip has to say where the 40% is going.
      for (const compound of ['steel', 'titanium']) {
        m.rdo.setResourceDataObject(false, 'compounds', [compound, 'autoCreate']);
      }
    });
    await openPane(game, 'iron', 1);
    await game.advanceTimers(2_000);

    await game.page.hover('#ironAllocationSlider');
    await game.page.waitForTimeout(200);

    const tip = await game.page.evaluate(() => {
      const el = document.getElementById('production-rate-tooltip');
      if (!el) return null;
      return { visible: getComputedStyle(el).display !== 'none', text: el.innerText };
    });

    const strings = await game.withMods((m) => ({
      heading: m.loc.localize('tooltipSliderHeading', m.cg.getLanguage()),
      cashHandle: m.loc.localize('tooltipSliderCashHandle', m.cg.getLanguage()),
      compoundHandle: m.loc.localize('tooltipSliderCompoundHandle', m.cg.getLanguage()),
      hint: m.loc.localize('tooltipSliderBreakdownHint', m.cg.getLanguage()),
      // Only the fixed opening of the sentence: the rest carries live values.
      compoundOff: m.loc.localize('tooltipSliderCompoundOff', m.cg.getLanguage()).split('{')[0].trim()
    }));

    expect(tip, 'the shared tooltip panel exists').not.toBeNull();
    expect(tip.visible, 'and is shown while the pointer is over the bar').toBe(true);
    expect(tip.text, 'it names itself').toContain(strings.heading);
    expect(tip.text, 'explains the cash handle').toContain(strings.cashHandle);
    expect(tip.text, 'and the compound handle, at level 2').toContain(strings.compoundHandle);
    expect(tip.text, 'and points at the full breakdown').toContain(strings.hint);

    // The player's own percentages, not a worked example.
    expect(tip.text, 'the cash percentage is the one that is set').toContain('20%');
    expect(tip.text, 'and so is the compound percentage').toContain('40%');

    // Auto-create is off for everything that eats iron, so the band is not
    // reserved - the tooltip has to say the material is going to storage.
    expect(tip.text, 'and says where an unused compound band actually goes')
      .toContain(strings.compoundOff);

    await game.page.mouse.move(0, 0);
    await game.page.waitForTimeout(200);
    const afterLeave = await game.page.evaluate(() =>
      getComputedStyle(document.getElementById('production-rate-tooltip')).display);
    expect(afterLeave, 'and it goes away again').toBe('none');
  });

  test('14. at level 1 the tooltip says nothing about compounds', async ({ game }) => {
    // A player who owns one rung has one handle, and must not be told about a
    // second one they cannot use. The tooltip grows with the control.
    await buyLevels(game, 1);
    await openPane(game, 'iron', 1);
    await game.advanceTimers(1_000);

    await game.page.hover('#ironAllocationSlider');
    await game.page.waitForTimeout(200);

    const text = await game.page.evaluate(() =>
      document.getElementById('production-rate-tooltip')?.innerText ?? '');
    const strings = await game.withMods((m) => ({
      cashHandle: m.loc.localize('tooltipSliderCashHandle', m.cg.getLanguage()),
      compoundHandle: m.loc.localize('tooltipSliderCompoundHandle', m.cg.getLanguage()),
      fallsBack: m.loc.localize('tooltipSliderFallsBack', m.cg.getLanguage())
    }));

    expect(text, 'the cash handle is explained').toContain(strings.cashHandle);
    expect(text, 'the compound handle is not').not.toContain(strings.compoundHandle);
    expect(text, 'nor is the compound fall-back rule').not.toContain(strings.fallsBack);
  });

  test('15. the tooltip quotes the total *after* the fuel burn', async ({ game }) => {
    // Carbon is what the basic power plant burns, so it is the one resource
    // where "to divide, after anything burned as fuel" is a claim that can be
    // wrong. It was: the breakdown subtracted `usedForFuelPerSec`, which holds a
    // per-*tick* figure despite its name, so a hundredth of the real burn came
    // off and the sentence quoted what was effectively the gross.
    await buyLevels(game, 2);
    await game.withMods((m) => {
      m.cg.setInfinitePower(false);
      m.rdo.setResourceDataObject(1e9, 'resources', ['carbon', 'storageCapacity']);
      m.rdo.setResourceDataObject(1e6, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(1, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(10, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(true, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(0, 'resources', ['carbon', 'cashShare']);
      m.rdo.setResourceDataObject(0, 'resources', ['carbon', 'compoundShare']);
      // One basic power plant, switched on: 0.03 carbon per tick, so 3 / s.
      m.rdo.setResourceDataObject(1, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      m.cg.setPowerOnOff(true);
    });
    await openPane(game, 'carbon', 1);
    await game.advanceTimers(2_000);

    await game.page.hover('#carbonAllocationSlider');
    await game.page.waitForTimeout(200);

    const shown = await game.page.evaluate(() =>
      document.getElementById('production-rate-tooltip')?.innerText ?? '');

    const engine = await game.withMods((m) => {
      const b = m.game.getAllocationBreakdown('resources', 'carbon');
      const lang = m.cg.getLanguage();
      const suffix = m.loc.localize('textPerSecond', lang);
      return {
        gross: b.gross,
        fuel: b.fuel,
        allocatable: b.allocatable,
        sentence: m.loc.localize('tooltipSliderIntro', lang)
          .replace('{allocatable}', `${m.game.formatProductionRateValue(b.allocatable)} ${suffix}`)
      };
    });

    expect(engine.fuel, 'the plant is really burning carbon').toBeGreaterThan(0);
    expect(engine.allocatable, 'and the allocatable total is net of it')
      .toBeCloseTo(engine.gross - engine.fuel, 4);
    expect(engine.allocatable, 'so it is strictly below the gross - the bug had them equal')
      .toBeLessThan(engine.gross);

    // And the sentence on screen is that figure, not the gross.
    expect(shown, 'the tooltip quotes the fuel-net total').toContain(engine.sentence);
  });
});
