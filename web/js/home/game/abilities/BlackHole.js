// BlackHole.js - Complete port of BlackHole ability from Java

class BlackHole {
    constructor(x, y, eventHorizon, expiryTime, owner) {
        this.x = x;
        this.y = y;
        this.eventHorizon = eventHorizon;
        this.expiryTime = expiryTime;
        this.owner = owner;
        this.rotationAngle = 0;
        this.orbitingParticles = [];

        // Create orbiting particles for visual effect
        for (let i = 0; i < 12; i++) {
            this.orbitingParticles.push({
                angle: (i / 12) * 2 * Math.PI,
                distance: eventHorizon * 0.6,
                speed: 0.02 + Math.random() * 0.03
            });
        }
    }

    isExpired() {
        return Date.now() >= this.expiryTime;
    }

    getRemainingTime() {
        return Math.max(0, this.expiryTime - Date.now());
    }

    getX() { return this.x; }
    getY() { return this.y; }
    getEventHorizon() { return this.eventHorizon; }
    getOwner() { return this.owner; }
    getRotationAngle() { return this.rotationAngle; }

    // Update black hole state
    tick() {
        this.rotationAngle += 0.1;

        // Update orbiting particles
        for (const particle of this.orbitingParticles) {
            particle.angle += particle.speed;
            if (particle.angle >= 2 * Math.PI) {
                particle.angle -= 2 * Math.PI;
            }
        }
    }

    // Get positions of orbiting particles for rendering
    getOrbitingParticles() {
        return this.orbitingParticles.map(particle => ({
            x: this.x + Math.cos(particle.angle) * particle.distance,
            y: this.y + Math.sin(particle.angle) * particle.distance,
            distance: particle.distance
        }));
    }

    // Check if a point is within the event horizon
    isWithinEventHorizon(x, y) {
        const distance = Math.hypot(x - this.x, y - this.y);
        return distance < this.eventHorizon / 2.0;
    }

    // Calculate gravitational pull on a point (for visual effects)
    getGravitationalPull(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        const distance = Math.hypot(dx, dy);

        if (distance === 0) return { x: 0, y: 0 };

        const force = Math.min(1.0, (this.eventHorizon / 2.0) / distance);
        return {
            x: (dx / distance) * force,
            y: (dy / distance) * force
        };
    }

    // Render method for visual effects
    render(g) {
        const currentTime = Date.now();
        const timeLeft = Math.max(0, this.expiryTime - currentTime);
        const totalDuration = 10000; // Assume 10 second duration
        let alpha = Math.min(1.0, timeLeft / totalDuration);

        if (alpha <= 0) return;

        g.save();
        g.globalAlpha = alpha;

        // Draw event horizon
        g.beginPath();
        g.arc(this.x, this.y, this.eventHorizon / 2.0, 0, 2 * Math.PI);
        g.fillStyle = 'rgba(0, 0, 0, 0.8)';
        g.fill();

        // Draw accretion disk effect
        for (let i = 0; i < 3; i++) {
            const radius = (this.eventHorizon / 2.0) + (i * 10);
            g.beginPath();
            g.arc(this.x, this.y, radius, 0, 2 * Math.PI);
            g.strokeStyle = `rgba(255, 100, 0, ${0.3 - i * 0.1})`;
            g.lineWidth = 2;
            g.stroke();
        }

        // Draw orbiting particles
        const particles = this.getOrbitingParticles();
        g.fillStyle = 'rgba(255, 200, 100, 0.8)';
        for (const particle of particles) {
            g.beginPath();
            g.arc(particle.x, particle.y, 2, 0, 2 * Math.PI);
            g.fill();
        }

        g.restore();
    }
}

window.BlackHole = BlackHole;
