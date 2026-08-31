/**
 * Area: Notifications — stack layout, the storage row, and Clear All
 * Plan: docs/player-feedback-improvement-plan.md (P6)
 *
 * Notifications used to spread *horizontally*: one fixed container per
 * classification, each positioned by hand at `BASE_RIGHT + index * STACK_WIDTH`,
 * so a busy moment laid four 200px-wide columns across the bottom of the screen
 * on top of whatever the player was reading, and each column reserved a
 * full-width strip that swallowed clicks meant for the game underneath. P6 turns
 * the stack on its side: one bottom-right anchored column, classifications
 * stacking *upward*, and pointer events only on the notification card itself.
 *
 * Three properties are worth pinning, and each has its own describe below.
 *
 * 1. **The column.** Every classification row shares the same right edge and
 *    differs only in how far up the column it sits. The oldest row holds the
 *    corner, and when a row's timer takes it away the rows above it fall back
 *    towards the corner. Past four rows a classification keeps its queue rather
 *    than drawing off the bottom of the screen.
 *
 * 2. **Three classifications are deliberate exceptions.** `storage`, `debug` and
 *    `achievement` all fire in bursts where each message is worth reading on its
 *    own: a storage-full toast carries its own claim, a cheat press often sets
 *    off several messages at once, and achievements unlock in groups. Those
 *    three spread their cards *along* their row, newest on the right, older ones
 *    sliding left. Every other classification still shows one card at a time.
 *
 * 3. **Clear All is safe.** It takes one classification's row and queue away and
 *    leaves the others alone, and — because P5 made storage eligibility derive
 *    from the data object rather than from a visible button — an earned increase
 *    survives having its notification cleared.
 *
 * A fourth describe covers the visual half of P6: the card surface used to be
 * `--tab-bg-color`, which is `rgba(255,255,255,0.04)` in several themes, so the
 * game showed straight through the notification. Every shipped theme is checked
 * for an opaque card.
 *
 * **On how notifications are raised here.** Wherever a real player action
 * produces the notification cheaply, that is what the spec does: stores are
 * filled by running real tier 1 autobuyers until production crosses the cap, the
 * storage summary comes from pressing the real header button, and the debug row
 * comes from a real debug-menu press. The specs that need six classifications on
 * screen at once, in a known order, with known timeouts, post through
 * `showNotification` — that *is* the game's own entry point for a notification
 * and the subject under test is the stack it feeds, not the events that call it.
 * Staging six real, simultaneous, differently-classified game events to assert a
 * geometry would test the events rather than the layout.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 180_000 });

/**
 * The two caps are read from the game rather than mirrored here.
 *
 * `MAX_STACKS` (rows in the column) and `MAX_NOTIFICATION_COLUMNS` (cards in a
 * multi-card row) are tuning knobs in `constantsAndGlobalVars.js`, and turning
 * one of them up is a deliberate act that should not fail a spec whose subject
 * is the *rule*, not the number. Every assertion below is written against the
 * live values.
 */
async function stackLimits(game) {
  return game.withMods((m) => ({
    rows: m.cg.MAX_STACKS,
    columns: m.cg.MAX_NOTIFICATION_COLUMNS,
    multi: m.cg.MULTI_NOTIFICATION_CLASSIFICATIONS.slice()
  }));
}

/** Every theme the Settings dropdown offers. */
const THEMES = ['terminal', 'dark', 'misty', 'light', 'frosty', 'summer', 'supernova', 'galaxy', 'space'];


// --------------------------------------------------------------------- helpers

/**
 * Read the whole stack: every classification row, whether it is drawn, its
 * geometry, and the geometry of each card inside it.
 *
 * Rounded to whole pixels because sub-pixel layout differences between rows are
 * noise, and every assertion here is about alignment rather than exact position.
 */
async function readStack(game) {
  return game.page.evaluate(() => {
    const root = document.getElementById('notificationStackRoot');
    const rows = Array.from(document.querySelectorAll('.notification-container')).map((container) => {
      const classification = Array.from(container.classList)
        .find((name) => name.startsWith('classification-'))
        ?.slice('classification-'.length) ?? null;
      const rect = container.getBoundingClientRect();
      const cards = Array.from(container.querySelectorAll('.notification')).map((card) => {
        const cardRect = card.getBoundingClientRect();
        const style = window.getComputedStyle(card);
        return {
          text: (card.querySelector('.notification-content')?.textContent || '').trim(),
          left: Math.round(cardRect.left),
          right: Math.round(cardRect.right),
          bottom: Math.round(cardRect.bottom),
          width: Math.round(cardRect.width),
          pointerEvents: style.pointerEvents,
          backgroundColor: style.backgroundColor,
          dismissing: card.classList.contains('notification-dismissing')
        };
      });
      return {
        classification,
        drawn: window.getComputedStyle(container).display !== 'none',
        deferred: container.classList.contains('notification-container-deferred'),
        pointerEvents: window.getComputedStyle(container).pointerEvents,
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
        top: Math.round(rect.top),
        cards
      };
    });

    return {
      rootExists: !!root,
      rootPointerEvents: root ? window.getComputedStyle(root).pointerEvents : null,
      rootFlexDirection: root ? window.getComputedStyle(root).flexDirection : null,
      rows
    };
  });
}

/**
 * Only the rows the player can actually see, bottom-most first.
 *
 * `only` narrows the result to the classifications a spec staged. The game
 * raises notifications of its own while a spec runs — a weather turn is the
 * common one — and a spec asserting the shape of the column it built should not
 * fail because the sky clouded over mid-run.
 */
function drawnRows(stack, only = null) {
  return stack.rows
    .filter((row) => row.drawn && row.cards.some((card) => !card.dismissing))
    .filter((row) => !only || only.includes(row.classification))
    .sort((a, b) => b.bottom - a.bottom);
}

/** The live classification order — index 0 holds the corner. */
async function classificationOrder(game) {
  return game.withMods((m) => m.cg.getClassificationOrder().slice());
}

/** How many notifications a classification still has waiting behind what is drawn. */
async function queueLength(game, classification) {
  return game.withMods(
    (m, cls) => (m.cg.getNotificationQueues()?.[cls] ?? []).length,
    classification
  );
}

/**
 * Post a notification through the game's own notification entry point.
 *
 * Used only by the geometry specs, which need several classifications on screen
 * at once with known text and known timeouts. See the file header.
 */
async function post(game, { message, type = 'info', time = 30000, classification }) {
  await game.withMods((m, item) => {
    m.ui.showNotification(item.message, item.type, item.time, item.classification);
  }, { message, type, time, classification });
  await game.page.waitForTimeout(120);
}

/**
 * Take every notification off the screen using the game's own Clear All control.
 *
 * Boot itself raises notifications (the cloud-load result among them), so a spec
 * that means to assert on a stack it staged has to start from an empty one. The
 * press is dispatched rather than driven through the mouse because the Clear All
 * button is hidden behind `opacity: 0` until the card is hovered; the spec that
 * is actually *about* Clear All hovers first and clicks for real.
 */
async function clearEveryNotification(game) {
  await expect.poll(async () => game.page.evaluate(() => {
    const buttons = document.querySelectorAll(
      '.notification-container .notification-button:not(.notification-action-button)'
    );
    buttons.forEach((button) => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    return document.querySelectorAll('.notification-container .notification').length;
  }), { timeout: 20000 }).toBe(0);
  await game.page.waitForTimeout(300);
}

/**
 * Stage a resource so that real tier 1 production will cross its cap shortly.
 *
 * Tier 1 autobuyers deliberately need no power, so this runs on a bare new game
 * with the grid down. Five of them is 10 units a second, so a 20 unit gap closes
 * in about two seconds and the storage-full toast is raised by the production
 * path, not by the spec.
 */
async function stageStoreAboutToFill(game, key, { capacity = 120, gap = 20 } = {}) {
  await game.withMods((m, item) => {
    // setUnlockedResourcesArray unshifts unconditionally, and hydrogen is
    // already in the array on a new game — a duplicate entry would make the
    // eligibility sweep offer the same claim twice.
    if (!m.cg.getUnlockedResourcesArray().includes(item.key)) {
      m.cg.setUnlockedResourcesArray(item.key);
    }
    m.rdo.setResourceDataObject(true, 'resources', [item.key, 'revealedYet']);
    m.rdo.setResourceDataObject(item.capacity, 'resources', [item.key, 'storageCapacity']);
    m.rdo.setResourceDataObject(item.capacity - item.gap, 'resources', [item.key, 'quantity']);
    m.rdo.setResourceDataObject(true, 'resources', [item.key, 'upgrades', 'autoBuyer', 'tier1', 'active']);
    m.rdo.setResourceDataObject(5, 'resources', [item.key, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
  }, { key, capacity, gap });
}

/** Wait until the storage row is showing a card for each of `keys`. */
async function waitForStorageToasts(game, keys) {
  await expect.poll(async () => game.page.evaluate((names) => {
    const cards = Array.from(document.querySelectorAll(
      '.notification-container.classification-storage .notification'
    ));
    const texts = cards.map((card) => (card.textContent || '').toLowerCase());
    return names.filter((name) => texts.some((text) => text.includes(name.toLowerCase()))).length;
  }, keys), { timeout: 40000 }).toBe(keys.length);
}


// ------------------------------------------------------- the vertical stack

test.describe('Notifications — the stack runs up the bottom-right corner', () => {
  test('classification rows share a right edge and differ only in height', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    // Three real classifications, each raised the way the game raises it.
    //
    //   storage         — real tier 1 production crossing a real storage cap
    //   storageIncreased— the real "Storage All" header button claiming it
    //   debug           — a real press of the debug menu's "Give $1B"
    await stageStoreAboutToFill(game, 'hydrogen');
    await waitForStorageToasts(game, ['hydrogen']);

    await game.page.evaluate(() => {
      document.getElementById('increaseAllStorageResourcesButton')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.debugClick('give1BButton');
    await game.page.waitForTimeout(400);

    const stack = await readStack(game);
    const rows = drawnRows(stack);

    expect(stack.rootExists, 'the stack has a single root').toBe(true);
    expect(
      stack.rootFlexDirection,
      'column-reverse is what puts the first classification in the corner and the rest above it'
    ).toBe('column-reverse');

    expect(rows.length, 'three classifications were raised, three rows are drawn').toBeGreaterThanOrEqual(3);

    // The whole point of P6: one column, not four.
    const rightEdges = new Set(rows.map((row) => row.right));
    expect(
      [...rightEdges],
      'every row is flush to the same right edge — nothing spreads sideways any more'
    ).toHaveLength(1);

    const bottoms = rows.map((row) => row.bottom);
    expect(
      new Set(bottoms).size,
      'and each row sits at its own height, so none of them overlap'
    ).toBe(bottoms.length);

    // Sorted bottom-most first, so each row must sit clear of the one below it.
    for (let i = 1; i < rows.length; i++) {
      expect(
        rows[i].bottom,
        `row ${i} (${rows[i].classification}) sits above row ${i - 1} (${rows[i - 1].classification})`
      ).toBeLessThanOrEqual(rows[i - 1].top);
    }
  });

  test('the oldest classification holds the corner and later ones stack above it', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    await post(game, { message: 'stack-first', classification: 'weather' });
    await post(game, { message: 'stack-second', classification: 'tech' });
    await post(game, { message: 'stack-third', classification: 'special' });

    const staged = ['weather', 'tech', 'special'];
    const rows = drawnRows(await readStack(game), staged);
    expect(rows.map((row) => row.classification)).toEqual(staged);
  });

  test('a row that times out lets the rows above it fall towards the corner', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    // The bottom row is given a short life; the one above it outlives it.
    await post(game, { message: 'short-lived', classification: 'weather', time: 2000 });
    await post(game, { message: 'long-lived', classification: 'tech', time: 60000 });

    const staged = ['weather', 'tech'];
    const before = drawnRows(await readStack(game), staged);
    expect(before.map((row) => row.classification)).toEqual(staged);
    const cornerBottom = before[0].bottom;
    expect(before[1].bottom, 'the survivor starts above the corner').toBeLessThan(cornerBottom);

    await expect
      .poll(async () => drawnRows(await readStack(game), staged).length, { timeout: 20000 })
      .toBe(1);

    const after = drawnRows(await readStack(game), staged);
    expect(after[0].classification).toBe('tech');
    expect(after[0].bottom, 'and drops into the corner the expired row vacated').toBe(cornerBottom);
    expect(after[0].right, 'without moving sideways').toBe(before[1].right);
  });

  test('past four classifications the extras keep their queue instead of drawing', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    const { rows: MAX_STACKS } = await stackLimits(game);

    // Two more classifications than the column has rows for.
    const classifications = ['weather', 'tech', 'special', 'battle', 'rocket', 'starMap', 'fuse', 'general']
      .slice(0, MAX_STACKS + 2);
    for (const classification of classifications) {
      await post(game, { message: `capped-${classification}`, classification, time: 60000 });
    }

    // Asserted against the game's own classification order rather than against
    // the list above, so a notification the game raised for its own reasons
    // mid-spec shifts the boundary instead of failing the spec. The rule under
    // test is positional: everything from index MAX_STACKS on is held back.
    const order = await classificationOrder(game);
    const stack = await readStack(game);

    expect(drawnRows(stack).length, 'the column never draws more rows than the cap allows')
      .toBeLessThanOrEqual(MAX_STACKS);
    expect(order.length, 'two more classifications than there are rows were raised')
      .toBeGreaterThanOrEqual(classifications.length);

    const overTheCap = order.slice(MAX_STACKS);
    expect(overTheCap.length, 'so at least two of them are over the cap').toBeGreaterThanOrEqual(2);

    for (const classification of overTheCap) {
      const row = stack.rows.find((entry) => entry.classification === classification);
      expect(row.deferred, `${classification} is marked as held back`).toBe(true);
      expect(row.drawn, `${classification} draws nothing while it is over the cap`).toBe(false);
      expect(row.cards, `${classification} has not built a card either`).toEqual([]);
      // Genuinely queued, not dropped.
      expect(await queueLength(game, classification), `${classification} kept its message`).toBe(1);
    }

    // Free the corner row and the first classification waiting behind the cap
    // takes the slot that opens up.
    const first = order[0];
    const next = overTheCap[0];
    await game.page.evaluate((classification) => {
      document
        .querySelector(`.notification-container.classification-${classification} .notification-button:not(.notification-action-button)`)
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, first);
    await game.page.waitForTimeout(500);

    const promoted = drawnRows(await readStack(game)).map((row) => row.classification);
    expect(promoted, 'the freed row goes to whichever classification was waiting longest')
      .toContain(next);
    expect(await queueLength(game, next), 'and its queue is spent').toBe(0);
  });

  test('only the notification card takes pointer events', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    // A short card, so the strip to its left is measurably empty rather than
    // covered by a taller neighbour.
    await post(game, { message: 'pointer-probe', classification: 'weather', time: 60000 });

    const stack = await readStack(game);
    const row = drawnRows(stack)[0];

    expect(stack.rootPointerEvents, 'the stack root is inert').toBe('none');
    expect(row.pointerEvents, 'so is the classification row').toBe('none');
    expect(row.cards[0].pointerEvents, 'only the card itself is live').toBe('auto');

    // The old layout reserved a 200px-wide strip per classification the full
    // height of the screen. Probe a point level with the card but well to the
    // left of it: whatever answers there must not belong to the stack.
    const hit = await game.page.evaluate((probe) => {
      const el = document.elementFromPoint(probe.x, probe.y);
      if (!el) return { inStack: false, tag: null };
      return {
        inStack: !!el.closest('#notificationStackRoot'),
        tag: el.tagName
      };
    }, { x: Math.max(5, row.cards[0].left - 60), y: row.cards[0].bottom - 20 });

    expect(hit.inStack, 'the space beside a notification belongs to the game, not the stack').toBe(false);
  });
});


// ------------------------------------------------- the storage row exception

test.describe('Notifications — the multi-card rows show every message at once', () => {
  test('three stores filling by real production give three cards in one row', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    // Real production into real caps. Tier 1 autobuyers need no power, so this
    // works on a bare new game with the grid still down.
    await stageStoreAboutToFill(game, 'hydrogen');
    await stageStoreAboutToFill(game, 'helium');
    await stageStoreAboutToFill(game, 'carbon');

    await waitForStorageToasts(game, ['hydrogen', 'helium', 'carbon']);

    const storage = (await readStack(game)).rows.find((row) => row.classification === 'storage');
    const cards = storage.cards.filter((card) => !card.dismissing);

    expect(cards.length, 'all three claims are on screen together').toBeGreaterThanOrEqual(3);

    // One row: same bottom edge, different horizontal positions.
    expect(new Set(cards.map((card) => card.bottom)).size, 'the cards share a row').toBe(1);
    expect(new Set(cards.map((card) => card.right)).size, 'and each has its own column')
      .toBe(cards.length);

    // The row is right-anchored like every other row in the column.
    const rows = drawnRows(await readStack(game));
    const otherRow = rows.find((row) => row.classification !== 'storage');
    if (otherRow) {
      expect(
        storage.right,
        'the storage row still ends flush right; it grows leftwards, it does not move'
      ).toBe(otherRow.right);
    }

    // Every card carries its own live claim — that is the reason this row
    // exists rather than queueing one behind the other.
    const liveClaims = await game.page.evaluate(() => Array.from(document.querySelectorAll(
      '.notification-container.classification-storage .notification'
    )).filter((card) => {
      const button = card.querySelector('button.notification-action-button');
      return !!button && !button.disabled;
    }).length);
    expect(liveClaims, 'each card offers its own storage increase').toBeGreaterThanOrEqual(3);
  });

  test('the newest storage card sits on the right and the older ones slide left', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    // Posted in a known order, which real production cannot guarantee.
    await post(game, { message: 'first storage', classification: 'storage', time: 60000 });
    await post(game, { message: 'second storage', classification: 'storage', time: 60000 });
    await post(game, { message: 'third storage', classification: 'storage', time: 60000 });

    const storage = (await readStack(game)).rows.find((row) => row.classification === 'storage');
    const byPosition = storage.cards
      .filter((card) => !card.dismissing)
      .sort((a, b) => a.left - b.left)
      .map((card) => card.text);

    expect(byPosition, 'oldest on the left, newest on the right')
      .toEqual(['first storage', 'second storage', 'third storage']);
  });

  test('the storage row fills to its column cap and queues the rest', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    const { columns } = await stackLimits(game);
    const total = columns + 2;

    // Posted in one page call so the whole burst lands inside a single frame -
    // otherwise the first card's timer can expire mid-sequence and the row is
    // measured while it is refilling.
    await game.withMods((m, count) => {
      // The first card is given a short life so its timer frees a column later
      // in the spec; the rest outlive every assertion.
      m.ui.showNotification('storage card 1', 'info', 2500, 'storage');
      for (let i = 2; i <= count; i++) {
        m.ui.showNotification(`storage card ${i}`, 'info', 120000, 'storage');
      }
    }, total);
    await game.page.waitForTimeout(200);

    const storage = (await readStack(game)).rows.find((row) => row.classification === 'storage');
    const cards = storage.cards.filter((card) => !card.dismissing);

    expect(cards.length, 'the row fills to its column cap and no further').toBe(columns);
    expect(await queueLength(game, 'storage'), 'the rest are queued, not dropped').toBe(2);

    // A full row of cards plus their gaps must still fit a desktop viewport.
    // Measured off the cards rather than the container, whose own box is capped
    // and so reads as on-screen even when its contents are not.
    const viewport = game.page.viewportSize();
    expect(Math.min(...cards.map((card) => card.left)), 'the oldest card is still on screen')
      .toBeGreaterThanOrEqual(0);
    expect(Math.max(...cards.map((card) => card.right)), 'and so is the newest')
      .toBeLessThanOrEqual(viewport.width);
    expect(new Set(cards.map((card) => card.bottom)).size, 'and it is one row, not two').toBe(1);

    // When the first card's timer takes it, the next one slides in from the
    // right immediately — it does not wait out the outgoing card's fade.
    await expect.poll(async () => queueLength(game, 'storage'), { timeout: 20000 }).toBe(1);

    const refilled = (await readStack(game)).rows.find((row) => row.classification === 'storage');
    const live = refilled.cards.filter((card) => !card.dismissing);
    expect(live.length, 'the row is full again').toBe(columns);

    const expected = [];
    for (let i = 2; i <= columns + 1; i++) expected.push(`storage card ${i}`);
    expect(
      live.sort((a, b) => a.left - b.left).map((card) => card.text),
      'the card that was waiting arrives on the right and the others have shuffled left'
    ).toEqual(expected);
  });

  test('a burst of cheats fills the debug row rather than queueing behind a timer', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    // Real presses of the real debug menu. Each of these raises its own
    // notification, and a developer pressing three in a row wants to see all
    // three - which is why 'debug' is a multi-card row.
    await game.debugClick('give1BButton');
    await game.debugClick('grantAllTechsButton');
    await game.debugClick('add10AsteroidsButton');
    await game.page.waitForTimeout(500);

    const debugRow = (await readStack(game)).rows.find((row) => row.classification === 'debug');
    const cards = debugRow.cards.filter((card) => !card.dismissing);

    expect(cards.length, 'all three cheat messages are on screen at once').toBeGreaterThanOrEqual(3);
    expect(new Set(cards.map((card) => card.bottom)).size, 'sharing one row').toBe(1);
    expect(new Set(cards.map((card) => card.right)).size, 'each in its own column').toBe(cards.length);
    expect(await queueLength(game, 'debug'), 'nothing was left waiting').toBe(0);
  });

  test('achievements unlocked together are shown together', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    // "Give $1B" crosses every cash threshold at once, so the achievement check
    // grants several achievements in the same frame - the exact burst that used
    // to hide all but the first behind a four-second timer.
    await game.debugClick('give1BButton');
    await game.page.waitForTimeout(1200);

    const row = (await readStack(game)).rows.find((entry) => entry.classification === 'achievement');
    expect(row, 'achievements have a row of their own, not the default catch-all').toBeTruthy();

    const cards = row.cards.filter((card) => !card.dismissing);
    expect(cards.length, 'several achievements are shown side by side').toBeGreaterThan(1);
    expect(new Set(cards.map((card) => card.bottom)).size, 'sharing one row').toBe(1);
    expect(
      new Set(cards.map((card) => card.right)).size,
      'each in its own column, newest on the right'
    ).toBe(cards.length);
  });

  test('every other classification still shows one card at a time', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    await post(game, { message: 'tech one', classification: 'tech', time: 60000 });
    await post(game, { message: 'tech two', classification: 'tech', time: 60000 });
    await post(game, { message: 'tech three', classification: 'tech', time: 60000 });

    const tech = (await readStack(game)).rows.find((row) => row.classification === 'tech');
    expect(tech.cards.filter((card) => !card.dismissing).length, 'one at a time, on the queue timer').toBe(1);
    expect(tech.cards[0].text).toBe('tech one');
    expect(await queueLength(game, 'tech'), 'the other two wait their turn').toBe(2);
  });

  test('a claim taken elsewhere disables the right card, not whichever one is showing', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    // Before P6 the storage row held a single card, and the routine that spends
    // a claim looked at *that* card. With several on screen it has to find the
    // one that names the store, or a claim taken from the header pane silently
    // leaves a live button on a spent claim.
    await stageStoreAboutToFill(game, 'hydrogen');
    await stageStoreAboutToFill(game, 'helium');
    await waitForStorageToasts(game, ['hydrogen', 'helium']);

    // Stop production so the stores stay put, then claim helium from the header.
    await game.withMods((m) => {
      ['hydrogen', 'helium'].forEach((key) => {
        m.rdo.setResourceDataObject(0, 'resources', [key, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      });
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
    });
    await game.page.waitForTimeout(400);

    await game.page.evaluate(() => {
      document.getElementById('increaseAllStorageResourcesButton')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(700);

    const buttons = await game.page.evaluate(() => Array.from(document.querySelectorAll(
      '.notification-container.classification-storage .notification'
    )).map((card) => ({
      text: (card.querySelector('.notification-content')?.textContent || '').toLowerCase(),
      spent: !!card.querySelector('button.notification-action-button')?.disabled
    })));

    const helium = buttons.find((entry) => entry.text.includes('helium'));
    const hydrogen = buttons.find((entry) => entry.text.includes('hydrogen'));

    expect(helium, 'the helium card is still on screen').toBeTruthy();
    expect(helium.spent, 'and its claim reads as spent, because the header took it').toBe(true);
    expect(hydrogen, 'the hydrogen card is on screen too').toBeTruthy();
    expect(hydrogen.spent, 'and is untouched — it was never claimable, so nothing spent it').toBe(false);
  });
});


// -------------------------------------------------------------- Clear All

test.describe('Notifications — Clear All', () => {
  test('clears one classification and leaves the others standing', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    await post(game, { message: 'weather stays', classification: 'weather', time: 60000 });
    await post(game, { message: 'tech goes', classification: 'tech', time: 60000 });
    await post(game, { message: 'tech goes too', classification: 'tech', time: 60000 });
    await post(game, { message: 'special stays', classification: 'special', time: 60000 });

    // Driven for real: hover the card so the button becomes visible and
    // clickable, then click it as a player would.
    const card = game.page.locator('.notification-container.classification-tech .notification').first();
    await card.hover();
    await card.locator('.notification-button:not(.notification-action-button)').click();
    await game.page.waitForTimeout(500);

    const staged = ['weather', 'tech', 'special'];
    const rows = drawnRows(await readStack(game), staged).map((row) => row.classification);
    expect(rows, 'the cleared classification is gone').not.toContain('tech');
    expect(rows, 'its neighbours are untouched').toEqual(['weather', 'special']);
    expect(await queueLength(game, 'tech'), 'and it took its queue with it').toBe(0);

    // The queue key is deleted rather than emptied. An empty-but-present key
    // satisfies the "have I seen this classification before" guard in
    // showNotification, so the next notification of a cleared type would be
    // pushed onto a queue whose row no longer exists and never be seen again.
    await post(game, { message: 'tech again', classification: 'tech', time: 60000 });
    const reopened = drawnRows(await readStack(game), staged).map((row) => row.classification);
    expect(reopened, 'a cleared classification can raise a notification again').toContain('tech');
  });

  test('clearing a classification closes the column up', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    await post(game, { message: 'corner', classification: 'weather', time: 60000 });
    await post(game, { message: 'above', classification: 'tech', time: 60000 });

    const staged = ['weather', 'tech'];
    const before = drawnRows(await readStack(game), staged);
    const cornerBottom = before[0].bottom;

    await game.page.evaluate(() => {
      document
        .querySelector('.notification-container.classification-weather .notification-button:not(.notification-action-button)')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(500);

    const after = drawnRows(await readStack(game), staged);
    expect(after.map((row) => row.classification)).toEqual(['tech']);
    expect(after[0].bottom, 'the survivor drops into the corner').toBe(cornerBottom);
  });

  test('an earned storage increase survives having its notification cleared', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    // This is the P6 regression, and it holds because of P5: eligibility is read
    // from the data object every frame, so the claim was never stored in the
    // notification that Clear All destroys.
    await stageStoreAboutToFill(game, 'hydrogen');
    await waitForStorageToasts(game, ['hydrogen']);

    await game.withMods((m) => {
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
    });

    const before = await game.withMods((m) => ({
      capacity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity'], true),
      quantity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity'], true)
    }));

    await game.page.evaluate(() => {
      document
        .querySelector('.notification-container.classification-storage .notification-button:not(.notification-action-button)')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(500);

    expect(
      (await readStack(game)).rows.some((row) => row.classification === 'storage' && row.drawn),
      'the storage row really is gone'
    ).toBe(false);

    // The header button is lit from state, so the claim is still offered.
    const gate = await game.page.evaluate(() => {
      const button = document.getElementById('increaseAllStorageResourcesButton');
      return button ? button.classList.contains('green-ready-text') : null;
    });
    expect(gate, 'the earned increase is still offered after Clear All').toBe(true);

    await game.page.evaluate(() => {
      document.getElementById('increaseAllStorageResourcesButton')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(700);

    const after = await game.withMods((m) => ({
      capacity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity'], true),
      quantity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity'], true)
    }));

    expect(after.capacity, 'and claiming it still doubles the store').toBe(before.capacity * 2);
    expect(after.quantity, 'charged in the material, all but the one unit left behind').toBe(1);
  });

  test('clearing a row lets a classification held behind the cap take its place', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    const { rows: MAX_STACKS } = await stackLimits(game);

    const classifications = ['weather', 'tech', 'special', 'battle', 'rocket', 'starMap', 'fuse']
      .slice(0, MAX_STACKS + 1);
    for (const classification of classifications) {
      await post(game, { message: `queued-${classification}`, classification, time: 60000 });
    }

    const order = await classificationOrder(game);
    const drawnClassification = order[MAX_STACKS - 1];
    const waiting = order[MAX_STACKS];

    expect(drawnRows(await readStack(game)).length).toBe(MAX_STACKS);
    expect(await queueLength(game, waiting), `${waiting} is the one over the cap`).toBe(1);

    const card = game.page
      .locator(`.notification-container.classification-${drawnClassification} .notification`)
      .first();
    await card.hover();
    await card.locator('.notification-button:not(.notification-action-button)').click();
    await game.page.waitForTimeout(500);

    const rows = drawnRows(await readStack(game)).map((row) => row.classification);
    expect(rows, 'the cleared classification is gone').not.toContain(drawnClassification);
    expect(rows, 'and the one that was waiting is drawn').toContain(waiting);
  });
});


// ----------------------------------------------------------- opaque surfaces

test.describe('Notifications — the card is opaque in every theme', () => {
  test('no theme lets the game show through a notification', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    await post(game, { message: 'opacity probe', classification: 'weather', time: 120000 });

    const seen = [];
    for (const theme of THEMES) {
      await game.withMods((m, name) => m.ui.selectTheme(name), theme);
      await game.page.waitForTimeout(120);

      const background = await game.page.evaluate(() => {
        const card = document.querySelector('.notification-container.classification-weather .notification');
        return card ? window.getComputedStyle(card).backgroundColor : null;
      });

      expect(background, `${theme} draws the card`).toBeTruthy();

      // getComputedStyle gives `rgb(...)` when opaque and `rgba(..., a)` when not.
      const alpha = background.startsWith('rgba')
        ? Number(background.replace(/^rgba\(|\)$/g, '').split(',')[3])
        : 1;
      expect(alpha, `${theme} must not draw a see-through notification`).toBe(1);
      seen.push(theme);
    }

    expect(seen, 'every shipped theme was checked').toEqual(THEMES);
  });

  test('the four notification types keep their colours', async ({ game }) => {
    await game.boot();
    await clearEveryNotification(game);

    // Same palette as before P6 — the change is the surface, the border and the
    // accent, not the colours the player learned to read at a glance.
    const expected = {
      success: 'rgb(40, 167, 69)',
      warning: 'rgb(255, 193, 7)',
      error: 'rgb(220, 53, 69)'
    };

    for (const [type, colour] of Object.entries(expected)) {
      await post(game, { message: `${type} probe`, type, classification: 'weather', time: 20000 });
      const background = await game.page.evaluate(() => {
        const card = document.querySelector('.notification-container.classification-weather .notification');
        return card ? window.getComputedStyle(card).backgroundColor : null;
      });
      expect(background, `a ${type} notification keeps its colour`).toBe(colour);
      await clearEveryNotification(game);
    }
  });
});
