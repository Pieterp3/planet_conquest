// Ported from Engine.java
// 1-to-1 port from Java
class Engine {
    constructor(game) {
        this.paused = false;
        this.gameOver = false;
        this.ticksPerSecond = window.GameConstants ? window.GameConstants.getTargetTPS() : 60;
        this.slowMode = false;
        this.lastTickTime = 0;
        this.tickInterval = 1000 / this.ticksPerSecond;
        this.game = game;
        this._intervalId = null;
    }
    start() {
        if (this._intervalId) return;
        this.paused = false;
        this.lastTickTime = Date.now();
        this._intervalId = setInterval(() => {
            if (this.gameOver) return;
            if (this.paused) return;
            const currentTime = Date.now();
            if (currentTime - this.lastTickTime >= this.tickInterval) {
                this.lastTickTime = currentTime;
                this.game.tick();
            }
        }, window.GameConstants ? window.GameConstants.getEngineCPUReliefSleep() : 16);
    }
    stop() {
        this.gameOver = true;
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }
    setTicksPerSecond(tps) {
        this.ticksPerSecond = tps;
        this.tickInterval = 1000 / tps;
    }
    isPaused() { return this.paused; }
    pause() { this.paused = true; }
    resume() { this.paused = false; }
    enableSlowMode() {
        if (!this.slowMode) {
            this.slowMode = true;
            this.setTicksPerSecond(window.GameConstants ? window.GameConstants.getSlowModeTPS() : 15);
        }
    }
    disableSlowMode() {
        if (this.slowMode) {
            this.slowMode = false;
            this.setTicksPerSecond(window.GameConstants ? window.GameConstants.getTargetTPS() : 60);
        }
    }
    isSlowMode() { return this.slowMode; }
}

window.Engine = Engine;