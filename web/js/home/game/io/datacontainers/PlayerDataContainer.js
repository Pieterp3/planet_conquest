// Ported from PlayerDataContainer.java
// 1-to-1 port from Java
class PlayerDataContainer {
    constructor({
        coins = 0,
        achievementScore = 0,
        bestTimes = {},
        upgradeLevels = {},
        abilitiesUnlocked = {},
        abilityLevels = {}
    } = {}) {
        this.coins = coins;
        this.achievementScore = achievementScore;
        this.bestTimes = bestTimes;
        this.upgradeLevels = upgradeLevels;
        this.abilitiesUnlocked = abilitiesUnlocked;
        this.abilityLevels = abilityLevels;
        if (typeof UpgradeType !== 'undefined') {
            for (const type of Object.values(UpgradeType)) {
                if (!(type in this.upgradeLevels)) this.upgradeLevels[type] = 0;
            }
        }
        if (typeof AbilityType !== 'undefined') {
            for (const type of Object.values(AbilityType)) {
                if (!(type in this.abilitiesUnlocked)) this.abilitiesUnlocked[type] = false;
                if (!(type in this.abilityLevels)) this.abilityLevels[type] = 0;
            }
        }
    }
}
if (typeof module !== 'undefined') module.exports = PlayerDataContainer;