//---------------------------------------------------------------------------------------------------------
class DeltaTimer {
    constructor({
        id,
        durationMs = 0,
        repeat = false,
        autoStart = true,
        onTick = null,
        onUpdate = null,
        onComplete = null,
        metadata = {}
    }) {
        this.id = id;
        this.durationMs = durationMs;
        this.repeat = repeat;
        this.onTick = onTick;
        this.onUpdate = onUpdate;
        this.onComplete = onComplete;
        this.metadata = metadata;
        this.elapsedMs = 0;
        this.paused = !autoStart;
        this.markedForRemoval = false;
    }

    update(deltaMs) {
        if (this.paused || this.markedForRemoval) {
            return false;
        }

        this.triggerUpdate(deltaMs);

        if (this.durationMs === 0) {
            this.triggerTick();
            if (!this.repeat) {
                this.complete();
                return true;
            }
            return false;
        }

        this.elapsedMs += deltaMs;

        let completed = false;
        while (this.elapsedMs >= this.durationMs && !this.markedForRemoval) {
            this.elapsedMs -= this.durationMs;
            this.triggerTick();

            if (!this.repeat) {
                this.complete();
                completed = true;
                break;
            }
        }

        return completed;
    }

    triggerTick() {
        if (typeof this.onTick === 'function') {
            this.onTick({ id: this.id, metadata: this.metadata });
        }
    }

    triggerUpdate(deltaMs) {
        if (typeof this.onUpdate === 'function') {
            this.onUpdate({ id: this.id, metadata: this.metadata, deltaMs });
        }
    }

    complete() {
        if (typeof this.onComplete === 'function') {
            this.onComplete({ id: this.id, metadata: this.metadata });
        }
        this.markedForRemoval = true;
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    stop() {
        this.markedForRemoval = true;
    }
}

class TimerManagerDelta {
    constructor() {
        this.timers = new Map();
        this.lastUpdateTime = null;
        this.postUpdateHooks = [];
    }

    /**
     * Register work that must run immediately after every timer has been
     * advanced, in the same time step and with the same delta.
     *
     * P9's production allocation needs this. It reads what the material timers
     * produced this step and divides it, so it has to run after all of them and
     * before anything else observes the result. Two other placements were tried
     * and are wrong:
     *
     *   - as a timer of its own, relying on `Map` insertion order. Material
     *     timers are registered lazily as materials unlock, so a timer added
     *     later would run *after* the pass that is supposed to consume it.
     *   - in the animation-frame loop, after `updateWithTimestamp`. That works
     *     in the browser but silently decouples the two: anything that advances
     *     the timers directly - offline catch-up, and every e2e spec, which
     *     drives `update()` rather than the frame loop - then injects production
     *     that no allocation pass ever sees in the same step.
     *
     * A hook here is the only placement that holds for all three callers.
     */
    addPostUpdateHook(hook) {
        if (typeof hook === 'function' && !this.postUpdateHooks.includes(hook)) {
            this.postUpdateHooks.push(hook);
        }
    }

    removePostUpdateHook(hook) {
        this.postUpdateHooks = this.postUpdateHooks.filter(entry => entry !== hook);
    }

    addTimer(id, options = {}) {
        if (this.timers.has(id)) {
            return this.timers.get(id);
        }
        const timer = new DeltaTimer({ id, ...options });
        this.timers.set(id, timer);
        return timer;
    }

    removeTimer(id) {
        const timer = this.timers.get(id);
        if (timer) {
            timer.stop();
            this.timers.delete(id);
        }
    }

    pauseTimer(id) {
        const timer = this.timers.get(id);
        timer?.pause();
    }

    resumeTimer(id) {
        const timer = this.timers.get(id);
        timer?.resume();
    }

    hasTimer(id) {
        return this.timers.has(id);
    }

    clear() {
        this.timers.forEach(timer => timer.stop());
        this.timers.clear();
    }

    update(deltaMs, multiplier = 1) {
        const effectiveMultiplier = (typeof multiplier === 'number' && Number.isFinite(multiplier) && multiplier > 0)
            ? multiplier
            : 1;
        const effectiveDeltaMs = deltaMs * effectiveMultiplier;

        // No time passed, or nothing to advance: the post-update hooks are
        // skipped too, deliberately. A pass over zero production would only
        // decay the smoothed rates against a delta that never happened.
        if (effectiveDeltaMs <= 0 || this.timers.size === 0) {
            return;
        }

        const timersToRemove = [];
        this.timers.forEach((timer, id) => {
            const completed = timer.update(effectiveDeltaMs);
            if (completed || timer.markedForRemoval) {
                timersToRemove.push(id);
            }
        });

        timersToRemove.forEach(id => this.timers.delete(id));

        this.postUpdateHooks.forEach(hook => hook(effectiveDeltaMs));
    }

    /**
     * Advance every timer, and return the *effective* delta the timers were
     * advanced by - real elapsed time multiplied by any time warp in force.
     *
     * P9's allocation pass runs immediately after this call and has to agree
     * with the timers about how much time passed, or the per-second figures it
     * publishes would be wrong by the warp multiplier every time a black hole
     * was running. Returns 0 on the first call, when there is no previous
     * timestamp to measure from and no timer has been advanced.
     */
    updateWithTimestamp(currentTime, multiplier = 1) {
        if (this.lastUpdateTime === null) {
            this.lastUpdateTime = currentTime;
            return 0;
        }

        const deltaMs = Math.max(0, currentTime - this.lastUpdateTime);
        this.lastUpdateTime = currentTime;
        this.update(deltaMs, multiplier);

        const effectiveMultiplier = (typeof multiplier === 'number' && Number.isFinite(multiplier) && multiplier > 0)
            ? multiplier
            : 1;
        return deltaMs * effectiveMultiplier;
    }

    resetTimestamp(currentTime = null) {
        this.lastUpdateTime = currentTime;
    }
}

export const timerManagerDelta = new TimerManagerDelta();
export { TimerManagerDelta, DeltaTimer };
