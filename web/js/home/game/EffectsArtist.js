// EffectsArtist.js - Complete port of EffectsArtist from Java

class EffectsArtist {
    constructor() {
        this.particlePool = [];
        this.maxParticles = 200;
        this.explosions = [];
        this.notifications = [];
    }

    render(g, game) {
        if (!game) return;

        // Render ability effects
        this.renderAbilityEffects(g, game);

        // Render explosions
        this.renderExplosions(g);

        // Render particles
        this.renderParticles(g);

        // Render black holes
        this.renderBlackHoles(g, game);

        // Render notifications
        this.renderNotifications(g);

        // Render planetary flame effects
        this.renderPlanetaryFlameEffects(g, game);
    }

    renderAbilityEffects(g, game) {
        if (!game.getAbilityManager) return;

        const abilityManager = game.getAbilityManager();

        // Global freeze effect
        if (abilityManager.isFreezeActive && abilityManager.isFreezeActive()) {
            this.renderGlobalFreezeEffect(g);
        }

        // Global shield effect
        if (abilityManager.isShieldActive && abilityManager.isShieldActive()) {
            this.renderGlobalShieldEffect(g, game);
        }

        // Factory hype effect
        if (abilityManager.isFactoryHypeActive && abilityManager.isFactoryHypeActive()) {
            this.renderFactoryHypeEffect(g, game);
        }

        // Improved factories effect
        if (abilityManager.isImprovedFactoriesActive && abilityManager.isImprovedFactoriesActive()) {
            this.renderImprovedFactoriesEffect(g, game);
        }
    }

    renderGlobalFreezeEffect(g) {
        g.save();

        // Ice particle overlay
        const time = Date.now() * 0.002;
        g.globalAlpha = 0.3;

        for (let i = 0; i < 50; i++) {
            const x = (i * 37 + time * 100) % window.GameConstants.getGameWidth();
            const y = (i * 43 + time * 80) % window.GameConstants.getGameHeight();
            const size = 2 + Math.sin(time + i) * 1;

            g.beginPath();
            g.arc(x, y, size, 0, 2 * Math.PI);
            g.fillStyle = '#87CEEB';
            g.fill();
        }

        // Frost overlay
        g.globalAlpha = 0.1;
        g.fillStyle = 'rgba(135, 206, 235, 0.2)';
        g.fillRect(0, 0, window.GameConstants.getGameWidth(), window.GameConstants.getGameHeight());

        g.restore();
    }

    renderGlobalShieldEffect(g, game) {
        const playerPlanets = [];

        for (const planet of game.getPlanets()) {
            if (planet.getOperator() && planet.getOperator().constructor.name === 'Player') {
                playerPlanets.push(planet);
            }
        }

        if (playerPlanets.length === 0) return;

        g.save();
        const time = Date.now() * 0.005;

        // Shield network effect between player planets
        for (let i = 0; i < playerPlanets.length; i++) {
            for (let j = i + 1; j < playerPlanets.length; j++) {
                const planet1 = playerPlanets[i];
                const planet2 = playerPlanets[j];

                g.globalAlpha = 0.3 + 0.2 * Math.sin(time + i + j);
                g.strokeStyle = '#00FFFF';
                g.lineWidth = 2;

                g.beginPath();
                g.moveTo(planet1.getX(), planet1.getY());
                g.lineTo(planet2.getX(), planet2.getY());
                g.stroke();

                // Energy pulses along the lines
                const pulseProgress = (time + i + j) % 1;
                const pulseX = planet1.getX() + (planet2.getX() - planet1.getX()) * pulseProgress;
                const pulseY = planet1.getY() + (planet2.getY() - planet1.getY()) * pulseProgress;

                g.beginPath();
                g.arc(pulseX, pulseY, 3, 0, 2 * Math.PI);
                g.fillStyle = '#FFFFFF';
                g.fill();
            }
        }

        g.restore();
    }

    renderFactoryHypeEffect(g, game) {
        const playerPlanets = [];

        for (const planet of game.getPlanets()) {
            if (planet.getOperator() && planet.getOperator().constructor.name === 'Player') {
                playerPlanets.push(planet);
            }
        }

        g.save();
        const time = Date.now() * 0.01;

        for (const planet of playerPlanets) {
            const x = planet.getX();
            const y = planet.getY();
            const radius = planet.getActualRadius();

            // Production sparks
            for (let i = 0; i < 12; i++) {
                const angle = time + (i * Math.PI / 6);
                const distance = radius + 15 + 8 * Math.sin(time * 3 + i);
                const sparkX = x + Math.cos(angle) * distance;
                const sparkY = y + Math.sin(angle) * distance;

                g.globalAlpha = 0.7 + 0.3 * Math.sin(time * 4 + i);
                g.beginPath();
                g.arc(sparkX, sparkY, 2, 0, 2 * Math.PI);
                g.fillStyle = '#FFFF00';
                g.fill();
            }

            // Production energy rings
            for (let ring = 0; ring < 3; ring++) {
                const ringRadius = radius + 10 + ring * 8 + 4 * Math.sin(time * 2 + ring);
                g.globalAlpha = 0.4 - ring * 0.1;
                g.strokeStyle = '#FFD700';
                g.lineWidth = 2;

                g.beginPath();
                g.arc(x, y, ringRadius, 0, 2 * Math.PI);
                g.stroke();
            }
        }

        g.restore();
    }

    renderImprovedFactoriesEffect(g, game) {
        const playerShips = [];

        for (const ship of game.getShips()) {
            if (ship.getOperator() && ship.getOperator().constructor.name === 'Player') {
                playerShips.push(ship);
            }
        }

        g.save();
        const time = Date.now() * 0.01;

        for (const ship of playerShips) {
            const x = ship.getX();
            const y = ship.getY();

            // Enhancement aura
            g.globalAlpha = 0.4 + 0.3 * Math.sin(time);
            g.strokeStyle = '#00FF00';
            g.lineWidth = 2;

            g.beginPath();
            g.arc(x, y, 12 + 3 * Math.sin(time * 2), 0, 2 * Math.PI);
            g.stroke();

            // Enhancement particles
            for (let i = 0; i < 6; i++) {
                const angle = time + (i * Math.PI / 3);
                const distance = 15 + 3 * Math.sin(time + i);
                const particleX = x + Math.cos(angle) * distance;
                const particleY = y + Math.sin(angle) * distance;

                g.beginPath();
                g.arc(particleX, particleY, 1, 0, 2 * Math.PI);
                g.fillStyle = '#00FF00';
                g.fill();
            }
        }

        g.restore();
    }

    renderBlackHoles(g, game) {
        if (!game.getAbilityManager) return;

        const abilityManager = game.getAbilityManager();
        const blackHoles = abilityManager.getBlackHoles ? abilityManager.getBlackHoles() : [];

        g.save();

        for (const blackHole of blackHoles) {
            if (blackHole.render) {
                blackHole.render(g);
            } else {
                // Fallback rendering if BlackHole doesn't have render method
                this.renderBlackHoleFallback(g, blackHole);
            }

            // Render gravitational distortion effect
            this.renderGravitationalDistortion(g, blackHole);
        }

        g.restore();
    }

    renderBlackHoleFallback(g, blackHole) {
        const x = blackHole.getX();
        const y = blackHole.getY();
        const eventHorizon = blackHole.getEventHorizon();
        const time = Date.now() * 0.01;

        // Event horizon
        g.save();
        g.globalAlpha = 0.9;
        g.beginPath();
        g.arc(x, y, eventHorizon / 2, 0, 2 * Math.PI);
        g.fillStyle = '#000000';
        g.fill();

        // Accretion disk
        for (let i = 0; i < 3; i++) {
            const radius = eventHorizon / 2 + (i + 1) * 8;
            g.globalAlpha = 0.4 - i * 0.1;
            g.strokeStyle = `hsl(${30 + i * 20}, 100%, 60%)`;
            g.lineWidth = 3;

            g.beginPath();
            g.arc(x, y, radius, 0, 2 * Math.PI);
            g.stroke();
        }

        // Rotating particles
        const particles = blackHole.getOrbitingParticles ? blackHole.getOrbitingParticles() : [];
        g.fillStyle = 'rgba(255, 200, 100, 0.8)';
        for (const particle of particles) {
            g.beginPath();
            g.arc(particle.x, particle.y, 2, 0, 2 * Math.PI);
            g.fill();
        }

        g.restore();
    }

    renderGravitationalDistortion(g, blackHole) {
        const x = blackHole.getX();
        const y = blackHole.getY();
        const eventHorizon = blackHole.getEventHorizon();
        const time = Date.now() * 0.005;

        g.save();

        // Distortion waves
        for (let wave = 0; wave < 4; wave++) {
            const waveRadius = eventHorizon / 2 + wave * 15 + 5 * Math.sin(time + wave);
            const alpha = 0.3 - wave * 0.06;

            g.globalAlpha = alpha;
            g.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            g.lineWidth = 2;

            g.beginPath();
            g.arc(x, y, waveRadius, 0, 2 * Math.PI);
            g.stroke();
        }

        g.restore();
    }

    renderPlanetaryFlameEffects(g, game) {
        if (!game.getAbilityManager) return;

        const abilityManager = game.getAbilityManager();
        if (!abilityManager.isPlanetaryFlameActive || !abilityManager.isPlanetaryFlameActive()) return;

        const playerPlanets = [];
        for (const planet of game.getPlanets()) {
            if (planet.getOperator() && planet.getOperator().constructor.name === 'Player') {
                playerPlanets.push(planet);
            }
        }

        const flameCount = Math.max(1, Math.floor(playerPlanets.length / 2));
        const time = Date.now() * 0.002;

        g.save();

        for (let i = 0; i < Math.min(flameCount, playerPlanets.length); i++) {
            const flamePlanet = playerPlanets[i];
            const x = flamePlanet.getX();
            const y = flamePlanet.getY();
            const flameLength = 500; // Default flame length

            for (let tower = 0; tower < 2; tower++) {
                const towerAngle = time + (tower * Math.PI);

                // Flame beam
                g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 4);

                const gradient = g.createLinearGradient(x, y,
                    x + Math.cos(towerAngle) * flameLength,
                    y + Math.sin(towerAngle) * flameLength);

                gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
                gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.6)');
                gradient.addColorStop(1, 'rgba(255, 255, 0, 0.2)');

                g.strokeStyle = gradient;
                g.lineWidth = 15;

                g.beginPath();
                g.moveTo(x, y);
                g.lineTo(x + Math.cos(towerAngle) * flameLength,
                    y + Math.sin(towerAngle) * flameLength);
                g.stroke();

                // Flame particles
                for (let j = 0; j < 20; j++) {
                    const particleDistance = (j / 20) * flameLength;
                    const particleAngle = towerAngle + (Math.random() - 0.5) * 0.3;
                    const particleX = x + Math.cos(particleAngle) * particleDistance;
                    const particleY = y + Math.sin(particleAngle) * particleDistance;

                    g.globalAlpha = 0.8 - (j / 20) * 0.6;
                    g.beginPath();
                    g.arc(particleX, particleY, 3 + Math.random() * 2, 0, 2 * Math.PI);
                    g.fillStyle = j < 10 ? '#FF4444' : '#FFAA00';
                    g.fill();
                }
            }
        }

        g.restore();
    }

    renderExplosions(g) {
        g.save();

        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            const elapsed = Date.now() - explosion.startTime;
            const progress = elapsed / explosion.duration;

            if (progress >= 1) {
                this.explosions.splice(i, 1);
                continue;
            }

            const alpha = 1 - progress;
            const radius = explosion.maxRadius * progress;

            g.globalAlpha = alpha;

            // Explosion flash
            const gradient = g.createRadialGradient(explosion.x, explosion.y, 0,
                explosion.x, explosion.y, radius);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(255, 200, 0, 0.8)');
            gradient.addColorStop(0.6, 'rgba(255, 100, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0.2)');

            g.fillStyle = gradient;
            g.beginPath();
            g.arc(explosion.x, explosion.y, radius, 0, 2 * Math.PI);
            g.fill();

            // Explosion particles
            for (let j = 0; j < explosion.particleCount; j++) {
                const angle = (j / explosion.particleCount) * 2 * Math.PI;
                const particleDistance = radius * 0.8 + Math.random() * radius * 0.4;
                const particleX = explosion.x + Math.cos(angle) * particleDistance;
                const particleY = explosion.y + Math.sin(angle) * particleDistance;

                g.beginPath();
                g.arc(particleX, particleY, 2, 0, 2 * Math.PI);
                g.fillStyle = '#FFAA00';
                g.fill();
            }
        }

        g.restore();
    }

    renderParticles(g) {
        g.save();

        for (let i = this.particlePool.length - 1; i >= 0; i--) {
            const particle = this.particlePool[i];

            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;

            if (particle.life <= 0) {
                this.particlePool.splice(i, 1);
                continue;
            }

            const alpha = particle.life / particle.maxLife;
            g.globalAlpha = alpha;

            g.beginPath();
            g.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
            g.fillStyle = particle.color;
            g.fill();
        }

        g.restore();
    }

    renderNotifications(g) {
        const currentTime = Date.now();

        g.save();
        g.font = '16px Arial';
        g.textAlign = 'center';

        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            const elapsed = currentTime - notification.startTime;

            if (elapsed >= notification.duration) {
                this.notifications.splice(i, 1);
                continue;
            }

            const progress = elapsed / notification.duration;
            const alpha = progress < 0.1 ? progress / 0.1 :
                progress > 0.9 ? (1 - progress) / 0.1 : 1;

            g.globalAlpha = alpha;
            g.fillStyle = notification.color || '#FFFFFF';
            g.strokeStyle = '#000000';
            g.lineWidth = 2;

            const y = 50 + i * 25 - progress * 20; // Float upward

            g.strokeText(notification.text, window.GameConstants.getGameWidth() / 2, y);
            g.fillText(notification.text, window.GameConstants.getGameWidth() / 2, y);
        }

        g.restore();
    }

    // Public methods for creating effects
    addExplosion(x, y, maxRadius = 30, duration = 500, particleCount = 8) {
        this.explosions.push({
            x, y, maxRadius, duration, particleCount,
            startTime: Date.now()
        });
    }

    addParticle(x, y, vx, vy, color, size = 2, life = 30) {
        if (this.particlePool.length >= this.maxParticles) return;

        this.particlePool.push({
            x, y, vx, vy, color, size, life,
            maxLife: life
        });
    }

    addNotification(text, color = '#FFFFFF', duration = 3000) {
        this.notifications.push({
            text, color, duration,
            startTime: Date.now()
        });
    }

    // Utility methods
    createParticleBurst(x, y, count, color, speed = 2) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * 2 * Math.PI;
            const vx = Math.cos(angle) * speed * (0.5 + Math.random() * 0.5);
            const vy = Math.sin(angle) * speed * (0.5 + Math.random() * 0.5);

            this.addParticle(x, y, vx, vy, color, 2 + Math.random() * 2, 20 + Math.random() * 20);
        }
    }

    clearAllEffects() {
        this.explosions = [];
        this.particlePool = [];
        this.notifications = [];
    }
}

window.EffectsArtist = EffectsArtist;