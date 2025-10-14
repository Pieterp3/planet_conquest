// ShipArtist.js - Complete port of ShipArtist from Java

class ShipArtist {
    constructor() {
        this.trailLength = 15;
        this.trailFadeSteps = 10;
        this.shipSize = 8;
    }

    render(g, ship, game) {
        if (!ship) return;

        const x = ship.getX();
        const y = ship.getY();
        const operator = ship.getOperator();

        // Render movement trail
        this.renderMovementTrail(g, ship);

        // Render ship body
        this.renderShipBody(g, ship, x, y, operator);

        // Render special effects based on abilities or ship type
        this.renderSpecialEffects(g, ship, game, x, y);

        // Render targeting line if ship has a destination
        this.renderTargetingLine(g, ship);

        // Render combat status indicators
        this.renderCombatIndicators(g, ship, game, x, y);
    }

    renderShipBody(g, ship, x, y, operator) {
        const shipSize = ship.getSize ? ship.getSize() : this.shipSize;
        let shipColor = this.getShipColor(operator);

        // Check for ability modifications
        if (this.isShipUnstoppable(ship)) {
            shipColor = this.blendColors(shipColor, '#FFD700', 0.5); // Golden tint
        }

        // Determine ship shape based on type
        if (ship.isMissile && ship.isMissile()) {
            this.renderMissile(g, x, y, shipSize, shipColor, ship.getDirection());
        } else {
            this.renderStandardShip(g, x, y, shipSize, shipColor, ship.getDirection());
        }
    }

    renderStandardShip(g, x, y, size, color, direction = 0) {
        g.save();
        g.translate(x, y);
        g.rotate(direction);

        // Ship body (triangle)
        g.beginPath();
        g.moveTo(size, 0);
        g.lineTo(-size / 2, -size / 2);
        g.lineTo(-size / 2, size / 2);
        g.closePath();

        g.fillStyle = color;
        g.fill();

        // Ship border
        g.strokeStyle = this.lightenColor(color, 0.3);
        g.lineWidth = 1;
        g.stroke();

        // Engine glow
        g.beginPath();
        g.moveTo(-size / 2, -size / 4);
        g.lineTo(-size, 0);
        g.lineTo(-size / 2, size / 4);
        g.fillStyle = this.lightenColor(color, 0.6);
        g.fill();

        g.restore();
    }

    renderMissile(g, x, y, size, color, direction = 0) {
        g.save();
        g.translate(x, y);
        g.rotate(direction);

        // Missile body (elongated)
        g.beginPath();
        g.moveTo(size * 1.5, 0);
        g.lineTo(-size, -size / 3);
        g.lineTo(-size, size / 3);
        g.closePath();

        g.fillStyle = color;
        g.fill();

        // Missile fins
        g.beginPath();
        g.moveTo(-size, -size / 3);
        g.lineTo(-size * 1.3, -size / 2);
        g.lineTo(-size, 0);
        g.moveTo(-size, size / 3);
        g.lineTo(-size * 1.3, size / 2);
        g.lineTo(-size, 0);

        g.strokeStyle = this.darkenColor(color, 0.3);
        g.lineWidth = 2;
        g.stroke();

        // Missile exhaust
        for (let i = 0; i < 3; i++) {
            const exhaustLength = size + Math.random() * size / 2;
            g.beginPath();
            g.moveTo(-size, (-size / 6) + (i * size / 6));
            g.lineTo(-size - exhaustLength, (-size / 6) + (i * size / 6));
            g.strokeStyle = i === 1 ? '#FFFF00' : '#FF8800';
            g.lineWidth = 2;
            g.stroke();
        }

        g.restore();
    }

    renderMovementTrail(g, ship) {
        if (!ship.getTrailHistory) return;

        const trail = ship.getTrailHistory();
        if (!trail || trail.length < 2) return;

        const shipColor = this.getShipColor(ship.getOperator());

        g.save();
        for (let i = 1; i < trail.length; i++) {
            const point = trail[i];
            const prevPoint = trail[i - 1];

            const alpha = (i / trail.length) * 0.5;
            const width = Math.max(1, (i / trail.length) * 3);

            g.globalAlpha = alpha;
            g.strokeStyle = shipColor;
            g.lineWidth = width;

            g.beginPath();
            g.moveTo(prevPoint.x, prevPoint.y);
            g.lineTo(point.x, point.y);
            g.stroke();
        }
        g.restore();
    }

    renderTargetingLine(g, ship) {
        if (!ship.getDestination) return;

        const destination = ship.getDestination();
        if (!destination) return;

        const startX = ship.getX();
        const startY = ship.getY();
        const endX = destination.getX();
        const endY = destination.getY();

        // Don't draw line if ship is very close to destination
        const distance = Math.hypot(endX - startX, endY - startY);
        if (distance < 20) return;

        g.save();
        g.globalAlpha = 0.3;
        g.strokeStyle = this.getShipColor(ship.getOperator());
        g.lineWidth = 1;

        // Dashed line
        g.setLineDash([5, 5]);
        g.beginPath();
        g.moveTo(startX, startY);
        g.lineTo(endX, endY);
        g.stroke();

        g.restore();
    }

    renderSpecialEffects(g, ship, game, x, y) {
        // Shield effect for protected ships
        if (this.isShipShielded(ship, game)) {
            this.renderShieldEffect(g, x, y);
        }

        // Freeze effect for frozen ships
        if (this.isShipFrozen(ship, game)) {
            this.renderFreezeEffect(g, x, y);
        }

        // Unstoppable effect
        if (this.isShipUnstoppable(ship)) {
            this.renderUnstoppableEffect(g, x, y);
        }

        // Missile trail effect
        if (ship.isMissile && ship.isMissile()) {
            this.renderMissileTrail(g, ship);
        }
    }

    renderShieldEffect(g, x, y) {
        const time = Date.now() * 0.01;
        const radius = this.shipSize + 4 + 2 * Math.sin(time);

        g.save();
        g.globalAlpha = 0.4 + 0.2 * Math.sin(time * 2);
        g.strokeStyle = '#00FFFF';
        g.lineWidth = 2;

        g.beginPath();
        g.arc(x, y, radius, 0, 2 * Math.PI);
        g.stroke();
        g.restore();
    }

    renderFreezeEffect(g, x, y) {
        g.save();
        g.globalAlpha = 0.6;

        // Ice crystal overlay
        g.strokeStyle = '#87CEEB';
        g.lineWidth = 2;

        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const length = this.shipSize;

            g.beginPath();
            g.moveTo(x + Math.cos(angle) * length / 2, y + Math.sin(angle) * length / 2);
            g.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            g.stroke();
        }
        g.restore();
    }

    renderUnstoppableEffect(g, x, y) {
        const time = Date.now() * 0.02;

        g.save();
        // Golden aura
        g.globalAlpha = 0.5 + 0.3 * Math.sin(time);
        g.fillStyle = 'rgba(255, 215, 0, 0.3)';

        g.beginPath();
        g.arc(x, y, this.shipSize + 6, 0, 2 * Math.PI);
        g.fill();

        // Sparks
        for (let i = 0; i < 8; i++) {
            const angle = time + (i * Math.PI / 4);
            const distance = this.shipSize + 8 + 4 * Math.sin(time * 2 + i);
            const sparkX = x + Math.cos(angle) * distance;
            const sparkY = y + Math.sin(angle) * distance;

            g.beginPath();
            g.arc(sparkX, sparkY, 1, 0, 2 * Math.PI);
            g.fillStyle = '#FFD700';
            g.fill();
        }
        g.restore();
    }

    renderMissileTrail(g, ship) {
        const x = ship.getX();
        const y = ship.getY();
        const direction = ship.getDirection();

        g.save();
        g.translate(x, y);
        g.rotate(direction + Math.PI); // Trail goes opposite to movement

        // Exhaust flames
        for (let i = 0; i < 5; i++) {
            const trailLength = 15 + Math.random() * 10;
            const trailWidth = 3 - i * 0.5;
            const alpha = 0.8 - i * 0.15;

            g.globalAlpha = alpha;
            g.strokeStyle = i < 2 ? '#FFFFFF' : (i < 4 ? '#FFFF00' : '#FF8800');
            g.lineWidth = trailWidth;

            g.beginPath();
            g.moveTo(0, 0);
            g.lineTo(trailLength + Math.random() * 5, (Math.random() - 0.5) * 4);
            g.stroke();
        }
        g.restore();
    }

    renderCombatIndicators(g, ship, game, x, y) {
        if (!game || !game.getCombatManager) return;

        const combatManager = game.getCombatManager();
        if (!combatManager.isInCombat || !combatManager.isInCombat(ship)) return;

        // Combat indicator ring
        const time = Date.now() * 0.02;
        const radius = this.shipSize + 6 + 2 * Math.sin(time);

        g.save();
        g.globalAlpha = 0.6 + 0.4 * Math.sin(time * 2);
        g.strokeStyle = '#FF0000';
        g.lineWidth = 2;

        g.beginPath();
        g.arc(x, y, radius, 0, 2 * Math.PI);
        g.stroke();

        // Combat sparks
        for (let i = 0; i < 6; i++) {
            const angle = time + (i * Math.PI / 3);
            const sparkDistance = radius + 3;
            const sparkX = x + Math.cos(angle) * sparkDistance;
            const sparkY = y + Math.sin(angle) * sparkDistance;

            g.beginPath();
            g.arc(sparkX, sparkY, 1, 0, 2 * Math.PI);
            g.fillStyle = '#FFAA00';
            g.fill();
        }
        g.restore();
    }

    // Utility methods to check ship states
    isShipShielded(ship, game) {
        if (!game || !game.getAbilityManager) return false;

        const abilityManager = game.getAbilityManager();
        const operator = ship.getOperator();

        if (operator && operator.constructor.name === 'Player') {
            return abilityManager.isShieldActive && abilityManager.isShieldActive();
        }

        return false;
    }

    isShipFrozen(ship, game) {
        if (!game || !game.getAbilityManager) return false;

        const abilityManager = game.getAbilityManager();
        return abilityManager.isFreezeActive && abilityManager.isFreezeActive();
    }

    isShipUnstoppable(ship) {
        // Check if ship has unstoppable ability active
        return ship.isUnstoppable && ship.isUnstoppable();
    }

    // Utility methods for colors
    getShipColor(operator) {
        if (!operator) return '#FFFFFF';

        if (operator.constructor.name === 'Player') {
            return '#0066FF';
        } else {
            // Different colors for different bots
            const colors = ['#FF0000', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];
            return colors[operator.getId ? operator.getId() % colors.length : 0];
        }
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(255 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(0x1000000 + (R * 0x10000) + (G * 0x100) + B).toString(16).slice(1)}`;
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(255 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(0x1000000 + (R * 0x10000) + (G * 0x100) + B).toString(16).slice(1)}`;
    }

    blendColors(color1, color2, percent) {
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

window.ShipArtist = ShipArtist;