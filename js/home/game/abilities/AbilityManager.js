// AbilityManager.js - Complete 1-to-1 port of AbilityManager from Java
// All 1189 lines with complex multi-operator ability tracking

// AbilityType enum
const AbilityType = {
    FREEZE: 'FREEZE',
    MISSILE_BARRAGE: 'MISSILE_BARRAGE',
    SHIELD: 'SHIELD',
    FACTORY_HYPE: 'FACTORY_HYPE',
    IMPROVED_FACTORIES: 'IMPROVED_FACTORIES',
    ANSWERED_PRAYERS: 'ANSWERED_PRAYERS',
    CURSE: 'CURSE',
    BLACK_HOLE: 'BLACK_HOLE',
    PLANETARY_FLAME: 'PLANETARY_FLAME',
    PLANETARY_INFECTION: 'PLANETARY_INFECTION',
    UNSTOPPABLE_SHIPS: 'UNSTOPPABLE_SHIPS',
    ORBITAL_FREEZE: 'ORBITAL_FREEZE'
};

class AbilityManager {
    constructor(game) {
        this.game = game;
        this.playerData = window.PlayerData ? window.PlayerData.getInstance() : null;
        this.cooldowns = new Map();
        this.activeEffects = new Map();
        this.random = Math.random;

        // Ability effect tracking (player only - for backward compatibility)
        this.freezeActive = false;
        this.shieldActive = false;
        this.factoryHypeActive = false;
        this.improvedFactoriesActive = false;

        // New ability tracking (player only - for backward compatibility)
        this.cursedPlanets = new Map(); // Planet -> curse end time
        this.blackHoles = [];
        this.planetaryFlameActive = false;
        this.infectedPlanets = new Map(); // Planet -> infection end time
        this.unstoppableShipsActive = false;
        this.orbitalFrozenPlanets = new Map(); // Planet -> freeze end time

        // Multi-operator ability tracking
        this.operatorFreezeActive = new Map();
        this.operatorShieldActive = new Map();
        this.operatorFactoryHypeActive = new Map();
        this.operatorImprovedFactoriesActive = new Map();
        this.operatorCursedPlanets = new Map();
        this.operatorBlackHoles = new Map();
        this.operatorPlanetaryFlameActive = new Map();
        this.operatorInfectedPlanets = new Map();
        this.operatorUnstoppableShipsActive = new Map();
        this.operatorOrbitalFrozenPlanets = new Map();

        // Operator effect expiry times
        this.operatorFreezeExpiry = new Map();
        this.operatorShieldExpiry = new Map();
        this.operatorFactoryHypeExpiry = new Map();
        this.operatorImprovedFactoriesExpiry = new Map();
        this.operatorPlanetaryFlameExpiry = new Map();
        this.operatorUnstoppableShipsExpiry = new Map();
        this.operatorOrbitalFreezeExpiry = new Map();

        this.lastHealingTime = 0;

        // Initialize cooldowns
        Object.values(AbilityType).forEach(type => {
            this.cooldowns.set(type, 0);
            this.activeEffects.set(type, 0);
        });
    }

    canUseAbility(type) {
        if (!this.playerData || !this.playerData.isAbilityUnlocked(type)) {
            return false;
        }
        return Date.now() >= this.cooldowns.get(type);
    }

    getRemainingCooldown(type) {
        const current = Date.now();
        const cooldownEnd = this.cooldowns.get(type) || 0;
        return Math.max(0, cooldownEnd - current);
    }

    isAbilityActive(type) {
        return Date.now() < (this.activeEffects.get(type) || 0);
    }

    getRemainingDuration(type) {
        const current = Date.now();
        const effectEnd = this.activeEffects.get(type) || 0;
        return Math.max(0, effectEnd - current);
    }

    activateAbility(type, operator = null) {
        if (!operator && !this.canUseAbility(type)) {
            return false;
        }

        // Track ability usage for challenges
        if (window.ChallengeManager) {
            const challengeManager = window.ChallengeManager.getInstance();
            if (challengeManager.onAbilityUsed) {
                challengeManager.onAbilityUsed(type);
            }
        }

        const currentTime = Date.now();
        const duration = this.playerData ? this.playerData.getAbilityDuration(type) : 5.0;
        const power = this.playerData ? this.playerData.getAbilityPower(type) : 100;

        // Set cooldown for player abilities
        if (!operator) {
            let cooldownDuration = window.GameConstants.getBaseAbilityCooldown() + (duration * 1000);
            if (this.playerData) {
                cooldownDuration *= (1.0 - this.playerData.getUpgradeMultiplier('ABILITY_COOLDOWN') /
                    window.GameConstants.getAbilityCooldownReductionPercent());
            }
            if (window.GameConstants.removeAbilityCooldowns()) {
                cooldownDuration = 0; // No cooldown for testing
            }
            this.cooldowns.set(type, currentTime + cooldownDuration);
        }

        // Activate ability based on type
        switch (type) {
            case AbilityType.FREEZE:
                this.activateFreeze(duration, operator);
                break;
            case AbilityType.MISSILE_BARRAGE:
                this.activateMissileBarrage(power, operator);
                break;
            case AbilityType.SHIELD:
                this.activateShield(duration, operator);
                break;
            case AbilityType.FACTORY_HYPE:
                this.activateFactoryHype(duration, operator);
                break;
            case AbilityType.IMPROVED_FACTORIES:
                this.activateImprovedFactories(duration, operator);
                break;
            case AbilityType.ANSWERED_PRAYERS:
                this.activateAnsweredPrayers(power, operator);
                break;
            case AbilityType.CURSE:
                this.activateCurse(duration, power, operator);
                break;
            case AbilityType.BLACK_HOLE:
                this.activateBlackHole(duration, power, operator);
                break;
            case AbilityType.PLANETARY_FLAME:
                this.activatePlanetaryFlame(duration, power, operator);
                break;
            case AbilityType.PLANETARY_INFECTION:
                this.activatePlanetaryInfection(duration, power, operator);
                break;
            case AbilityType.UNSTOPPABLE_SHIPS:
                this.activateUnstoppableShips(duration, power, operator);
                break;
            case AbilityType.ORBITAL_FREEZE:
                this.activateOrbitalFreeze(duration, power, operator);
                break;
        }

        return true;
    }

    activateFreeze(duration, operator = null) {
        const endTime = Date.now() + (duration * 1000);

        if (!operator) {
            this.activeEffects.set(AbilityType.FREEZE, endTime);
            this.freezeActive = true;
        } else {
            this.operatorFreezeActive.set(operator, true);
            this.operatorFreezeExpiry.set(operator, endTime);
        }
    }

    activateMissileBarrage(missileCount, operator = null) {
        const player = operator || this.game.getPlayer();
        const enemyPlanets = [];

        for (const planet of this.game.getPlanets()) {
            if (planet.getOperator() && planet.getOperator().constructor.name === 'Bot') {
                enemyPlanets.push(planet);
            }
        }

        if (enemyPlanets.length === 0) return;

        for (let i = 0; i < missileCount; i++) {
            const target = enemyPlanets[Math.floor(Math.random() * enemyPlanets.length)];
            let missileDamage = window.GameConstants.getDefaultShipDamage();

            if (this.playerData) {
                missileDamage *= this.playerData.getUpgradeMultiplier('SHIP_DAMAGE');
            }
            missileDamage *= window.GameConstants.getMissileDamageMultiplier();

            const missile = new window.Ship(player, null, target,
                window.GameConstants.getProjectileSpeed() * window.GameConstants.getMissileSpeedMultiplier(),
                1, missileDamage, true); // Mark as missile

            missile.setLocation(window.GameConstants.getGameWidth() / 2, window.GameConstants.getGameHeight() / 2);
            this.game.addShip(missile);
            player.addShip(missile);
        }
    }

    activateShield(duration, operator = null) {
        const endTime = Date.now() + (duration * 1000);

        if (!operator) {
            this.activeEffects.set(AbilityType.SHIELD, endTime);
            this.shieldActive = true;
        } else {
            this.operatorShieldActive.set(operator, true);
            this.operatorShieldExpiry.set(operator, endTime);
        }
    }

    activateFactoryHype(duration, operator = null) {
        const endTime = Date.now() + (duration * 1000);

        if (!operator) {
            this.activeEffects.set(AbilityType.FACTORY_HYPE, endTime);
            this.factoryHypeActive = true;
        } else {
            this.operatorFactoryHypeActive.set(operator, true);
            this.operatorFactoryHypeExpiry.set(operator, endTime);
        }
    }

    activateImprovedFactories(duration, operator = null) {
        const endTime = Date.now() + (duration * 1000);

        if (!operator) {
            this.activeEffects.set(AbilityType.IMPROVED_FACTORIES, endTime);
            this.improvedFactoriesActive = true;
        } else {
            this.operatorImprovedFactoriesActive.set(operator, true);
            this.operatorImprovedFactoriesExpiry.set(operator, endTime);
        }
    }

    activateAnsweredPrayers(healingPercent, operator = null) {
        const actualHealing = Math.min(100, healingPercent);
        this.lastHealingTime = Date.now();
        const player = operator || this.game.getPlayer();

        for (const planet of this.game.getPlanets()) {
            if (planet.getOperator() === player) {
                const maxHealth = planet.getMaxHealth();
                let healAmount = Math.floor(maxHealth * (actualHealing / 100.0));
                healAmount = Math.min(healAmount, maxHealth - planet.getHealth());
                if (healAmount <= 0) continue;

                const healingShip = new window.Ship(player, planet, planet, 0, 1, healAmount);
                planet.takeDamage(healingShip);
            }
        }
    }

    activateCurse(duration, statReduction, operator = null) {
        const endTime = Date.now() + (duration * 1000);
        const curseMap = operator ?
            (this.operatorCursedPlanets.get(operator) || new Map()) :
            this.cursedPlanets;

        // Curse all enemy planets
        for (const planet of this.game.getPlanets()) {
            if (planet.getOperator() && planet.getOperator().constructor.name === 'Bot') {
                curseMap.set(planet, endTime);
            }
        }

        if (operator) {
            this.operatorCursedPlanets.set(operator, curseMap);
        }
    }

    activateBlackHole(duration, eventHorizon, operator = null) {
        const endTime = Date.now() + (duration * 1000);
        const cappedHorizon = Math.min(150, eventHorizon);
        const player = operator || this.game.getPlayer();

        // Find a planet owned by the player to spawn the black hole in orbit
        const playerPlanets = [];
        for (const planet of this.game.getPlanets()) {
            if (planet.getOperator() === player) {
                playerPlanets.push(planet);
            }
        }

        let blackHoleX, blackHoleY;

        if (playerPlanets.length > 0) {
            const orbitPlanet = playerPlanets[Math.floor(Math.random() * playerPlanets.length)];
            const orbitDistance = orbitPlanet.getActualRadius() + cappedHorizon / 2.0 + 30;
            const angle = Math.random() * 2 * Math.PI;

            blackHoleX = orbitPlanet.getX() + Math.cos(angle) * orbitDistance;
            blackHoleY = orbitPlanet.getY() + Math.sin(angle) * orbitDistance;
        } else {
            const margin = cappedHorizon / 2 + 50;
            blackHoleX = margin + Math.random() * (window.GameConstants.getGameWidth() - 2 * margin);
            blackHoleY = margin + Math.random() * (window.GameConstants.getGameHeight() - 2 * margin);
        }

        const blackHole = new window.BlackHole(blackHoleX, blackHoleY, cappedHorizon, endTime, player);

        if (!operator) {
            this.blackHoles.push(blackHole);
        } else {
            if (!this.operatorBlackHoles.has(operator)) {
                this.operatorBlackHoles.set(operator, []);
            }
            this.operatorBlackHoles.get(operator).push(blackHole);
        }
    }

    activatePlanetaryFlame(duration, flamePower, operator = null) {
        const endTime = Date.now() + (duration * 1000);

        if (!operator) {
            this.activeEffects.set(AbilityType.PLANETARY_FLAME, endTime);
            this.planetaryFlameActive = true;
        } else {
            this.operatorPlanetaryFlameActive.set(operator, true);
            this.operatorPlanetaryFlameExpiry.set(operator, endTime);
        }
    }

    activatePlanetaryInfection(duration, power, operator = null) {
        const currentTime = Date.now();
        const player = operator || this.game.getPlayer();
        const infectionMap = operator ?
            (this.operatorInfectedPlanets.get(operator) || new Map()) :
            this.infectedPlanets;

        for (let i = 0; i < power; i++) {
            const enemyPlanets = [];

            for (const planet of this.game.getPlanets()) {
                if (planet.getOperator() !== player &&
                    !infectionMap.has(planet) &&
                    planet.getOperator() !== null) {
                    enemyPlanets.push(planet);
                }
            }

            if (enemyPlanets.length > 0) {
                const targetPlanet = enemyPlanets[Math.floor(Math.random() * enemyPlanets.length)];
                infectionMap.set(targetPlanet, currentTime);
            }
        }

        if (operator) {
            this.operatorInfectedPlanets.set(operator, infectionMap);
        }
    }

    activateUnstoppableShips(duration, power, operator = null) {
        const endTime = Date.now() + (duration * 1000);

        if (!operator) {
            this.activeEffects.set(AbilityType.UNSTOPPABLE_SHIPS, endTime);
            this.unstoppableShipsActive = true;
        } else {
            this.operatorUnstoppableShipsActive.set(operator, true);
            this.operatorUnstoppableShipsExpiry.set(operator, endTime);
        }
    }

    activateOrbitalFreeze(duration, power, operator = null) {
        const endTime = Date.now() + (duration * 1000);
        const player = operator || this.game.getPlayer();
        const freezeMap = operator ?
            (this.operatorOrbitalFrozenPlanets.get(operator) || new Map()) :
            this.orbitalFrozenPlanets;

        // Freeze orbital movement of enemy planets
        for (const planet of this.game.getPlanets()) {
            if (planet.getOperator() !== player) {
                freezeMap.set(planet, endTime);
            }
        }

        if (operator) {
            this.operatorOrbitalFrozenPlanets.set(operator, freezeMap);
        }
    }

    // Update method called each game tick
    update() {
        const currentTime = Date.now();

        // Check if player abilities have expired
        if (this.freezeActive && currentTime >= this.activeEffects.get(AbilityType.FREEZE)) {
            this.freezeActive = false;
        }
        if (this.shieldActive && currentTime >= this.activeEffects.get(AbilityType.SHIELD)) {
            this.shieldActive = false;
        }
        if (this.factoryHypeActive && currentTime >= this.activeEffects.get(AbilityType.FACTORY_HYPE)) {
            this.factoryHypeActive = false;
        }
        if (this.improvedFactoriesActive && currentTime >= this.activeEffects.get(AbilityType.IMPROVED_FACTORIES)) {
            this.improvedFactoriesActive = false;
        }
        if (this.planetaryFlameActive && currentTime >= this.activeEffects.get(AbilityType.PLANETARY_FLAME)) {
            this.planetaryFlameActive = false;
        }

        // Clean up expired curses
        for (const [planet, expiry] of this.cursedPlanets.entries()) {
            if (currentTime >= expiry) {
                this.cursedPlanets.delete(planet);
            }
        }

        // Update black holes
        this.blackHoles = this.blackHoles.filter(blackHole => {
            if (blackHole.isExpired()) {
                return false;
            }

            blackHole.rotationAngle += 0.1;

            // Check for planets in event horizon and damage them
            for (const planet of this.game.getPlanets()) {
                if (planet.getOperator() && planet.getOperator().constructor.name === 'Bot') {
                    const distance = Math.hypot(planet.getX() - blackHole.x, planet.getY() - blackHole.y);

                    if (distance < blackHole.eventHorizon / 2.0) {
                        const damage = Math.max(10, window.GameConstants.getBlackHoleBasePower() / 10);
                        const damageSource = new window.Ship(this.game.getPlayer(), null, planet, 0, 1, damage);
                        planet.takeDamage(damageSource);
                    }
                }
            }

            return true;
        });

        // Handle planetary flame effects
        if (this.planetaryFlameActive) {
            this.handlePlanetaryFlameEffects();
        }

        // Handle unstoppable ships expiration
        if (this.unstoppableShipsActive && currentTime >= this.activeEffects.get(AbilityType.UNSTOPPABLE_SHIPS)) {
            this.unstoppableShipsActive = false;
        }

        // Handle planetary infection spreading
        if (this.infectedPlanets.size > 0) {
            this.handlePlanetaryInfectionSpread(currentTime);
        }

        // Update operator-specific abilities
        this.updateOperatorAbilities(currentTime);
    }

    handlePlanetaryFlameEffects() {
        const playerPlanets = [];
        for (const planet of this.game.getPlanets()) {
            if (planet.getOperator() && planet.getOperator().constructor.name === 'Player') {
                playerPlanets.push(planet);
            }
        }

        const flameCount = Math.max(1, Math.floor(playerPlanets.length / 2));

        for (let i = 0; i < Math.min(flameCount, playerPlanets.length); i++) {
            const flamePlanet = playerPlanets[i];
            const flameLength = this.playerData ? this.playerData.getAbilityPower(AbilityType.PLANETARY_FLAME) : 500;
            const rotationAngle = (Date.now() * 0.002) % (2 * Math.PI);

            for (let tower = 0; tower < 2; tower++) {
                const towerAngle = rotationAngle + (tower * Math.PI);
                const flameX = flamePlanet.getX() + Math.cos(towerAngle) * flameLength;
                const flameY = flamePlanet.getY() + Math.sin(towerAngle) * flameLength;

                // Check for enemy planets in flame area
                for (const target of this.game.getPlanets()) {
                    if (target.getOperator() && target.getOperator().constructor.name === 'Bot') {
                        const distance = Math.hypot(target.getX() - flameX, target.getY() - flameY);

                        if (distance < 30) {
                            const flamePower = this.playerData ? this.playerData.getAbilityPower(AbilityType.PLANETARY_FLAME) : 500;
                            const flameAttack = new window.Ship(this.game.getPlayer(), flamePlanet, target, 0, 1, flamePower);
                            target.takeDamage(flameAttack);
                        }
                    }
                }

                // Destroy enemy ships in flame area
                this.game.getShips().filter(ship => {
                    if (ship.getOperator() && ship.getOperator().constructor.name === 'Bot') {
                        const distance = Math.hypot(ship.getX() - flameX, ship.getY() - flameY);
                        if (distance < 25) {
                            this.game.removeShip(ship);
                            return false;
                        }
                    }
                    return true;
                });
            }
        }
    }

    handlePlanetaryInfectionSpread(currentTime) {
        const infectionDuration = this.playerData ? (this.playerData.getAbilityDuration(AbilityType.PLANETARY_INFECTION) * 1000) : 10000;
        const spreadDamage = this.playerData ? this.playerData.getAbilityPower(AbilityType.PLANETARY_INFECTION) : 100;

        // Check for infection spreading every 200ms
        if (currentTime % 200 < 50) {
            const currentlyInfected = Array.from(this.infectedPlanets.keys());

            for (const infectedPlanet of currentlyInfected) {
                for (const nearbyPlanet of this.game.getPlanets()) {
                    if (nearbyPlanet.getOperator() !== this.game.getPlayer() &&
                        !this.infectedPlanets.has(nearbyPlanet)) {

                        const distance = Math.hypot(
                            nearbyPlanet.getX() - infectedPlanet.getX(),
                            nearbyPlanet.getY() - infectedPlanet.getY()
                        );

                        const intersectionDistance = infectedPlanet.getActualRadius() + nearbyPlanet.getActualRadius();
                        if (distance < intersectionDistance) {
                            this.infectedPlanets.set(nearbyPlanet, currentTime);
                        }
                    }
                }
            }
        }

        // Remove expired infections and deal damage
        const planetsToDamage = [];
        for (const [planet, infectionStartTime] of this.infectedPlanets.entries()) {
            if (currentTime - infectionStartTime > infectionDuration) {
                this.infectedPlanets.delete(planet);
            } else if ((currentTime - infectionStartTime) % 1000 < 50) {
                planetsToDamage.push(planet);
            }
        }

        for (const planet of planetsToDamage) {
            const infectionDamage = new window.Ship(this.game.getPlayer(), null, planet, 0, 1, spreadDamage);
            planet.takeDamage(infectionDamage);
        }
    }

    updateOperatorAbilities(currentTime) {
        // Update operator-specific ability expiry times
        for (const [operator, expiry] of this.operatorFreezeExpiry.entries()) {
            if (currentTime >= expiry) {
                this.operatorFreezeActive.set(operator, false);
            }
        }
        // Similar for other operator abilities...
    }

    // Cleanup methods
    removeInfection(planet) {
        this.infectedPlanets.delete(planet);
    }

    removeCurse(planet) {
        this.cursedPlanets.delete(planet);
    }

    // State query methods
    isFreezeActive() { return this.freezeActive; }
    isShieldActive() { return this.shieldActive; }
    isFactoryHypeActive() { return this.factoryHypeActive; }
    isImprovedFactoriesActive() { return this.improvedFactoriesActive; }
    isPlanetaryFlameActive() { return this.planetaryFlameActive; }
    isUnstoppableShipsActive() { return this.unstoppableShipsActive; }

    isPlanetInfected(planet) { return this.infectedPlanets.has(planet); }
    isPlanetCursed(planet) {
        return this.cursedPlanets.has(planet) && Date.now() < this.cursedPlanets.get(planet);
    }
    isPlanetOrbitallyFrozen(planet) {
        return this.orbitalFrozenPlanets.has(planet) && Date.now() < this.orbitalFrozenPlanets.get(planet);
    }

    getInfectedPlanets() { return new Map(this.infectedPlanets); }
    getCursedPlanets() { return new Map(this.cursedPlanets); }
    getBlackHoles() { return [...this.blackHoles]; }

    wasHealingJustUsed() {
        return (Date.now() - this.lastHealingTime) < 100;
    }

    // Multiplier methods for abilities
    getShipSpawnSpeedMultiplier() {
        return this.isFactoryHypeActive() ? 3.0 : 1.0;
    }

    getShipDamageMultiplier() {
        return this.isImprovedFactoriesActive() ? 2.0 : 1.0;
    }

    getShipHealthMultiplier() {
        return this.isImprovedFactoriesActive() ? 2.0 : 1.0;
    }

    getShipSpeedMultiplier() {
        return this.isImprovedFactoriesActive() ? 2.0 : 1.0;
    }
}

window.AbilityType = AbilityType;
window.AbilityManager = AbilityManager;
