// Ported from Star.java
// 1-to-1 port from Java
class Star {
    static StarType = {
        COMMON: 'COMMON',
        UNCOMMON: 'UNCOMMON',
        RARE: 'RARE',
        VERY_RARE: 'VERY_RARE'
    };
    static StarShape = {
        DIAMOND: 'DIAMOND',
        OVAL: 'OVAL',
        STAR: 'STAR'
    };
    constructor(x, y, size, brightness, type) {
        this.x = x;
        this.y = y;
        this.baseY = y;
        this.baseSize = size;
        this.currentSize = size;
        this.brightness = brightness;
        this.type = type;
        this.twinkleRate = 0.1 / size;
        this.twinkleFactor = Math.random() * Math.PI * 2;
        this.movementSpeed = 0.1 + (size * 0.05);
        this.sineOffset = Math.random() * Math.PI * 2;
        this.sineAmplitude = 10 + (size * 5);
        this.secondarySineOffset = Math.random() * Math.PI * 2;
        this.secondaryAmplitude = 5 + (size * 2);
        this.verticalDrift = (Math.random() - 0.5) * 0.02;
        // Random star shape
        const shapes = Object.values(Star.StarShape);
        this.starShape = shapes[Math.floor(Math.random() * shapes.length)];
        // Color based on type
        switch (type) {
            case Star.StarType.COMMON: this.baseColor = 'rgba(255,255,0,0.7)'; break;
            case Star.StarType.UNCOMMON: this.baseColor = 'rgba(255,0,0,0.8)'; break;
            case Star.StarType.RARE: this.baseColor = 'rgba(0,0,255,0.9)'; break;
            case Star.StarType.VERY_RARE: this.baseColor = 'rgba(255,255,255,1.0)'; break;
            default: this.baseColor = 'rgba(255,255,255,0.7)';
        }
    }
    getX() { return Math.round(this.x); }
    getY() { return Math.round(this.y); }
    getSize() { return this.currentSize; }
    getBrightness() { return this.brightness; }
    getCurrentColor() {
        const colorShift = Math.sin(this.twinkleFactor) * 0.3;
        let r = Math.max(0, Math.min(255, Math.round(255 * (1 + colorShift * 0.5))));
        let g = Math.max(0, Math.min(255, Math.round(255 * (1 + colorShift * 0.5))));
        let b = Math.max(0, Math.min(255, Math.round(255 * (1 + colorShift * 0.5))));
        const brightnessFactor = this.brightness / 255.0;
        r = Math.round(r * brightnessFactor);
        g = Math.round(g * brightnessFactor);
        b = Math.round(b * brightnessFactor);
        return `rgb(${r},${g},${b})`;
    }
    getType() { return this.type; }
    getShape() { return this.starShape; }
    update(screenWidth = 2000) {
        this.x += this.movementSpeed;
        if (this.x > screenWidth + this.baseSize) this.x = -this.baseSize;
        const primaryWave = Math.sin((this.x * 0.01) + this.sineOffset) * this.sineAmplitude;
        const secondaryWave = Math.sin((this.x * 0.03) + this.secondarySineOffset) * this.secondaryAmplitude;
        this.baseY += this.verticalDrift;
        if (this.baseY < -50) this.baseY = 1200 + 50;
        if (this.baseY > 1200 + 50) this.baseY = -50;
        this.y = this.baseY + primaryWave + secondaryWave;
        const brightnessVariation = Math.sin(this.twinkleFactor) * 30;
        this.brightness = Math.max(100, Math.min(255, Math.round(200 + brightnessVariation)));
        const maxVariation = Math.min(0.8, this.baseSize * 0.3);
        const sizeVariation = Math.sin(this.twinkleFactor * 1.5) * maxVariation;
        this.currentSize = Math.max(1, Math.round(this.baseSize + sizeVariation));
        this.twinkleFactor += this.twinkleRate;
    }
    twinkle() { this.update(); }
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.brightness / 255;
        ctx.fillStyle = this.getCurrentColor();
        switch (this.starShape) {
            case Star.StarShape.DIAMOND:
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - this.currentSize);
                ctx.lineTo(this.x + this.currentSize, this.y);
                ctx.lineTo(this.x, this.y + this.currentSize);
                ctx.lineTo(this.x - this.currentSize, this.y);
                ctx.closePath();
                ctx.fill();
                break;
            case Star.StarShape.OVAL:
                ctx.beginPath();
                ctx.ellipse(this.x, this.y, this.currentSize, this.currentSize / 2, 0, 0, 2 * Math.PI);
                ctx.fill();
                break;
            case Star.StarShape.STAR:
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (Math.PI * 2 * i) / 5;
                    const radius = this.currentSize;
                    ctx.lineTo(this.x + Math.cos(angle) * radius, this.y + Math.sin(angle) * radius);
                }
                ctx.closePath();
                ctx.fill();
                break;
        }
        ctx.restore();
    }
}
if (typeof module !== 'undefined') module.exports = Star;