// Projectile.js - Combat projectile with ballistic physics
class Projectile {
    constructor(x, y, velocity, origin, target) {
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.origin = origin;
        this.target = target;
        this.distanceTraveled = 0;
        this.maxRange = window.GameConstants ?
            window.GameConstants.getProjectileMaxRange() : 150;
        this.damage = window.GameConstants ?
            window.GameConstants.getProjectileDamage() : 10;
        this.size = 3;
        this.color = '#FFD700';
        this.game = null;
    }

    setGame(game) {
        this.game = game;
    }

    tick() {
        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Track distance traveled
        const velocityMagnitude = Math.hypot(this.velocity.x, this.velocity.y);
        this.distanceTraveled += velocityMagnitude;

        // Remove if max range exceeded
        if (this.distanceTraveled > this.maxRange) {
            this.removeFromGame();
            return;
        }

        // Check collision with target
        this.checkCollision();
    }

    checkCollision() {
        if (!this.target) return;

        const dx = this.target.getX() - this.x;
        const dy = this.target.getY() - this.y;
        const distance = Math.hypot(dx, dy);

        const collisionDistance = window.GameConstants ?
            window.GameConstants.getShipSize() / 2 : 8;

        if (distance <= collisionDistance) {
            this.onHit();
        }
    }

    onHit() {
        // Apply damage to target
        if (this.target && typeof this.target.takeDamage === 'function') {
            this.target.takeDamage(this.damage);
        }

        // Create hit effect
        this.createHitEffect();

        // Remove projectile
        this.removeFromGame();
    }

    createHitEffect() {
        // Could add particle effects or explosions here
        if (window.EffectsManager) {
            window.EffectsManager.createHitEffect(this.x, this.y);
        }
    }

    removeFromGame() {
        if (this.game && this.game.removeProjectile) {
            this.game.removeProjectile(this);
        } else if (window._game) {
            // Fallback to global game reference
            window._game.projectiles = window._game.projectiles.filter(p => p !== this);
        }
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getVelocity() {
        return this.velocity;
    }

    getOrigin() {
        return this.origin;
    }

    getTarget() {
        return this.target;
    }

    getDistanceTraveled() {
        return this.distanceTraveled;
    }

    getSize() {
        return this.size;
    }

    getColor() {
        return this.color;
    }

    // Rendering method for compatibility
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Optional: Draw projectile trail
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.velocity.x * 3, this.y - this.velocity.y * 3);
        ctx.stroke();
    }
}
window.Projectile = Projectile;
