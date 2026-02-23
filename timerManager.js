//---------------------------------------------------------------------------------------------------------
class TimerManager {
    constructor() {
        this.timers = new Map();
    }

    addTimer(key, duration, onExpire) {
        if (this.timers.has(key)) {
            return;
        }
        const timer = new Timer(duration, onExpire);
        this.timers.set(key, timer);
        timer.start();
    }

    removeTimer(key) {
        if (this.timers.has(key)) {
            this.timers.get(key).stop();
            this.timers.delete(key);
        }
    }

    stopAllTimers() {
        this.timers.forEach(timer => timer.stop());
    }

    getTimer(key) {
        return this.timers.get(key);
    }
}

class Timer {
    constructor(duration, onExpire) {
        this.duration = duration;
        this.onExpire = onExpire;
        this.timerId = null;
        this.elapsedTime = 0;
        this.isPaused = false;
    }

    start() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.timerId = setInterval(() => {
                this.elapsedTime += this.duration;
                this.onExpire();
            }, this.duration);
        }
    }

    stop() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    pause() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.isPaused = true;
        }
    }

    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.timerId = setInterval(() => {
                this.elapsedTime += this.duration;
                this.onExpire();
            }, this.duration);
        }
    }
}

export const timerManager = new TimerManager();