// PlanetArtist.js - Complete port of PlanetArtist from Java

class PlanetArtist {
    constructor() {
        this.healthBarHeight = 4;
        this.healthBarOffset = 5;
        this.selectionIndicatorSize = 8;
    }

    render(g, planet, game) {
        if (!planet) return;

        const x = planet.getX();
        const y = planet.getY();
        const radius = planet.getActualRadius();
        const operator = planet.getOperator();

        // Get planet color
        let planetColor = this.getPlanetColor(planet, operator);

        // Apply visual effects based on abilities
        if (game && game.getAbilityManager) {
            const abilityManager = game.getAbilityManager();
            if (abilityManager.isPlanetCursed && abilityManager.isPlanetCursed(planet)) {
                planetColor = this.darkenColor(planetColor, 0.5);
            }
            if (abilityManager.isPlanetInfected && abilityManager.isPlanetInfected(planet)) {
                planetColor = this.blendColors(planetColor, '#FF0000', 0.3);
            }
        }

        // Render planet features (rings, moons, craters)
        this.renderPlanetFeatures(g, planet, x, y, radius);

        // Render main planet body
        g.save();
        g.beginPath();
        g.arc(x, y, radius, 0, 2 * Math.PI);
        g.fillStyle = planetColor;
        g.fill();

        // Add gradient shading for 3D effect
        const gradient = g.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        );
        gradient.addColorStop(0, this.lightenColor(planetColor, 0.3));
        gradient.addColorStop(1, this.darkenColor(planetColor, 0.3));
        g.fillStyle = gradient;
        g.fill();

        // Border based on operator
        if (operator) {
            g.strokeStyle = this.getOperatorColor(operator);
            g.lineWidth = 2;
            g.stroke();
        }

        g.restore();

        // Render ability effects
        this.renderAbilityEffects(g, planet, game, x, y, radius);

        // Render health bar
        this.renderHealthBar(g, planet, x, y, radius);

        // Render selection indicator if selected
        if (planet.isSelected && planet.isSelected()) {
            this.renderSelectionIndicator(g, x, y, radius);
        }

        // Render ship count indicator
        this.renderShipCount(g, planet, x, y, radius);
    }

    renderPlanetFeatures(g, planet, x, y, radius) {
        if (!planet.getFeatures) return;

        const features = planet.getFeatures();
        if (!features) return;

        // Render rings
        if (features.hasRings && features.hasRings()) {
            this.renderRings(g, x, y, radius, features.getRings());
        }

        // Render moons
        if (features.getMoons) {
            const moons = features.getMoons();
            if (moons && moons.length > 0) {
                for (const moon of moons) {
                    this.renderMoon(g, moon, x, y);
                }
            }
        }

        // Render craters
        if (features.getCraters) {
            const craters = features.getCraters();
            if (craters && craters.length > 0) {
                for (const crater of craters) {
                    this.renderCrater(g, crater, x, y, radius);
                }
            }
        }
    }

    renderRings(g, x, y, planetRadius, rings) {
        if (!rings) return;

        g.save();
        for (const ring of rings) {
            const innerRadius = planetRadius + ring.innerDistance;
            const outerRadius = planetRadius + ring.outerDistance;
            const alpha = ring.opacity || 0.6;

            g.globalAlpha = alpha;
            g.strokeStyle = ring.color || '#CCCCCC';
            g.lineWidth = outerRadius - innerRadius;

            g.beginPath();
            g.arc(x, y, (innerRadius + outerRadius) / 2, 0, 2 * Math.PI);
            g.stroke();
        }
        g.restore();
    }

    renderMoon(g, moon, planetX, planetY) {
        if (!moon) return;

        const moonX = planetX + moon.getRelativeX();
        const moonY = planetY + moon.getRelativeY();
        const moonRadius = moon.getRadius();

        g.save();
        g.beginPath();
        g.arc(moonX, moonY, moonRadius, 0, 2 * Math.PI);
        g.fillStyle = moon.getColor() || '#888888';
        g.fill();
        g.strokeStyle = '#666666';
        g.lineWidth = 1;
        g.stroke();
        g.restore();
    }

    renderCrater(g, crater, planetX, planetY, planetRadius) {
        if (!crater) return;

        const craterX = planetX + (crater.getRelativeX() * planetRadius);
        const craterY = planetY + (crater.getRelativeY() * planetRadius);
        const craterRadius = crater.getRadius() * planetRadius;

        g.save();
        g.beginPath();
        g.arc(craterX, craterY, craterRadius, 0, 2 * Math.PI);
        g.fillStyle = crater.getColor() || 'rgba(0, 0, 0, 0.3)';
        g.fill();
        g.restore();
    }

    renderAbilityEffects(g, planet, game, x, y, radius) {
        if (!game || !game.getAbilityManager) return;

        const abilityManager = game.getAbilityManager();

        // Shield effect
        if (abilityManager.isShieldActive && abilityManager.isShieldActive() &&
            planet.getOperator && planet.getOperator() === game.getPlayer()) {
            this.renderShieldEffect(g, x, y, radius);
        }

        // Freeze effect
        if (abilityManager.isFreezeActive && abilityManager.isFreezeActive()) {
            this.renderFreezeEffect(g, x, y, radius);
        }

        // Curse effect
        if (abilityManager.isPlanetCursed && abilityManager.isPlanetCursed(planet)) {
            this.renderCurseEffect(g, x, y, radius);
        }

        // Infection effect
        if (abilityManager.isPlanetInfected && abilityManager.isPlanetInfected(planet)) {
            this.renderInfectionEffect(g, x, y, radius);
        }

        // Factory hype effect
        if (abilityManager.isFactoryHypeActive && abilityManager.isFactoryHypeActive() &&
            planet.getOperator && planet.getOperator() === game.getPlayer()) {
            this.renderFactoryHypeEffect(g, x, y, radius);
        }
    }

    renderShieldEffect(g, x, y, radius) {
        const shieldRadius = radius + 8;
        const time = Date.now() * 0.005;

        g.save();
        g.globalAlpha = 0.6 + 0.3 * Math.sin(time);
        g.strokeStyle = '#00FFFF';
        g.lineWidth = 3;
        g.beginPath();
        g.arc(x, y, shieldRadius, 0, 2 * Math.PI);
        g.stroke();

        // Add sparkle effects
        for (let i = 0; i < 8; i++) {
            const angle = (time + i * Math.PI / 4) % (2 * Math.PI);
            const sparkleX = x + Math.cos(angle) * shieldRadius;
            const sparkleY = y + Math.sin(angle) * shieldRadius;

            g.beginPath();
            g.arc(sparkleX, sparkleY, 2, 0, 2 * Math.PI);
            g.fillStyle = '#FFFFFF';
            g.fill();
        }
        g.restore();
    }

    renderFreezeEffect(g, x, y, radius) {
        g.save();
        g.globalAlpha = 0.4;
        g.fillStyle = '#87CEEB';
        g.beginPath();
        g.arc(x, y, radius, 0, 2 * Math.PI);
        g.fill();

        // Ice crystals
        g.strokeStyle = '#FFFFFF';
        g.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x1 = x + Math.cos(angle) * (radius * 0.7);
            const y1 = y + Math.sin(angle) * (radius * 0.7);
            const x2 = x + Math.cos(angle) * (radius * 1.1);
            const y2 = y + Math.sin(angle) * (radius * 1.1);

            g.beginPath();
            g.moveTo(x1, y1);
            g.lineTo(x2, y2);
            g.stroke();
        }
        g.restore();
    }

    renderCurseEffect(g, x, y, radius) {
        const time = Date.now() * 0.01;

        g.save();
        g.globalAlpha = 0.5 + 0.3 * Math.sin(time);
        g.strokeStyle = '#8B008B';
        g.lineWidth = 2;

        // Pulsing dark aura
        g.beginPath();
        g.arc(x, y, radius + 5 + 3 * Math.sin(time), 0, 2 * Math.PI);
        g.stroke();

        // Dark particles
        for (let i = 0; i < 12; i++) {
            const angle = time + (i * Math.PI / 6);
            const distance = radius + 10 + 5 * Math.sin(time + i);
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;

            g.beginPath();
            g.arc(particleX, particleY, 1, 0, 2 * Math.PI);
            g.fillStyle = '#4B0082';
            g.fill();
        }
        g.restore();
    }

    renderInfectionEffect(g, x, y, radius) {
        const time = Date.now() * 0.008;

        g.save();
        g.globalAlpha = 0.7;

        // Pulsing red glow
        const pulseRadius = radius + 5 + 3 * Math.sin(time * 2);
        g.fillStyle = 'rgba(255, 0, 0, 0.3)';
        g.beginPath();
        g.arc(x, y, pulseRadius, 0, 2 * Math.PI);
        g.fill();

        // Infection tendrils
        g.strokeStyle = '#FF4444';
        g.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = time + (i * Math.PI / 4);
            const length = radius + 8 + 4 * Math.sin(time * 3 + i);

            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            g.stroke();
        }
        g.restore();
    }

    renderFactoryHypeEffect(g, x, y, radius) {
        const time = Date.now() * 0.01;

        g.save();
        // Bright production glow
        g.globalAlpha = 0.8;
        g.fillStyle = 'rgba(255, 255, 0, 0.4)';
        g.beginPath();
        g.arc(x, y, radius + 6, 0, 2 * Math.PI);
        g.fill();

        // Production sparks
        for (let i = 0; i < 16; i++) {
            const angle = time + (i * Math.PI / 8);
            const distance = radius + 10 + 5 * Math.sin(time * 4 + i);
            const sparkX = x + Math.cos(angle) * distance;
            const sparkY = y + Math.sin(angle) * distance;

            g.globalAlpha = 0.8 + 0.2 * Math.sin(time * 6 + i);
            g.beginPath();
            g.arc(sparkX, sparkY, 2, 0, 2 * Math.PI);
            g.fillStyle = '#FFFF00';
            g.fill();
        }
        g.restore();
    }

    renderHealthBar(g, planet, x, y, radius) {
        const health = planet.getHealth();
        const maxHealth = planet.getMaxHealth();

        if (health >= maxHealth) return; // Don't show health bar at full health

        const barWidth = radius * 2;
        const barHeight = this.healthBarHeight;
        const barX = x - barWidth / 2;
        const barY = y + radius + this.healthBarOffset;

        g.save();

        // Background
        g.fillStyle = 'rgba(0, 0, 0, 0.5)';
        g.fillRect(barX, barY, barWidth, barHeight);

        // Health fill
        const healthPercent = health / maxHealth;
        let healthColor = '#00FF00';

        if (healthPercent < 0.25) {
            healthColor = '#FF0000';
        } else if (healthPercent < 0.5) {
            healthColor = '#FF8800';
        } else if (healthPercent < 0.75) {
            healthColor = '#FFFF00';
        }

        g.fillStyle = healthColor;
        g.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // Border
        g.strokeStyle = '#FFFFFF';
        g.lineWidth = 1;
        g.strokeRect(barX, barY, barWidth, barHeight);

        g.restore();
    }

    renderSelectionIndicator(g, x, y, radius) {
        const time = Date.now() * 0.01;
        const indicatorRadius = radius + this.selectionIndicatorSize + 2 * Math.sin(time);

        g.save();
        g.strokeStyle = '#FFFFFF';
        g.lineWidth = 3;
        g.globalAlpha = 0.8 + 0.2 * Math.sin(time * 2);

        g.beginPath();
        g.arc(x, y, indicatorRadius, 0, 2 * Math.PI);
        g.stroke();
        g.restore();
    }

    renderShipCount(g, planet, x, y, radius) {
        if (!planet.getShipCount) return;

        const shipCount = planet.getShipCount();
        if (shipCount <= 0) return;

        const text = shipCount.toString();
        g.save();
        g.font = '14px Arial';
        g.fillStyle = '#FFFFFF';
        g.strokeStyle = '#000000';
        g.lineWidth = 2;
        g.textAlign = 'center';
        g.textBaseline = 'middle';

        // Text shadow for visibility
        g.strokeText(text, x, y);
        g.fillText(text, x, y);

        g.restore();
    }

    // Utility methods for color manipulation
    getPlanetColor(planet, operator) {
        // Use visual settings if available
        if (window.VisualSettings && operator) {
            const visualSettings = window.VisualSettings.getInstance();
            if (visualSettings.getPlanetColor) {
                return visualSettings.getPlanetColor(operator);
            }
        }

        // Default colors based on operator type
        if (!operator) return '#888888'; // Neutral planets

        if (operator.constructor.name === 'Player') {
            return '#0066FF'; // Blue for player
        } else {
            // Different colors for different bots
            const colors = ['#FF0000', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];
            return colors[operator.getId ? operator.getId() % colors.length : 0];
        }
    }

    getOperatorColor(operator) {
        if (!operator) return '#888888';

        if (operator.constructor.name === 'Player') {
            return '#FFFFFF';
        } else {
            return '#CCCCCC';
        }
    }

    lightenColor(color, percent) {
        // Simple color lightening
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(255 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(0x1000000 + (R * 0x10000) + (G * 0x100) + B).toString(16).slice(1)}`;
    }

    darkenColor(color, percent) {
        // Simple color darkening
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(255 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(0x1000000 + (R * 0x10000) + (G * 0x100) + B).toString(16).slice(1)}`;
    }

    blendColors(color1, color2, percent) {
        // Simple color blending
        const num1 = parseInt(color1.replace('#', ''), 16);
        const num2 = parseInt(color2.replace('#', ''), 16);

        const R1 = num1 >> 16;
        const G1 = (num1 >> 8) & 0x00FF;
        const B1 = num1 & 0x0000FF;

        const R2 = num2 >> 16;
        const G2 = (num2 >> 8) & 0x00FF;
        const B2 = num2 & 0x0000FF;

        const R = Math.round(R1 + (R2 - R1) * percent);
        const G = Math.round(G1 + (G2 - G1) * percent);
        const B = Math.round(B1 + (B2 - B1) * percent);

        return `#${(0x1000000 + (R * 0x10000) + (G * 0x100) + B).toString(16).slice(1)}`;
    }
}

window.PlanetArtist = PlanetArtist;