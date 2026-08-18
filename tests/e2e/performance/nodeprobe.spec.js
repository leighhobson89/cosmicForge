import { test, expect } from '../_harness/game-fixture.mjs';

test('probe idle node growth by tag/class', async ({ game }) => {
  test.setTimeout(180000);
  await game.boot();
  await game.prepareRunForStarshipLaunch();
  await game.openTab(1);
  await game.page.waitForTimeout(10000);

  const census = () => game.page.evaluate(() => {
    const byTag = {}, byClass = {};
    for (const el of document.querySelectorAll('*')) {
      byTag[el.tagName] = (byTag[el.tagName] || 0) + 1;
      for (const c of el.classList) byClass[c] = (byClass[c] || 0) + 1;
    }
    return { total: document.querySelectorAll('*').length, byTag, byClass };
  });

  const before = await census();
  await game.page.waitForTimeout(10000);
  const after = await census();

  const delta = (a, b) => Object.entries(b)
    .map(([k, v]) => [k, v - (a[k] || 0)])
    .filter(([, d]) => d !== 0)
    .sort((x, y) => y[1] - x[1])
    .slice(0, 15);

  console.log('TOTAL', before.total, '->', after.total);
  console.log('BY TAG', JSON.stringify(delta(before.byTag, after.byTag)));
  console.log('BY CLASS', JSON.stringify(delta(before.byClass, after.byClass)));
  expect(true).toBe(true);
});
