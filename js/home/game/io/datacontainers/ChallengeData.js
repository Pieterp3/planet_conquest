// Ported from ChallengeData.java
// 1-to-1 port from Java
class ChallengeData {
    constructor(totalPlanetsCaptured = 0, totalAbilitiesUsed = 0, totalGoldDonated = 0, specificAbilityUsage = {}) {
        this.totalPlanetsCaptured = totalPlanetsCaptured;
        this.totalAbilitiesUsed = totalAbilitiesUsed;
        this.totalGoldDonated = totalGoldDonated;
        this.specificAbilityUsage = specificAbilityUsage;
    }
}
if (typeof module !== 'undefined') module.exports = ChallengeData;