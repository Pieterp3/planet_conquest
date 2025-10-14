// CombatManager.js - Handles ship-to-ship combat logic
class CombatManager {
    constructor(game) {
        this.game = game;
        this.combatStates = new Map(); // Ship -> CombatState
        this.combatEngagementDistance = window.GameConstants ?
            window.GameConstants.getCombatEngagementDistance() : 80;
        this.combatDisengagementDistance = window.GameConstants ?
            window.GameConstants.getCombatDisengagementDistance() : 120;
        this.shipFireRate = window.GameConstants ?
            window.GameConstants.getShipFireRate() : 500;
    }

    updateCombat() {
        const ships = this.game.getShips();

        // Update combat for all ships
        for (const ship of ships) {
            this.updateShipCombat(ship);
        }
    }

    updateShipCombat(ship) {
        let combatState = this.combatStates.get(ship);

        if (!combatState) {
            combatState = new CombatState();
            this.combatStates.set(ship, combatState);
        }

        // Find potential combat targets
        const target = this.findCombatTarget(ship);

        if (target && this.isValidCombatTarget(ship, target)) {
            const distance = ship.getDistanceTo(target);

            if (!combatState.inCombat && distance <= this.combatEngagementDistance) {
                // Enter combat
                this.enterCombat(ship, target, combatState);
            } else if (combatState.inCombat && combatState.combatTarget === target) {
                // Continue combat
                this.continueCombat(ship, target, combatState);
            } else if (combatState.inCombat && distance > this.combatDisengagementDistance) {
                // Exit combat
                this.exitCombat(ship, combatState);
            }
        } else if (combatState.inCombat) {
            // No valid target, exit combat
            this.exitCombat(ship, combatState);
        }

        // Clean up destroyed ships
        if (combatState.combatTarget && (combatState.combatTarget.getHealth() <= 0 ||
            !this.game.getShips().includes(combatState.combatTarget))) {
            this.exitCombat(ship, combatState);
        }
    }

    findCombatTarget(ship) {
        const ships = this.game.getShips();
        let closestEnemy = null;
        let closestDistance = Infinity;

        for (const otherShip of ships) {
            if (otherShip === ship) continue;
            if (otherShip.getOperator() === ship.getOperator()) continue;

            // Ships only fight enemies attacking their origin planet
            if (otherShip.getDestination() !== ship.getOrigin()) continue;

            const distance = ship.getDistanceTo(otherShip);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = otherShip;
            }
        }

        return closestEnemy;
    }

    isValidCombatTarget(ship, target) {
        if (!target || target === ship) return false;
        if (target.getOperator() === ship.getOperator()) return false;
        if (target.getHealth() <= 0) return false;

        // Check if target is approaching ship's origin planet
        if (target.getDestination() === ship.getOrigin()) {
            return true;
        }

        return false;
    }

    enterCombat(ship, target, combatState) {
        combatState.inCombat = true;
        combatState.combatTarget = target;
        combatState.lastShotTime = 0;

        // Make ship stationary during combat
        if (ship.setStationary) {
            ship.setStationary(true);
        }
    }

    continueCombat(ship, target, combatState) {
        const currentTime = Date.now();

        // Check if we can fire
        if (currentTime - combatState.lastShotTime >= this.shipFireRate) {
            this.fireProjectile(ship, target);
            combatState.lastShotTime = currentTime;
        }
    }

    exitCombat(ship, combatState) {
        combatState.inCombat = false;
        combatState.combatTarget = null;

        // Resume movement
        if (ship.setStationary) {
            ship.setStationary(false);
        }
    }

    fireProjectile(ship, target) {
        if (!window.Projectile) return;

        const projectileSpeed = window.GameConstants ?
            window.GameConstants.getProjectileSpeed() : 5.0;

        // Calculate projectile trajectory
        const dx = target.getX() - ship.getX();
        const dy = target.getY() - ship.getY();
        const distance = Math.hypot(dx, dy);

        if (distance === 0) return;

        const velocityX = (dx / distance) * projectileSpeed;
        const velocityY = (dy / distance) * projectileSpeed;

        const projectile = new window.Projectile(
            ship.getX(),
            ship.getY(),
            { x: velocityX, y: velocityY },
            ship,
            target
        );

        this.game.addProjectile(projectile);
    }

    addShip(ship) {
        this.combatStates.set(ship, new CombatState());
    }

    removeShip(ship) {
        if (this.combatStates.has(ship)) {
            const combatState = this.combatStates.get(ship);
            this.exitCombat(ship, combatState);
            this.combatStates.delete(ship);
        }
    }

    isInCombat(ship) {
        const combatState = this.combatStates.get(ship);
        return combatState ? combatState.inCombat : false;
    }

    getCombatTarget(ship) {
        const combatState = this.combatStates.get(ship);
        return combatState ? combatState.combatTarget : null;
    }
}

// CombatState helper class
class CombatState {
    constructor() {
        this.inCombat = false;
        this.combatTarget = null;
        this.lastShotTime = 0;
    }
}
window.CombatManager = CombatManager;
