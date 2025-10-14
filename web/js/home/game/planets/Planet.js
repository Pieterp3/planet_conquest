// Planet.js - Port of Planet entity from Java
// Complete 1-to-1 port with all orbital mechanics, ship production, abilities, etc.
class Planet {
    constructor(operatorOrX, healthOrY, planetTypeOrRadius, semiMajorAxis, semiMinorAxis, initialAngle, orbitalSpeed, isVerticalOrbit, zIndex) {
        this.game = null; // Reference to game for ability checks
        this.targets = []; // List of target planets
        this.maxTargets = 1;
        this.targetIndex = 0;
        this.stationedShips = []; // Ships stationed at this planet
        this.rotationAngle = 0; // For visual rotation effect

        // Health and regeneration
        this.maxHealth = window.GameConstants ? window.GameConstants.getMaxPlanetHealth() : 100;
        this.healthRegenRate = window.GameConstants ? window.GameConstants.getPlanetHealthRegenRate() : 5;
        this.lastRegenTime = Date.now();

        // Ship production
        this.lastShipTime = Date.now();
        this.shipInterval = window.GameConstants ? (1000 / window.GameConstants.getDefaultShipsPerSecond()) : 2000;

        // Orbital mechanics properties
        this.orbitCenterX = window.GameConstants ? window.GameConstants.getGameWidth() / 2.0 : 640;
        this.orbitCenterY = window.GameConstants ? window.GameConstants.getGameHeight() / 2.0 : 360;
        this.semiMajorAxis = 0;
        this.semiMinorAxis = 0;
        this.orbitalAngle = 0;
        this.orbitalSpeed = 0;
        this.isVerticalOrbit = false;
        this.zIndex = 0;
        this.depthScale = 1.0;

        // Handle different constructor signatures
        if (arguments.length <= 5) {
            // Simple constructor: Planet(x, y, radius, operator, type)
            this.x = operatorOrX;
            this.y = healthOrY;
            this.radius = planetTypeOrRadius;
            this.operator = semiMajorAxis; // Actually operator
            this.planetType = semiMinorAxis; // Actually planetType
            this.health = this.maxHealth;
            this.features = new window.PlanetFeatures(this.x, this.y, this.planetType);
        } else {
            // Complex constructor with orbital parameters
            this.operator = operatorOrX;
            this.health = healthOrY;
            this.planetType = planetTypeOrRadius;
            this.semiMajorAxis = semiMajorAxis;
            this.semiMinorAxis = semiMinorAxis;
            this.orbitalAngle = initialAngle;
            this.orbitalSpeed = orbitalSpeed;
            this.isVerticalOrbit = isVerticalOrbit;
            this.zIndex = zIndex;

            // Calculate depth scale based on z-index
            this.depthScale = 1.0 + (zIndex * 0.3); // 30% size change per z-index unit

            // Calculate initial position
            this.updatePosition();

            this.radius = this.getActualRadius();
            this.features = new window.PlanetFeatures(this.x, this.y, this.planetType);
        }

        this.setMaxTargets();
    }

    setMaxTargets() {
        this.maxTargets = Math.floor(this.health / (this.getMaxHealth() / 4));
        this.maxTargets += this.planetType.getExtraTargets ? this.planetType.getExtraTargets() : 0;
        this.maxTargets = Math.max(1, this.maxTargets);
    }

    getAdjustedShipInterval() {
        let baseInterval = this.shipInterval;

        // Apply player upgrades for ship spawn speed
        if (this.operator && this.operator.constructor.name === 'Player') {
            let playerData = window.PlayerData ? window.PlayerData.getInstance() : null;
            if (playerData) {
                let spawnSpeedMultiplier = playerData.getUpgradeMultiplier('SHIP_SPAWN_SPEED');
                baseInterval = baseInterval / spawnSpeedMultiplier;

                // Apply Factory Hype ability bonus if active
                if (this.game) {
                    let abilityMultiplier = this.game.getAbilityManager().getShipSpawnSpeedMultiplier();
                    baseInterval = baseInterval / abilityMultiplier;
                }
            }
        } else if (this.operator && this.operator.constructor.name === 'Bot') {
            // Apply bot upgrades for ship spawn speed
            let spawnSpeedMultiplier = this.operator.getBotUpgradeMultiplier('SHIP_SPAWN_SPEED');
            baseInterval = baseInterval / spawnSpeedMultiplier;
        }

        baseInterval = baseInterval / (this.planetType.getShipProductionMultiplier ? this.planetType.getShipProductionMultiplier() : 1.0);
        return Math.max(100, Math.floor(baseInterval)); // Minimum 100ms interval
    }

    setGame(game) {
        this.game = game;
    }

    getOperator() { return this.operator; }
    getX() { return Math.floor(this.x); }
    getY() { return Math.floor(this.y); }
    getType() { return this.planetType; }

    setOperator(operator) {
        this.operator = operator;
    }

    takeDamage(ship) {
        let damage = ship.getDamage();

        if (ship.getOperator() === this.operator && damage > 0) {
            damage = -damage; // Heal if same operator
        } else {
            // Check shield ability for player planets
            if (this.operator && this.operator.constructor.name === 'Player' && this.game) {
                if (this.game.getAbilityManager().isShieldActive() ||
                    (window.GameConstants && window.GameConstants.arePlayerPlanetsInvincible())) {
                    if (damage > 0) {
                        return; // No damage when shield is active
                    }
                }
            }

            // Check shield ability for bot planets
            if (this.operator && this.operator.constructor.name === 'Bot') {
                if (this.operator.isBotShieldActive()) {
                    if (damage > 0) {
                        damage = Math.floor(damage * 0.5); // Reduce damage by 50%
                    }
                }
            }

            // Apply planet damage reduction for player-owned planets
            if (this.operator && this.operator.constructor.name === 'Player') {
                let playerData = window.PlayerData ? window.PlayerData.getInstance() : null;
                if (playerData) {
                    let damageReduction = playerData.getUpgradePercentage('PLANET_DAMAGE_REDUCTION');
                    if (damage > 0) {
                        damage = Math.floor(damage * (1.0 - damageReduction / 100.0));
                    }
                }
            }

            // Apply defence planet type bonus
            damage = Math.floor(damage / (this.planetType.getDefenceMultiplier ? this.planetType.getDefenceMultiplier() : 1.0));

            if (this.health <= 0) {
                this.health = Math.abs(this.health);
                let previousOperator = this.operator;
                this.operator = ship.getOperator();
                this.targets = []; // Clear targets on takeover
                this.stationedShips = []; // Clear stationed ships on takeover

                if (this.operator && this.operator.constructor.name === 'Player' && this.game) {
                    this.game.getAbilityManager().removeInfection(this);
                }
                if (this.game) {
                    this.game.getAbilityManager().removeCurse(this);
                }

                // Track challenge progress if game is available
                if (this.game && window.ChallengeManager) {
                    let challengeManager = window.ChallengeManager.getInstance();

                    // Track planet capture if player captured it
                    if (ship.getOperator() && ship.getOperator().constructor.name === 'Player') {
                        challengeManager.onPlanetCaptured(this.planetType);
                    }

                    // Track planet loss if player lost it  
                    if (previousOperator && previousOperator.constructor.name === 'Player') {
                        challengeManager.onPlanetLost();
                    }
                }
            }
        }

        let effectiveMaxHealth = this.getMaxHealth();
        if (this.health === effectiveMaxHealth && damage < 0) {
            // Station the ship if planet is at full health
            this.stationedShips.push(ship);
            ship.getOperator().removeShip(ship);
            this.setMaxTargets();
            return;
        }

        this.health -= damage;
        this.setMaxTargets();
    }

    isShipStationed(ship) {
        return this.stationedShips.includes(ship);
    }

    tick() {
        let currentTime = Date.now();

        // Deploy stationed ships
        if (this.stationedShips.length > 0 && this.targets.length > 0) {
            let ship = this.stationedShips.shift();
            ship.resetCreationTime();
            ship.setTarget(this.chooseTarget());
            ship.setLocation(this.x, this.y);
            this.operator.addShip(ship);
            for (let i = 0; i < 2; i++) {
                ship.move();
            }
        }

        // Check if this planet should be affected by freeze ability
        let canSpawnShip = true;
        if (this.game && this.operator && this.operator.constructor.name !== 'Player') {
            // Only check freeze for bot planets
            canSpawnShip = !this.game.getAbilityManager().isFreezeActive();
        }

        if (currentTime - this.lastShipTime >= this.getAdjustedShipInterval() &&
            this.operator && this.targets.length > 0 && canSpawnShip) {

            // Produce a ship
            let shipSpeed = window.GameConstants ? window.GameConstants.getDefaultShipSpeed() : 2.0;
            let shipHealth = window.GameConstants ? window.GameConstants.getDefaultShipHealth() : 100;
            let shipDamage = window.GameConstants ? window.GameConstants.getDefaultShipDamage() : 10;

            // Apply planet type bonuses
            shipSpeed *= this.planetType.getShipSpeedMultiplier ? this.planetType.getShipSpeedMultiplier() : 1.0;
            shipHealth = Math.floor(shipHealth * (this.planetType.getDefenceMultiplier ? this.planetType.getDefenceMultiplier() : 1.0));
            shipDamage = Math.floor(shipDamage * (this.planetType.getAttackMultiplier ? this.planetType.getAttackMultiplier() : 1.0));

            // Check if this planet is infected - infected planets produce ships for the player
            let isInfected = this.game && this.game.getAbilityManager().isPlanetInfected(this);
            let shipOperator = isInfected ? this.game.getPlayer() : this.operator;

            // Apply player upgrades if this is a player-owned planet OR if infected
            if ((this.operator && this.operator.constructor.name === 'Player') || isInfected) {
                let playerData = window.PlayerData ? window.PlayerData.getInstance() : null;
                if (playerData) {
                    // Apply ship upgrades
                    shipSpeed *= playerData.getUpgradeMultiplier('SHIP_SPEED');
                    shipHealth = Math.floor(shipHealth * playerData.getUpgradeMultiplier('SHIP_HEALTH'));
                    shipDamage = Math.floor(shipDamage * playerData.getUpgradeMultiplier('SHIP_DAMAGE'));

                    // Apply ability bonuses if game reference is available
                    if (this.game) {
                        shipSpeed *= this.game.getAbilityManager().getShipSpeedMultiplier();
                        shipHealth = Math.floor(shipHealth * this.game.getAbilityManager().getShipHealthMultiplier());
                        shipDamage = Math.floor(shipDamage * this.game.getAbilityManager().getShipDamageMultiplier());
                    }

                    // Handle double ship chance
                    let doubleShipChance = playerData.getUpgradePercentage('DOUBLE_SHIP_CHANCE');
                    let createDoubleShip = Math.random() < (doubleShipChance / 100.0);

                    let targetPlanet = isInfected ? this.chooseTargetForOperator(shipOperator) : this.chooseTarget();
                    let newShip = new window.Ship(shipOperator, this, targetPlanet, shipSpeed, shipHealth, shipDamage);
                    newShip.setLocation(this.x, this.y);
                    this.stationedShips.push(newShip);

                    // Create second ship if double ship chance triggers
                    if (createDoubleShip) {
                        let secondTargetPlanet = isInfected ? this.chooseTargetForOperator(shipOperator) : this.chooseTarget();
                        let secondShip = new window.Ship(shipOperator, this, secondTargetPlanet, shipSpeed, shipHealth, shipDamage);
                        shipOperator.addShip(secondShip);
                    }
                }
            } else {
                // Regular ship creation for bots
                if (shipOperator && shipOperator.constructor.name === 'Bot') {
                    shipSpeed *= shipOperator.getBotUpgradeMultiplier('SHIP_SPEED');
                    shipHealth = Math.floor(shipHealth * shipOperator.getBotUpgradeMultiplier('SHIP_HEALTH'));
                    shipDamage = Math.floor(shipDamage * shipOperator.getBotUpgradeMultiplier('SHIP_DAMAGE'));
                }

                // Apply curse effects if this planet is cursed
                if (this.game && this.game.getAbilityManager().isPlanetCursed(this)) {
                    let playerData = window.PlayerData ? window.PlayerData.getInstance() : null;
                    if (playerData) {
                        let curseReduction = playerData.getAbilityPower('CURSE');
                        let curseMultiplier = 1.0 - (curseReduction / 100.0);
                        shipSpeed *= curseMultiplier;
                        shipHealth = Math.floor(shipHealth * curseMultiplier);
                        shipDamage = Math.floor(shipDamage * curseMultiplier);
                    }
                }

                let targetPlanet = isInfected ? this.chooseTargetForOperator(shipOperator) : this.chooseTarget();
                let newShip = new window.Ship(shipOperator, this, targetPlanet, shipSpeed, shipHealth, shipDamage);
                shipOperator.addShip(newShip);
            }

            this.lastShipTime = currentTime;
        }

        // Regenerate health
        if (currentTime - this.lastRegenTime >= 1000) {
            let healthToRegen = this.healthRegenRate * (this.planetType.getHealthRegenMultiplier ? this.planetType.getHealthRegenMultiplier() : 1.0);
            healthToRegen = Math.min(healthToRegen, this.getMaxHealth() - this.health);
            this.health += healthToRegen;
            this.lastRegenTime = currentTime;
        }

        // Update visual features (moons orbiting)
        if (this.features && this.features.updateMoons) {
            this.features.updateMoons();
        }

        // Update orbital position
        this.updateOrbitalPosition();
    }

    chooseTarget() {
        // Cycle through targets
        if (this.targetIndex >= this.targets.length) {
            this.targetIndex = 0;
        }
        return this.targets[this.targetIndex++];
    }

    chooseTargetForOperator(shipOperator) {
        if (!this.game) {
            return this.chooseTarget(); // Fallback to regular targeting
        }

        // Find enemy planets for the ship operator
        let enemyPlanets = [];
        for (let planet of this.game.getPlanets()) {
            if (planet !== this && planet.getOperator() !== shipOperator) {
                enemyPlanets.push(planet);
            }
        }

        if (enemyPlanets.length === 0) {
            return null; // No valid targets
        }

        // Choose a random enemy planet
        let randomIndex = Math.floor(Math.random() * enemyPlanets.length);
        return enemyPlanets[randomIndex];
    }

    addTarget(planet) {
        if (this.targets.length < this.maxTargets && !this.targets.includes(planet) && planet !== this) {
            this.targets.push(planet);
        }
    }

    removeTarget(planet) {
        let index = this.targets.indexOf(planet);
        if (index > -1) {
            this.targets.splice(index, 1);
        }
    }

    getHealth() { return this.health; }
    getTargets() { return this.targets; }
    getMaxTargets() { return this.maxTargets; }

    getMaxHealth() {
        // Apply planet health upgrades for player-owned planets
        if (this.operator && this.operator.constructor.name === 'Player') {
            let playerData = window.PlayerData ? window.PlayerData.getInstance() : null;
            if (playerData) {
                let healthMultiplier = playerData.getUpgradeMultiplier('PLANET_HEALTH');
                return Math.floor(this.maxHealth * healthMultiplier);
            }
        }
        return this.maxHealth;
    }

    getRotationAngle() {
        if (this.features && this.features.getRotationSpeed) {
            this.rotationAngle += this.features.getRotationSpeed();
            if (this.rotationAngle >= 2 * Math.PI) {
                this.rotationAngle -= 2 * Math.PI;
            }
        }
        return this.rotationAngle;
    }

    getFeatures() { return this.features; }

    // Orbital mechanics methods
    updatePosition() {
        if (this.semiMajorAxis > 0 && this.semiMinorAxis > 0) {
            // Calculate elliptical orbit position
            let cosAngle = Math.cos(this.orbitalAngle);
            let sinAngle = Math.sin(this.orbitalAngle);

            if (this.isVerticalOrbit) {
                // Vertical ellipse: semi-major axis is vertical
                this.x = this.orbitCenterX + this.semiMinorAxis * cosAngle;
                this.y = this.orbitCenterY + this.semiMajorAxis * sinAngle;
            } else {
                // Horizontal ellipse: semi-major axis is horizontal
                this.x = this.orbitCenterX + this.semiMajorAxis * cosAngle;
                this.y = this.orbitCenterY + this.semiMinorAxis * sinAngle;
            }
        } else {
            // Fallback to center if orbital parameters are invalid
            this.x = this.orbitCenterX;
            this.y = this.orbitCenterY;
        }
    }

    updateOrbitalPosition() {
        if (this.orbitalSpeed !== 0) {
            // Check if this planet is orbitally frozen
            let isOrbitallyFrozen = false;
            if (this.game && this.game.getAbilityManager()) {
                isOrbitallyFrozen = this.game.getAbilityManager().isPlanetOrbitallyFrozen(this);
            }

            // Only update orbital position if not frozen
            if (!isOrbitallyFrozen) {
                this.orbitalAngle += this.orbitalSpeed;

                // Normalize angle to keep it in 0 to 2π range
                while (this.orbitalAngle >= 2 * Math.PI) {
                    this.orbitalAngle -= 2 * Math.PI;
                }
                while (this.orbitalAngle < 0) {
                    this.orbitalAngle += 2 * Math.PI;
                }

                this.updatePosition();
            }
        }
    }

    setOrbitalParameters(semiMajorAxis, semiMinorAxis, initialAngle, orbitalSpeed, isVerticalOrbit) {
        this.semiMajorAxis = semiMajorAxis;
        this.semiMinorAxis = semiMinorAxis;
        this.orbitalAngle = initialAngle;
        this.orbitalSpeed = orbitalSpeed;
        this.isVerticalOrbit = isVerticalOrbit;
        this.updatePosition();
    }

    getZIndex() { return this.zIndex; }
    getDepthScale() { return this.depthScale; }

    getActualRadius() {
        let planetSize = window.GameConstants ? window.GameConstants.getPlanetSize() : 35;
        return (planetSize * this.depthScale) / 2.0;
    }

    getOrbitalSpeed() { return this.orbitalSpeed; }
    getOrbitalAngle() { return this.orbitalAngle; }
    getSemiMajorAxis() { return this.semiMajorAxis; }
    getSemiMinorAxis() { return this.semiMinorAxis; }
    isVerticalOrbit() { return this.isVerticalOrbit; }
    getOrbitCenterX() { return this.orbitCenterX; }
    getOrbitCenterY() { return this.orbitCenterY; }

    attemptTargeting(targetPlanet) {
        // If connection already exists, remove it
        if (this.getTargets().includes(targetPlanet)) {
            this.removeTarget(targetPlanet);
        } else {
            let isSameOperator = this.getOperator() === targetPlanet.getOperator();
            if (isSameOperator) {
                // If same operator, swap connection direction if reverse exists
                if (targetPlanet.getTargets().includes(this)) {
                    targetPlanet.removeTarget(this);
                    this.addTarget(targetPlanet);
                } else {
                    // No existing connection, add new one
                    this.addTarget(targetPlanet);
                }
            } else {
                // Different operators, just add one-way connection
                this.addTarget(targetPlanet);
            }
        }
    }

    forceShipCreation() {
        if (!this.operator || this.targets.length === 0) {
            return; // Can't create ships without owner or targets
        }

        // Set last ship time to allow immediate creation on next tick
        this.lastShipTime = Date.now() - this.getAdjustedShipInterval() - 100;
    }

    heal(healAmount) {
        this.health = Math.min(this.health + healAmount, this.maxHealth);
    }

    isOrbitallyFrozen() {
        if (this.game && this.game.getAbilityManager()) {
            return this.game.getAbilityManager().isPlanetOrbitallyFrozen(this);
        }
        return false;
    }
}
window.Planet = Planet;
