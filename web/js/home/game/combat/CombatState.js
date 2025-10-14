// Ported from CombatState.java
// 1-to-1 port from Java
class CombatState {
    constructor() {
        this.combatTarget = null;
        this.lastShotTime = 0;
        this.inCombat = false;
    }
}
if (typeof module !== 'undefined') module.exports = CombatState;