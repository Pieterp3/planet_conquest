// Ported from Bot.java
// 1-to-1 port from Java
class Bot extends Operator {
    constructor(game) {
        super(game);
        this.lastDecisionTime = 0;
        this.decisionInterval = game.difficulty.getBotDecisionInterval();
        this.startTime = Date.now();
        this.aggressiveness = game.difficulty.getBotAggressiveness();
        this.efficiency = game.difficulty.getBotEfficiency();
        this.botAbilities = [];
        this.botUpgrades = [];
        this.lastAbilityUse = 0;
        this.ABILITY_COOLDOWN = 15000;
        // Ability effect durations
        this.botShieldEndTime = 0;
        this.botFactoryHypeEndTime = 0;
        this.botImprovedFactoriesEndTime = 0;
        this.botBlackHoleEndTime = 0;
        this.botPlanetaryFlameEndTime = 0;
        this.botFreezeEndTime = 0;
        this.botMissileBarrageEndTime = 0;
        this.botAnsweredPrayersEndTime = 0;
        this.botCurseEndTime = 0;
        this.botUnstoppableShipsEndTime = 0;
        this.botOrbitalFreezeEndTime = 0;
        if (game.difficulty.getBotsGetAbilities()) {
            this.grantBotAbilitiesAndUpgrades(game.difficulty);
        }
    }
    setStartTime(startTime) {
        this.startTime = startTime;
    }
    tick() {
        if (Date.now() - this.startTime < 5000) return;
        const currentTime = Date.now();
        if (currentTime - this.lastDecisionTime < this.decisionInterval) return;
        this.lastDecisionTime = currentTime;
        this.updateBotAbilityEffects(currentTime);
        this.tryUseAbility();
        const myPlanets = this.getMyPlanets();
        if (myPlanets.length === 0) return;
        if (myPlanets.length > 1) this.reinforceLowHealthPlanets(myPlanets);
        this.formAttackConnections(myPlanets);
    }
    getMyPlanets() {
        return this.getGame().getPlanets().filter(p => p.getOperator() === this);
    }
    reinforceLowHealthPlanets(myPlanets) {
        for (const planet of myPlanets) {
            const healthThreshold = 0.5 + (this.efficiency - 1.0) * 0.2;
            if (planet.getHealth() < planet.getMaxHealth() * healthThreshold) {
                const reinforcer = this.findBestReinforcer(planet, myPlanets);
                if (reinforcer && !reinforcer.getTargets().includes(planet)) {
                    reinforcer.attemptTargeting(planet);
                }
            }
        }
    }
    findBestReinforcer(weakPlanet, myPlanets) {
        let bestReinforcer = null;
        let bestHealth = 0;
        for (const planet of myPlanets) {
            if (planet === weakPlanet) continue;
            if (planet.getHealth() > planet.getMaxHealth() * 0.8 && planet.getTargets().length < 2 && planet.getHealth() > bestHealth) {
                bestReinforcer = planet;
                bestHealth = planet.getHealth();
            }
        }
        return bestReinforcer;
    }
    formAttackConnections(myPlanets) {
        const enemyPlanets = this.getGame().getPlanets().filter(p => p.getOperator() !== this);
        if (enemyPlanets.length === 0) return;
        for (const myPlanet of myPlanets) {
            const healthThreshold = 0.3 / this.aggressiveness;
            const maxTargets = Math.ceil(2 * this.aggressiveness);
            if (myPlanet.getHealth() < myPlanet.getMaxHealth() * healthThreshold || myPlanet.getTargets().length >= maxTargets) continue;
            const target = this.findBestAttackTarget(myPlanet, enemyPlanets);
            if (target && !myPlanet.getTargets().includes(target)) {
                myPlanet.attemptTargeting(target);
            }
        }
    }
    findBestAttackTarget(attackerPlanet, enemyPlanets) {
        let bestTarget = null;
        let bestScore = -1;
        for (const enemy of enemyPlanets) {
            const distance = Math.hypot(attackerPlanet.getX() - enemy.getX(), attackerPlanet.getY() - enemy.getY());
            const distanceScore = (1000.0 / (distance + 1)) * this.efficiency;
            const healthScore = (1000.0 / (enemy.getHealth() + 1)) * this.efficiency;
            const isPlayerPlanet = enemy.getOperator() === this.getGame().getPlayer();
            const playerBonus = isPlayerPlanet ? (this.aggressiveness * 3.0) : 0.0;
            const score = distanceScore + healthScore + playerBonus;
            if (score > bestScore) {
                bestScore = score;
                bestTarget = enemy;
            }
        }
        return bestTarget;
    }
    grantBotAbilitiesAndUpgrades(difficulty) {
        // Define available abilities for bots (all except PLANETARY_INFECTION)
        const availableAbilities = [
            AbilityType.FREEZE,
            AbilityType.MISSILE_BARRAGE,
            AbilityType.SHIELD,
            AbilityType.FACTORY_HYPE,
            AbilityType.IMPROVED_FACTORIES,
            AbilityType.ANSWERED_PRAYERS,
            AbilityType.CURSE,
            AbilityType.BLACK_HOLE,
            AbilityType.PLANETARY_FLAME,
            AbilityType.UNSTOPPABLE_SHIPS
        ];
        const availableUpgrades = [
            UpgradeType.SHIP_DAMAGE,
            UpgradeType.SHIP_HEALTH,
            UpgradeType.SHIP_SPEED,
            UpgradeType.SHIP_SPAWN_SPEED,
            UpgradeType.PLANET_HEALTH
        ];
        let numAbilities = 0;
        switch (difficulty) {
            case Difficulty.HARD:
                numAbilities = 1 + Math.floor(Math.random() * 2);
                break;
            case Difficulty.EXTREME:
                numAbilities = 2 + Math.floor(Math.random() * 3);
                break;
        }
        this.botAbilities = [];
        while (this.botAbilities.length < numAbilities && this.botAbilities.length < availableAbilities.length) {
            const ability = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
            if (!this.botAbilities.includes(ability)) this.botAbilities.push(ability);
        }
        let numUpgrades = 0;
        switch (difficulty) {
            case Difficulty.HARD:
                numUpgrades = 2 + Math.floor(Math.random() * 3);
                break;
            case Difficulty.EXTREME:
                numUpgrades = 4 + Math.floor(Math.random() * 2);
                break;
        }
        this.botUpgrades = [];
        while (this.botUpgrades.length < numUpgrades && this.botUpgrades.length < availableUpgrades.length) {
            const upgrade = availableUpgrades[Math.floor(Math.random() * availableUpgrades.length)];
            if (!this.botUpgrades.includes(upgrade)) this.botUpgrades.push(upgrade);
        }
    }
    getBotAbilities() {
        return [...this.botAbilities];
    }
    getBotUpgrades() {
        return [...this.botUpgrades];
    }
    getBotUpgradeMultiplier(type) {
        const abilityManager = this.getGame().getAbilityManager();
        if (!this.botUpgrades.includes(type)) {
            let baseMultiplier = 1.0;
            if (type === UpgradeType.SHIP_SPAWN_SPEED && abilityManager.isOperatorFactoryHypeActive(this)) baseMultiplier *= 2.0;
            if ((type === UpgradeType.SHIP_HEALTH || type === UpgradeType.SHIP_DAMAGE || type === UpgradeType.SHIP_SPEED) && abilityManager.isOperatorImprovedFactoriesActive(this)) baseMultiplier *= 2.0;
            return baseMultiplier;
        }
        let multiplier = 1.5;
        if (type === UpgradeType.SHIP_SPAWN_SPEED && abilityManager.isOperatorFactoryHypeActive(this)) multiplier *= 2.0;
        if ((type === UpgradeType.SHIP_HEALTH || type === UpgradeType.SHIP_DAMAGE || type === UpgradeType.SHIP_SPEED) && abilityManager.isOperatorImprovedFactoriesActive(this)) multiplier *= 2.0;
        return multiplier;
    }
    hasBotUpgrade(type) {
        return this.botUpgrades.includes(type);
    }
    updateBotAbilityEffects(currentTime) {
        // Visual effect timing is handled locally for rendering
        // Actual ability effects are handled by AbilityManager
    }
    isBotShieldActive() {
        const abilityManager = this.getGame().getAbilityManager();
        return abilityManager.isOperatorShieldActive(this) || Date.now() < this.botShieldEndTime;
    }
    isBotFactoryHypeActive() {
        const abilityManager = this.getGame().getAbilityManager();
        return abilityManager.isOperatorFactoryHypeActive(this) || Date.now() < this.botFactoryHypeEndTime;
    }
    isBotImprovedFactoriesActive() {
        const abilityManager = this.getGame().getAbilityManager();
        return abilityManager.isOperatorImprovedFactoriesActive(this) || Date.now() < this.botImprovedFactoriesEndTime;
    }
    isBotBlackHoleActive() {
        const abilityManager = this.getGame().getAbilityManager();
        return abilityManager.getOperatorBlackHoles(this).length > 0 || Date.now() < this.botBlackHoleEndTime;
    }
    isBotPlanetaryFlameActive() {
        const abilityManager = this.getGame().getAbilityManager();
        return abilityManager.isOperatorPlanetaryFlameActive(this) || Date.now() < this.botPlanetaryFlameEndTime;
    }
    isBotFreezeActive() {
        const abilityManager = this.getGame().getAbilityManager();
        return abilityManager.isOperatorFreezeActive(this) || Date.now() < this.botFreezeEndTime;
    }
    isBotMissileBarrageActive() {
        return Date.now() < this.botMissileBarrageEndTime;
    }
    isBotAnsweredPrayersActive() {
        return Date.now() < this.botAnsweredPrayersEndTime;
    }
    isBotCurseActive() {
        const abilityManager = this.getGame().getAbilityManager();
        return abilityManager.getOperatorCursedPlanets(this).length > 0 || Date.now() < this.botCurseEndTime;
    }
    isBotUnstoppableShipsActive() {
        const abilityManager = this.getGame().getAbilityManager();
        return abilityManager.isOperatorUnstoppableShipsActive(this) || Date.now() < this.botUnstoppableShipsEndTime;
    }
    isBotOrbitalFreezeActive() {
        const abilityManager = this.getGame().getAbilityManager();
        return abilityManager.getOperatorOrbitalFrozenPlanets(this).length > 0 || Date.now() < this.botOrbitalFreezeEndTime;
    }
    tryUseAbility() {
        const currentTime = Date.now();
        if (this.botAbilities.length === 0 || currentTime - this.lastAbilityUse < this.ABILITY_COOLDOWN) return;
        const selectedAbility = this.botAbilities[Math.floor(Math.random() * this.botAbilities.length)];
        this.useBotAbility(selectedAbility);
        this.lastAbilityUse = currentTime;
    }
    useBotAbility(ability) {
        const myPlanets = this.getMyPlanets();
        if (myPlanets.length === 0) return;
        const abilityManager = this.getGame().getAbilityManager();
        const currentTime = Date.now();
        switch (ability) {
            case AbilityType.FREEZE:
                abilityManager.activateOperatorAbility(this, ability, 6.0, 0);
                this.botFreezeEndTime = currentTime + 6000;
                break;
            case AbilityType.MISSILE_BARRAGE:
                abilityManager.activateOperatorAbility(this, ability, 0.0, 3);
                this.botMissileBarrageEndTime = currentTime + 4000;
                break;
            case AbilityType.SHIELD:
                abilityManager.activateOperatorAbility(this, ability, 10.0, 0);
                this.botShieldEndTime = currentTime + 10000;
                break;
            case AbilityType.FACTORY_HYPE:
                abilityManager.activateOperatorAbility(this, ability, 8.0, 0);
                this.botFactoryHypeEndTime = currentTime + 8000;
                break;
            case AbilityType.IMPROVED_FACTORIES:
                abilityManager.activateOperatorAbility(this, ability, 12.0, 0);
                this.botImprovedFactoriesEndTime = currentTime + 12000;
                break;
            case AbilityType.CURSE:
                abilityManager.activateOperatorAbility(this, ability, 7.0, 25);
                this.botCurseEndTime = currentTime + 7000;
                break;
            case AbilityType.UNSTOPPABLE_SHIPS:
                abilityManager.activateOperatorAbility(this, ability, 6.0, 0);
                this.botUnstoppableShipsEndTime = currentTime + 6000;
                break;
            case AbilityType.ANSWERED_PRAYERS:
                abilityManager.activateOperatorAbility(this, ability, 0.0, 50);
                this.botAnsweredPrayersEndTime = currentTime + 3000;
                break;
            case AbilityType.BLACK_HOLE:
                abilityManager.activateOperatorAbility(this, ability, 5.0, 100);
                this.botBlackHoleEndTime = currentTime + 5000;
                break;
            case AbilityType.PLANETARY_FLAME:
                abilityManager.activateOperatorAbility(this, ability, 8.0, 50);
                this.botPlanetaryFlameEndTime = currentTime + 8000;
                break;
            case AbilityType.PLANETARY_INFECTION:
                abilityManager.activateOperatorAbility(this, ability, 10.0, 30);
                break;
            case AbilityType.ORBITAL_FREEZE:
                abilityManager.activateOperatorAbility(this, ability, 10.0, 2);
                this.botOrbitalFreezeEndTime = currentTime + 10000;
                break;
        }
    }
}
if (typeof module !== 'undefined') module.exports = Bot;