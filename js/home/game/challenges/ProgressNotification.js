// ProgressNotification.js - Port of ProgressNotification
class ProgressNotification {
    constructor(challengeName, currentProgress, targetProgress, rarity) {
        this.challengeName = challengeName;
        this.currentProgress = currentProgress;
        this.targetProgress = targetProgress;
        this.rarity = rarity;
        this.startTime = Date.now();
        this.duration = 3000;
    }
    isExpired() {
        return Date.now() - this.startTime > this.duration;
    }
    getChallengeName() { return this.challengeName; }
    getCurrentProgress() { return this.currentProgress; }
    getTargetProgress() { return this.targetProgress; }
    getRarity() { return this.rarity; }
    getProgressPercentage() { return this.targetProgress > 0 ? this.currentProgress / this.targetProgress : 0; }
}
window.ProgressNotification = ProgressNotification;
