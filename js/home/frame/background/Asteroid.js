// Ported from Asteroid.java
// 1-to-1 port from Java
class Asteroid {
    constructor(gameWidth, gameHeight) {
        // Random spawn location (start from edges)
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: this.x = Math.floor(Math.random() * gameWidth); this.y = -10; break;
            case 1: this.x = gameWidth + 10; this.y = Math.floor(Math.random() * gameHeight); break;
            case 2: this.x = Math.floor(Math.random() * gameWidth); this.y = gameHeight + 10; break;
            case 3: this.x = -10; this.y = Math.floor(Math.random() * gameHeight); break;
        }
        const targetX = Math.random() * gameWidth;
        const targetY = Math.random() * gameHeight;
        const deltaX = targetX - this.x;
        const deltaY = targetY - this.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const speed = 2 + Math.random() * 3;
        this.velocityX = (deltaX / distance) * speed;
        this.velocityY = (deltaY / distance) * speed;
        this.size = 2 + Math.floor(Math.random() * 7);
        const gray = 150 + Math.floor(Math.random() * 80);
        this.color = `rgb(${gray},${gray - 10},${gray - 20})`;
        this.active = true;
        this.numShapePoints = Math.max(8, this.size);
        this.shapeXPoints = [];
        this.shapeYPoints = [];
        for (let p = 0; p < this.numShapePoints; p++) {
            const angle = (p * 2 * Math.PI) / this.numShapePoints;
            const wavePhase1 = angle * 3 + Math.random() * Math.PI * 2;
            const wavePhase2 = angle * 7 + Math.random() * Math.PI * 2;
            const wavePhase3 = angle * 11 + Math.random() * Math.PI * 2;
            const waveOffset = 0.2 * Math.sin(wavePhase1) + 0.1 * Math.sin(wavePhase2) + 0.05 * Math.sin(wavePhase3);
            const baseRadius = this.size / 2.0;
            const wavyRadius = baseRadius * (0.7 + 0.3 * (1.0 + waveOffset));
            this.shapeXPoints[p] = Math.round(Math.cos(angle) * wavyRadius);
            this.shapeYPoints[p] = Math.round(Math.sin(angle) * wavyRadius);
        }
    }
    tick() { this.update(); }
    update() {
        if (!this.active) return;
        this.x += this.velocityX;
        this.y += this.velocityY;
        if (this.x < -20 || this.x > 2000 + 20 || this.y < -20 || this.y > 1200 + 20) this.active = false;
    }
    render(ctx) {
        if (!this.active) return;
        this.drawWavyAsteroid(ctx, Math.round(this.x), Math.round(this.y), this.size, this.color);
        for (let i = 1; i <= 5; i++) {
            const trailX = this.x - this.velocityX * i * 0.5;
            const trailY = this.y - this.velocityY * i * 0.5;
            if (trailX >= 0 && trailX < 2000 && trailY >= 0 && trailY < 1200) {
                const alpha = Math.max(0, 0.8 - (i * 0.15));
                const trailColor = `rgba(${this.color.split(',')[0].replace('rgb(', '')},${alpha})`;
                const trailSize = Math.max(1, this.size - i);
                this.drawWavyAsteroid(ctx, Math.round(trailX), Math.round(trailY), trailSize, trailColor);
            }
        }
    }
    drawWavyAsteroid(ctx, centerX, centerY, asteroidSize, asteroidColor) {
        const sizeScale = asteroidSize / this.size;
        const xPoints = [];
        const yPoints = [];
        for (let p = 0; p < this.numShapePoints; p++) {
            xPoints[p] = centerX + this.shapeXPoints[p] * sizeScale;
            yPoints[p] = centerY + this.shapeYPoints[p] * sizeScale;
        }
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(xPoints[0], yPoints[0]);
        for (let i = 1; i < this.numShapePoints; i++) ctx.lineTo(xPoints[i], yPoints[i]);
        ctx.closePath();
        ctx.fillStyle = asteroidColor;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
    isActive() { return this.active; }
    deactivate() { this.active = false; }
}
if (typeof module !== 'undefined') module.exports = Asteroid;