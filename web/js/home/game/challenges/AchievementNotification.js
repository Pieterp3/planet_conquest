// AchievementNotification.js - Port of AchievementNotification
class AchievementNotification {
    constructor(challengeName, coinReward, scoreReward, rarity) {
        this.challengeName = challengeName;
        this.coinReward = coinReward;
        this.scoreReward = scoreReward;
        this.rarity = rarity;
        this.startTime = Date.now();
        this.duration = 5000;
    }
    isExpired() {
        return Date.now() - this.startTime > this.duration;
    }
    getChallengeName() { return this.challengeName; }
    getCoinReward() { return this.coinReward; }
    getScoreReward() { return this.scoreReward; }
    getRarity() { return this.rarity; }
}
window.AchievementNotification = AchievementNotification;
