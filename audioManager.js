import { getIsAntimatterBoostActive, getCurrentStarSystemWeatherEfficiency, getBackgroundAudio, getSfx } from "./constantsAndGlobalVars.js";

class WeatherAmbienceManager {
    constructor() {
        this.tracks = {};
    }

    play(key, filePath) {
        if (!this.tracks[key]) {
            const audio = new Audio(filePath);
            audio.volume = 0.3;
            audio.loop = true;
            this.tracks[key] = audio;
        }
        this.tracks[key].play().catch(error => {
            console.error(`Error playing ${key}:`, error);
        });
    }

    pause(key) {
        if (this.tracks[key]) {
            this.tracks[key].pause();
        }
    }

    pauseAll() {
        Object.keys(this.tracks).forEach(key => this.pause(key));
    }

    resumeAll() {
        Object.keys(this.tracks).forEach(key => {
            if (this.tracks[key]) {
                this.tracks[key].play().catch(() => {
                });
            }
        });
    }

    update() {
        if (!getBackgroundAudio()) {
            this.pauseAll();
            return;
        }

        const weather = getCurrentStarSystemWeatherEfficiency()[2];
        const sounds = {
            'rain': './sounds/rainLoop.mp3',
            'volcano': './sounds/eruptionLoop.mp3'
        };

        Object.keys(this.tracks).forEach(key => {
            if (key !== weather) {
                this.pause(key);
            }
        });

        if (sounds[weather]) {
            this.play(weather, sounds[weather]);
        }
    }
}

export const weatherAmbienceManager = new WeatherAmbienceManager();

class BackgroundAudioPlayer {
    constructor() {
        this.audio = new Audio('./sounds/bgAmbience.mp3');
        this.audio.loop = true;
        this.audio.volume = 0.5;
        this.isPlaying = false;
    }

    update() {
        if (getBackgroundAudio()) {
            if (!this.isPlaying) {
                this.resume();
            }
        } else {
            if (this.isPlaying) {
                this.pause();
            }
        }
    }

    play() {
        this.audio.play().then(() => {
            this.isPlaying = true;
        }).catch(error => {
            console.error("Audio playback failed:", error);
        });
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
    }

    resume() {
        this.audio.play().then(() => {
            this.isPlaying = true;
        }).catch(error => {
            console.error("Error resuming audio:", error);
        });
    }
}

export const backgroundAudio = new BackgroundAudioPlayer();

class SfxPlayer {
    constructor() {
        this.sounds = {
            "swipe": "./sounds/clickSwitch.mp3",
            "click": "./sounds/clickButton.mp3",
            "increaseStorage": "./sounds/increaseStorage.mp3",
            "goodPrize": "./sounds/goodPrize.mp3",
            "asteroidScan": "./sounds/asteroidScan.mp3",
            "powerOff": "./sounds/powerOff.mp3",
            "powerOn": "./sounds/powerOn.mp3",
            "powerTripped": "./sounds/powerTripped.mp3",
            "rocketLaunch": "./sounds/rocketLaunch.mp3",
            "rocketLand": "./sounds/rocketLand.mp3",
            "starShipLaunch": "./sounds/starShipLaunch.mp3",
            "starShipArrive": "./sounds/starShipArrive.mp3",
            "starStudy": "./sounds/starStudy.mp3",
            "buildTelescope": "./sounds/buildTelescope.mp3",
            "buildLaunchPad": "./sounds/buildLaunchPad.mp3",
            "fuelRocket": "./sounds/fuelRocket.mp3",
            "laserGun1": "./sounds/laserGun1.mp3",
            "laserGun2": "./sounds/laserGun2.mp3",
            "shipBattleExplode1": "./sounds/shipBattleExplode1.mp3",
            "shipBattleExplode2": "./sounds/shipBattleExplode2.mp3",
            "eventAlarm": "./sounds/eventAlarm.mp3",
            "blackHoleActivated": "./sounds/blackHoleActivated.mp3",
            "kaching": "./sounds/kaching.mp3",
            "forcefieldTakedown": "./sounds/forcefieldTakedown.mp3",
            "forcefieldTakedownFinal": "./sounds/forcefieldTakedownFinal.mp3",
            "megastructureCaptured": "./sounds/megastructureCaptured.mp3",
        };
        this.activeSounds = new Map();
    }

    playAudio(audioKey, stopTarget = false) {
        if (!getSfx()) return;

        if (stopTarget === true) {
            this.stopAll();
        } else if (typeof stopTarget === "string") {
            this.stop(stopTarget);
        }

        if (this.sounds[audioKey]) {
            const audio = new Audio(this.sounds[audioKey]);
            audio.volume = 0.5;
            this.activeSounds.set(audioKey, audio);
            
            audio.play().catch(error => {
                console.error(`Error playing SFX ${audioKey}:`, error);
            });

            audio.addEventListener("ended", () => {
                this.activeSounds.delete(audioKey);
            });
        }
    }

    stop(audioKey) {
        if (this.activeSounds.has(audioKey)) {
            const audio = this.activeSounds.get(audioKey);
            audio.pause();
            audio.currentTime = 0;
            this.activeSounds.delete(audioKey);
        }
    }

    stopAll() {
        this.activeSounds.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.activeSounds.clear();
    }
}

export const sfxPlayer = new SfxPlayer();

class BoostSoundManager {
    constructor() {
        this.boostSounds = new Set();
        this.boostInterval = null;
        this.boostSoundStarted = false;
    }

    startBoostLoop() {
        if (this.boostSoundStarted || !getSfx()) return;

        this.boostSoundStarted = true;

        const playBoostSound = () => {
            if (!getIsAntimatterBoostActive()) {
                this.stopBoostLoop();
                return;
            }

            const audio = new Audio("./sounds/boostAntimatter.mp3");
            audio.volume = 0.4;
            this.boostSounds.add(audio);

            audio.play().catch(error => {
                console.error("Error playing boost sound:", error);
            });

            audio.addEventListener("ended", () => {
                this.boostSounds.delete(audio);
            });
        };

        playBoostSound();
        this.boostInterval = setInterval(playBoostSound, 500);
    }

    stopBoostLoop() {
        if (!this.boostSoundStarted) return;

        this.boostSoundStarted = false;
        clearInterval(this.boostInterval);
        this.boostInterval = null;

        this.boostSounds.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });

        this.boostSounds.clear();
    }
}

export const boostSoundManager = new BoostSoundManager();

export function playClickSfx() {
    sfxPlayer.playAudio("click");
}

export function playSwipeSfx() {
    sfxPlayer.playAudio("swipe");
}

window.addEventListener('blur', () => {
    weatherAmbienceManager.pauseAll();
    backgroundAudio.pause();
    sfxPlayer.stopAll();
});

window.addEventListener('focus', () => {
    if (getBackgroundAudio()) {
        weatherAmbienceManager.resumeAll();
        backgroundAudio.play();
    }
});
