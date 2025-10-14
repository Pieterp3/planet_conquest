// Ship.js - Complete port of Ship from Java

class Ship {
    constructor(operator, origin, destination, speed = 2.0, health = 100, damage = 25, isMissile = false) {
        this.operator = operator;
        this.origin = origin;
        this.destination = destination;
        this.x = origin ? origin.getX() : 0;
        this.y = origin ? origin.getY() : 0;
        this.speed = speed;
        this.health = health;
        this.maxHealth = health;
        this.damage = damage;
        this.missile = isMissile;
        this.size = window.GameConstants ? window.GameConstants.getShipSize() : 8;

        // Movement and targeting
        this.direction = 0;
        this.stationary = false;
        this.trailHistory = [];
        this.maxTrailLength = 15;

        // Combat state
        this.lastDamageTime = 0;
        this.inCombat = false;
        this.combatTarget = null;

        // Special abilities
        this.unstoppable = false;
        this.shielded = false;

        // Game reference
        this.game = null;

        this.updateDirection();
        this.updateTrail();
    }

    // Core update method called each game tick
    tick() {
        if (!this.isStationary()) {
            this.move();
            this.checkDestination();
        }

        this.updateTrail();
        this.updateCombatState();
    }

    move() {
        if (!this.destination) return;

        // Find interception target first (higher priority than direct movement)
        const interceptionTarget = this.findInterceptionTarget();

        let targetX, targetY;

        if (interceptionTarget) {
            // Move to intercept enemy ship
            targetX = interceptionTarget.getX();
            targetY = interceptionTarget.getY();
        } else if (this.destination.getX && this.destination.getY) {
            // Predict planet position if it's orbital
            const predicted = this.predictPlanetPosition(this.destination);
            targetX = predicted.x;
            targetY = predicted.y;
        } else {
            // Static destination
            targetX = this.destination.x || this.destination.getX();
            targetY = this.destination.y || this.destination.getY();
        }

        // Calculate movement vector
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 0.1) {
            // Normalize and apply speed
            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;

            this.x += moveX;
            this.y += moveY;

            // Update direction for rendering
            this.direction = Math.atan2(dy, dx);
        }
    }

    findInterceptionTarget() {
        if (!this.game || !this.origin) return null;

        const ships = this.game.getShips();
        let closestThreat = null;
        let closestDistance = Infinity;

        for (const ship of ships) {
            if (ship === this) continue;
            if (ship.getOperator() === this.operator) continue;
            if (!ship.getDestination()) continue;

            // Check if enemy ship is targeting our origin planet
            if (ship.getDestination() === this.origin) {
                const distance = Math.hypot(ship.getX() - this.x, ship.getY() - this.y);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestThreat = ship;
                }
            }
        }

        // Only intercept if threat is within reasonable range
        return closestDistance < 200 ? closestThreat : null;
    }

    predictPlanetPosition(planet) {
        if (!planet.getOrbitalVelocity || planet.getOrbitalVelocity() === 0) {
            return { x: planet.getX(), y: planet.getY() };
        }

        // Calculate time to reach current planet position
        const currentDistance = Math.hypot(planet.getX() - this.x, planet.getY() - this.y);
        const timeToReach = currentDistance / this.speed;

        // Predict where planet will be at that time
        const futureAngle = planet.getOrbitalAngle() + (planet.getOrbitalVelocity() * timeToReach * 0.001);
        const centerX = window.GameConstants ? window.GameConstants.getGameWidth() / 2 : 640;
        const centerY = window.GameConstants ? window.GameConstants.getGameHeight() / 2 : 360;

        return {
            x: centerX + Math.cos(futureAngle) * planet.getOrbitalDistance(),
            y: centerY + Math.sin(futureAngle) * planet.getOrbitalDistance()
        };
    }

    checkDestination() {
        if (!this.destination) return;

        let targetX, targetY, targetRadius;

        if (this.destination.getX && this.destination.getY) {
            // Planet destination
            targetX = this.destination.getX();
            targetY = this.destination.getY();
            targetRadius = this.destination.getActualRadius ? this.destination.getActualRadius() : 35;
        } else {
            // Point destination
            targetX = this.destination.x;
            targetY = this.destination.y;
            targetRadius = 10;
        }

        const distance = Math.hypot(targetX - this.x, targetY - this.y);

        if (distance <= targetRadius) {
            // Reached destination
            if (this.destination.takeDamage && typeof this.destination.takeDamage === 'function') {
                this.destination.takeDamage(this);
            }

            // Remove ship from game
            if (this.game && this.game.removeShip) {
                this.game.removeShip(this);
            }
            if (this.operator && this.operator.removeShip) {
                this.operator.removeShip(this);
            }
        }
    }

    updateTrail() {
        // Add current position to trail
        this.trailHistory.push({ x: this.x, y: this.y, time: Date.now() });

        // Remove old trail points
        const maxAge = 500; // 500ms trail
        const currentTime = Date.now();
        this.trailHistory = this.trailHistory.filter(point =>
            currentTime - point.time < maxAge
        );

        // Limit trail length
        if (this.trailHistory.length > this.maxTrailLength) {
            this.trailHistory = this.trailHistory.slice(-this.maxTrailLength);
        }
    }

    updateDirection() {
        if (!this.destination) return;

        const targetX = this.destination.getX ? this.destination.getX() : this.destination.x;
        const targetY = this.destination.getY ? this.destination.getY() : this.destination.y;

        const dx = targetX - this.x;
        const dy = targetY - this.y;

        if (Math.hypot(dx, dy) > 0.1) {
            this.direction = Math.atan2(dy, dx);
        }
    }

    updateCombatState() {
        // Update combat-related state
        const currentTime = Date.now();

        // Clear old damage indicators
        if (currentTime - this.lastDamageTime > 1000) {
            // Reset combat indicators after 1 second
        }
    }

    takeDamage(damageAmount, attacker = null) {
        // Apply damage with ability modifications
        let actualDamage = damageAmount;

        // Check for shield protection
        if (this.isShielded()) {
            actualDamage *= 0.5; // Shield reduces damage by 50%
        }

        this.health -= actualDamage;
        this.lastDamageTime = Date.now();

        if (attacker) {
            this.combatTarget = attacker;
        }

        if (this.health <= 0) {
            this.destroy();
        }

        return actualDamage;
    }

    destroy() {
        // Create explosion effect
        if (this.game && this.game.getEffectsArtist) {
            const effects = this.game.getEffectsArtist();
            if (effects.addExplosion) {
                effects.addExplosion(this.x, this.y, 20, 300);
            }
        }

        // Remove from game
        if (this.game && this.game.removeShip) {
            this.game.removeShip(this);
        }
        if (this.operator && this.operator.removeShip) {
            this.operator.removeShip(this);
        }
    }

    // State query methods
    isStationary() { return this.stationary; }
    isMissile() { return this.missile; }
    isUnstoppable() { return this.unstoppable; }

    isShielded() {
        if (!this.game || !this.game.getAbilityManager) return false;
        const abilityManager = this.game.getAbilityManager();
        if (this.operator && this.operator.constructor.name === 'Player') {
            return abilityManager.isShieldActive && abilityManager.isShieldActive();
        }
        return this.shielded;
    }

    isFrozen() {
        if (!this.game || !this.game.getAbilityManager) return false;
        const abilityManager = this.game.getAbilityManager();
        return abilityManager.isFreezeActive && abilityManager.isFreezeActive();
    }

    // Getters and setters
    getX() { return this.x; }
    getY() { return this.y; }
    getSize() { return this.size; }
    getHealth() { return this.health; }
    getMaxHealth() { return this.maxHealth; }
    getDamage() { return this.damage; }
    getSpeed() { return this.speed; }
    getDirection() { return this.direction; }
    getOperator() { return this.operator; }
    getOrigin() { return this.origin; }
    getDestination() { return this.destination; }
    getTrailHistory() { return this.trailHistory; }
    getCombatTarget() { return this.combatTarget; }

    setX(x) { this.x = x; }
    setY(y) { this.y = y; }
    setLocation(x, y) { this.x = x; this.y = y; }
    setStationary(stationary) { this.stationary = stationary; }
    setDestination(destination) {
        this.destination = destination;
        this.updateDirection();
    }
    setSpeed(speed) { this.speed = speed; }
    setDamage(damage) { this.damage = damage; }
    setUnstoppable(unstoppable) { this.unstoppable = unstoppable; }
    setShielded(shielded) { this.shielded = shielded; }
    setGame(game) { this.game = game; }
    setCombatTarget(target) { this.combatTarget = target; }

    // Distance calculation utilities
    getDistanceTo(target) {
        const targetX = target.getX ? target.getX() : target.x;
        const targetY = target.getY ? target.getY() : target.y;
        return Math.hypot(targetX - this.x, targetY - this.y);
    }

    isNearTarget(target, threshold = 10) {
        return this.getDistanceTo(target) <= threshold;
    }

    // Collision detection
    collidesWith(other) {
        if (!other) return false;
        const distance = this.getDistanceTo(other);
        const combinedRadius = this.size + (other.getSize ? other.getSize() : other.size || 5);
        return distance <= combinedRadius;
    }

    toString() {
        return `Ship[${this.x.toFixed(1)}, ${this.y.toFixed(1)}] -> ${this.destination ? 'Planet' : 'None'}`;
    }
}

window.Ship = Ship;
