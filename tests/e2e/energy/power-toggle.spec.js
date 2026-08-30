/**
 * Area: Energy & Power Grid — P3 Powered On/Off stat-bar toggle
 * Plan: docs/player-feedback-improvement-plan.md (P3)
 *
 * The stat-bar "Powered" entry (#stat3) is a real toggle button built with the
 * shared createButton() helper. Clicking it drives the same toggleAllPower()
 * path as the energy UI's Power All control: ON when off/tripped, OFF when on.
 * With a Dyson Sphere (infinite power), or when no power plant of any type has
 * been built, the status is still shown but the button is fully inert to the
 * pointer: pointer-events:none lifts it out of the browser's hit-testing, so it
 * cannot be hovered (no highlight) or clicked. The hover tooltip and the
 * per-frame label/colour update (powerOnOrOffChecks) keep working because the
 * button keeps the same id and the powered-check/stat-value classes, and the
 * tooltip listeners sit on the parent .stat-cell, which keeps receiving the
 * pointer.
 *
 * Note the stat3 tooltip content is only populated while `basicPowerGeneration`
 * is unlocked (ui.js statToolBarCustomizations gates it behind the tech, the
 * same way the energy tab itself is gated), so the tooltip spec stages that
 * tech the way a real run would already have it.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe('Powered stat-bar toggle (P3)', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('the Powered stat entry is a button that flips the power state and stays flipped across ticks', async ({ game }) => {
    // Seed the same state the energy suite uses: a purchased, active plant and
    // enough fuel, so toggleAllPower() has something real to switch.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(3, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.addBuildingPotentialRate('powerPlant1');
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      m.rdo.setResourceDataObject(1000, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(1_000_000, 'resources', ['carbon', 'storageCapacity']);
      m.cg.setPowerOnOff(true);
    });

    const button = game.page.locator('#stat3');
    await expect(button).toHaveRole('button');

    // ON -> OFF
    await button.click();
    const afterOff = await game.withMods((m) => ({
      powerOn: m.cg.getPowerOnOff(),
      plantOn: m.cg.getBuildingTypeOnOff('powerPlant1')
    }));
    expect(afterOff.powerOn, 'clicking the Powered button while ON should switch power off').toBeFalsy();
    expect(afterOff.plantOn, 'toggleAllPower should have deactivated the plant').toBeFalsy();

    // The state must survive ticks (the auto-manager force-flips only when the
    // energy balance demands it; with a positive balance it must not re-enable).
    await game.advanceTimers(2000);
    await game.page.waitForTimeout(300);
    const staysOff = await game.withMods((m) => m.cg.getPowerOnOff());
    expect(staysOff, 'power should stay off across ticks').toBeFalsy();

    // OFF -> ON
    await button.click();
    const afterOn = await game.withMods((m) => ({
      powerOn: m.cg.getPowerOnOff(),
      plantOn: m.cg.getBuildingTypeOnOff('powerPlant1')
    }));
    expect(afterOn.powerOn, 'clicking the Powered button while OFF should switch power on').toBeTruthy();
    expect(afterOn.plantOn, 'toggleAllPower should have reactivated the plant').toBeTruthy();
  });

  test('the button label follows the live status (ON / OFF / TRIPPED) and the tooltip still renders', async ({ game }) => {
    await game.withMods((m) => {
      // The stat3 tooltip content is only written while basicPowerGeneration is
      // unlocked (ui.js statToolBarCustomizations), so stage the tech the way a
      // real run has it by the time this button exists.
      m.cg.setTechUnlockedArray('basicPowerGeneration');
      m.rdo.setResourceDataObject(3, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.addBuildingPotentialRate('powerPlant1');
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      m.rdo.setResourceDataObject(1000, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(1_000_000, 'resources', ['carbon', 'storageCapacity']);
      m.cg.setPowerOnOff(true);
    });

    const button = game.page.locator('#stat3');
    await expect(button).toHaveRole('button');

    // The per-frame powerOnOrOffChecks() rewrites the label; give it a beat.
    await game.page.waitForTimeout(400);
    const onLabel = (await button.textContent())?.trim().toUpperCase();
    expect(onLabel, 'label should read ON while powered').toContain('ON');

    await button.click();
    await game.page.waitForTimeout(400);
    const offLabel = (await button.textContent())?.trim().toUpperCase();
    expect(offLabel, 'label should read OFF after toggling off').toContain('OFF');

    // The stat tooltip is still attached to the stat cell and renders the
    // power status line (tooltipPowerStatusLabel) on hover.
    const tooltipVisible = await game.page.evaluate(() => {
      const cell = document.getElementById('stat3')?.closest('.stat-cell');
      if (!cell) return false;
      cell.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      const tooltip = document.getElementById('stat-tooltip');
      return !!tooltip && tooltip.style.display === 'block' && tooltip.innerHTML.length > 0;
    });
    expect(tooltipVisible, 'hovering the Powered stat cell should still show its tooltip').toBeTruthy();
  });

  test('the state survives a tab switch and re-render', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(3, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.addBuildingPotentialRate('powerPlant1');
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      m.rdo.setResourceDataObject(1000, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(1_000_000, 'resources', ['carbon', 'storageCapacity']);
      m.cg.setPowerOnOff(true);
    });

    const button = game.page.locator('#stat3');
    await button.click();
    const off = await game.withMods((m) => m.cg.getPowerOnOff());
    expect(off).toBeFalsy();

    // Switch to another tab and back; the stat bar is outside the tab content,
    // but the re-render must not resurrect the power state or the button.
    await game.openTab(1);
    await game.openTab(3);
    await game.openTab(1);

    const after = await game.withMods((m) => ({
      powerOn: m.cg.getPowerOnOff(),
      stillButton: document.getElementById('stat3')?.tagName === 'BUTTON'
    }));
    expect(after.powerOn, 'power should remain off after tab switches').toBeFalsy();
    expect(after.stillButton, '#stat3 should still be the toggle button after re-renders').toBeTruthy();
  });

  test('with a Dyson Sphere (infinite power) the button shows the status but cannot be clicked', async ({ game }) => {
    await game.withMods((m) => {
      m.cg.setInfinitePower(true);
      m.cg.setPowerOnOff(true);
    });

    const button = game.page.locator('#stat3');
    await expect(button).toHaveRole('button');
    // While inert the button must be lifted out of hit-testing entirely — no
    // hover highlight, no clicks. Assert the live computed style, because that
    // is what the browser's hit-testing actually obeys.
    expect(
      await button.evaluate((el) => getComputedStyle(el).pointerEvents),
      'the Powered button should not receive pointer events under a Dyson Sphere'
    ).toBe('none');
    expect(
      await button.evaluate((el) => el.getAttribute('aria-disabled')),
      'the Powered button should be marked aria-disabled under a Dyson Sphere'
    ).toBe('true');

    // A dispatched click stands in for a real one — a real click cannot even
    // land on a pointer-events:none element — and the click handler must no-op
    // it (defence in depth behind the hit-testing removal).
    await game.page.evaluate(() => {
      document.getElementById('stat3').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    const after = await game.withMods((m) => ({
      powerOn: m.cg.getPowerOnOff(),
      infinite: m.cg.getInfinitePower()
    }));
    expect(after.infinite).toBeTruthy();
    expect(after.powerOn, 'clicking must be a no-op under a Dyson Sphere').toBeTruthy();

    // The label still reflects the (always-on) status.
    await game.page.waitForTimeout(400);
    const label = (await button.textContent())?.trim().toUpperCase();
    expect(label, 'label should still show the ON status under a Dyson Sphere').toContain('ON');
  });

  test('with no power plants built the button shows its status but cannot be clicked', async ({ game }) => {
    // Fresh boot: no plant of any type exists yet. As with the Dyson Sphere,
    // the button is inert to the pointer — lifted out of hit-testing so it
    // cannot be hovered or clicked — rather than driving toggleAllPower through
    // an empty grid.
    const button = game.page.locator('#stat3');
    await expect(button).toHaveRole('button');
    // Assert the live computed style: that is what the browser's hit-testing
    // actually obeys.
    expect(
      await button.evaluate((el) => getComputedStyle(el).pointerEvents),
      'the Powered button should not receive pointer events with no plants built'
    ).toBe('none');
    expect(
      await button.evaluate((el) => el.getAttribute('aria-disabled')),
      'the Powered button should be marked aria-disabled with no plants built'
    ).toBe('true');

    // A dispatched click stands in for a real one — a real click cannot even
    // land on a pointer-events:none element — and the click handler must no-op
    // it (defence in depth behind the hit-testing removal).
    await game.page.evaluate(() => {
      document.getElementById('stat3').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    const after = await game.withMods((m) => ({
      powerOn: m.cg.getPowerOnOff(),
      builtPlants: ['powerPlant1', 'powerPlant2', 'powerPlant3'].map((key) =>
        m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'quantity']))
    }));
    expect(after.builtPlants.some((q) => q > 0), 'precondition: no plants built this run').toBe(false);
    expect(after.powerOn, 'clicking with no plants built must not switch power on').toBeFalsy();

    // Being inert must not take the hover tooltip down with it: stage the tech
    // that gates the tooltip content, then hover the stat cell — the tooltip
    // listeners live on the cell, which keeps receiving the pointer even while
    // the button itself is pointer-events:none.
    await game.withMods((m) => m.cg.setTechUnlockedArray('basicPowerGeneration'));
    await game.page.waitForTimeout(400);
    const tooltipVisible = await game.page.evaluate(() => {
      const cell = document.getElementById('stat3')?.closest('.stat-cell');
      if (!cell) return false;
      cell.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      const tooltip = document.getElementById('stat-tooltip');
      return !!tooltip && tooltip.style.display === 'block' && tooltip.innerHTML.length > 0;
    });
    expect(tooltipVisible, 'the inert Powered button must still show its tooltip on hover').toBeTruthy();

    // The very same click is live again the moment a plant exists: the guard
    // is about the empty state, not a permanently dead button.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(2, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.addBuildingPotentialRate('powerPlant1');
      m.rdo.setResourceDataObject(1000, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(1_000_000, 'resources', ['carbon', 'storageCapacity']);
    });
    // The per-frame sync restores pointer events as soon as a plant exists.
    await game.page.waitForFunction(
      () => getComputedStyle(document.getElementById('stat3')).pointerEvents !== 'none',
      null, { timeout: 5000 }
    );
    await button.click();
    const withPlant = await game.withMods((m) => m.cg.getPowerOnOff());
    expect(withPlant, 'clicking once a plant is built should switch power on').toBeTruthy();
  });
});