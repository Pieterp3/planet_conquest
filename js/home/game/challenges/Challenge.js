// Ported from Challenge.java
// 1-to-1 port from Java
class Challenge {
    constructor(id, name, description, type, rarity, coinReward) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.rarity = rarity;
        this.coinReward = coinReward;
        this.completed = false;
        this.currentProgress = 0;
        this.startTime = 0;
        this.requiredDifficulty = null;
        this.timeLimit = null;
        this.targetCount = null;
        this.specificAbility = null;
        this.excludedPlanetType = null;
    }
    getId() { return this.id; }
    getName() { return this.name; }
    getDescription() { return this.description; }
    getType() { return this.type; }
    getRarity() { return this.rarity; }
    getCoinReward() { return this.coinReward; }
    isCompleted() { return this.completed; }
    setCompleted(completed) { this.completed = completed; }
    getRequiredDifficulty() { return this.requiredDifficulty; }
    setRequiredDifficulty(difficulty) { this.requiredDifficulty = difficulty; }
    getTimeLimit() { return this.timeLimit; }
    setTimeLimit(timeLimit) { this.timeLimit = timeLimit; }
    getTargetCount() { return this.targetCount; }
    setTargetCount(targetCount) { this.targetCount = targetCount; }
    getSpecificAbility() { return this.specificAbility; }
    setSpecificAbility(ability) { this.specificAbility = ability; }
    getExcludedPlanetType() { return this.excludedPlanetType; }
    setExcludedPlanetType(planetType) { this.excludedPlanetType = planetType; }
    getCurrentProgress() { return this.currentProgress; }
    setCurrentProgress(progress) { this.currentProgress = progress; }
    incrementProgress(amount = 1) { this.currentProgress += amount; }
    getStartTime() { return this.startTime; }
    setStartTime(startTime) { this.startTime = startTime; }
    getProgressPercentage() {
        if (!this.targetCount) return this.completed ? 1.0 : 0.0;
        return Math.min(1.0, this.currentProgress / this.targetCount);
    }
    checkCompletion() {
        switch (this.type) {
            case ChallengeType.USE_ABILITIES_COUNT:
            case ChallengeType.USE_SPECIFIC_ABILITY:
            case ChallengeType.CAPTURE_PLANETS:
            case ChallengeType.DONATE_GOLD:
            case ChallengeType.UNLOCK_ABILITIES:
            case ChallengeType.PURCHASE_SPECIFIC_ABILITY:
            case ChallengeType.PURCHASE_ABILITY_UPGRADES:
            case ChallengeType.PURCHASE_UPGRADES:
            case ChallengeType.WIN_STREAK_DIFFICULTY:
                return this.currentProgress >= this.targetCount;
            case ChallengeType.COMPLETE_MISSION_TIME:
                return this.completed;
            case ChallengeType.WIN_WITHOUT_LOSING_PLANET:
                return this.currentProgress >= this.targetCount;
            case ChallengeType.WIN_WITHOUT_CAPTURING_PLANET_TYPE:
                return this.completed;
            default:
                return false;
        }
    }
    reset() {
        this.currentProgress = 0;
        this.startTime = 0;
        this.completed = false;
    }
}
if (typeof module !== 'undefined') module.exports = Challenge;