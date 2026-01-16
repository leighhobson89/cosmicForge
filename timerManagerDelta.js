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

    /**
     * Advance the timer by delta milliseconds.
     * Returns true if the timer completed this update.
     */
    update(deltaMs) {
        if (this.paused || this.markedForRemoval) {
            return false;
        }

        this.triggerUpdate(deltaMs);

        // Timers with duration 0 behave as immediate callbacks.
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

    /**
     * Update all timers with the provided delta (in milliseconds).
     */
    update(deltaMs, multiplier = 1) {
        const effectiveMultiplier = (typeof multiplier === 'number' && Number.isFinite(multiplier) && multiplier > 0)
            ? multiplier
            : 1;
        const effectiveDeltaMs = deltaMs * effectiveMultiplier;

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
    }

    /**
     * Helper for driving the manager using performance.now() timestamps.
     */
    updateWithTimestamp(currentTime, multiplier = 1) {
        if (this.lastUpdateTime === null) {
            this.lastUpdateTime = currentTime;
            return;
        }

        const deltaMs = Math.max(0, currentTime - this.lastUpdateTime);
        this.lastUpdateTime = currentTime;
        this.update(deltaMs, multiplier);
    }
}

export const timerManagerDelta = new TimerManagerDelta();
export { TimerManagerDelta, DeltaTimer };
