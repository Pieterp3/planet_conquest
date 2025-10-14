// BackgroundArtist.js - Port of BackgroundArtist from Java
// 1-to-1 port from Java background rendering system

// Star types with colors and shapes
const StarType = {
    COMMON: { color: '#ffffff', twinkling: false, shape: 'OVAL' },
    UNCOMMON: { color: '#ffffaa', twinkling: true, shape: 'DIAMOND' },
    RARE: { color: '#aaaaff', twinkling: true, shape: 'STAR' },
    VERY_RARE: { color: '#ffaaaa', twinkling: true, shape: 'STAR' }
};

// Star class
class Star {
    constructor(x, y, size, brightness, type) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.brightness = brightness;
        this.type = type;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.05 + Math.random() * 0.05;
        this.shape = type.shape;
    }

    update(screenWidth) {
        if (this.type.twinkling) {
            this.twinklePhase += this.twinkleSpeed;
            if (this.twinklePhase > Math.PI * 2) {
                this.twinklePhase -= Math.PI * 2;
            }
        }
    }

    getCurrentColor() {
        let baseColor = this.type.color;
        if (this.type.twinkling) {
            let twinkle = 0.7 + 0.3 * Math.sin(this.twinklePhase);
            let r = parseInt(baseColor.substr(1, 2), 16) * twinkle;
            let g = parseInt(baseColor.substr(3, 2), 16) * twinkle;
            let b = parseInt(baseColor.substr(5, 2), 16) * twinkle;
            return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        }
        return baseColor;
    }

    getShape() { return this.shape; }
    getX() { return this.x; }
    getY() { return this.y; }
    getSize() { return this.size; }
}

// Asteroid class
class Asteroid {
    constructor() {
        this.x = Math.random() * (window.GameConstants ? window.GameConstants.getGameWidth() : 1280);
        this.y = -10;
        this.speed = 0.5 + Math.random() * 2;
        this.rotation = 0;
        this.rotationSpeed = 0.02 + Math.random() * 0.04;
        this.size = 2 + Math.random() * 4;
        this.active = true;
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;

        if (this.y > (window.GameConstants ? window.GameConstants.getGameHeight() : 720) + 10) {
            this.active = false;
        }
    }

    isActive() { return this.active; }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

// BackgroundArtist main class
class BackgroundArtist {
    constructor() {
        this.stars = [];
        this.asteroids = [];
        this.random = new SeededRandom(4596); // Same seed as Java for consistency
        this.lastWidth = 0;
        this.lastHeight = 0;

        this.generateStars();
    }

    generateStars() {
        const gameWidth = window.GameConstants ? window.GameConstants.getGameWidth() : 1280;
        const gameHeight = window.GameConstants ? window.GameConstants.getGameHeight() : 720;
        this.generateStarsForSize(gameWidth, gameHeight);
    }

    generateStarsForSize(gameWidth, gameHeight) {
        // Scale star count based on screen size (maintain density)
        const baseArea = 1280 * 720;
        const currentArea = gameWidth * gameHeight;
        const starCount = Math.floor(150 * (currentArea / baseArea));

        // Generate individual stars
        for (let i = 0; i < starCount; i++) {
            let x = this.random.nextInt(gameWidth);
            let y = this.random.nextInt(gameHeight);
            let size = this.random.nextInt(3) + 1;
            let brightness = this.random.nextInt(156) + 100;
            let type = this.getRandomStarType();

            this.stars.push(new Star(x, y, size, brightness, type));
        }

        // Generate star clusters (scale with screen size)
        let numClusters = Math.max(3, Math.floor((5 + this.random.nextInt(4)) * (currentArea / baseArea)));
        for (let c = 0; c < numClusters; c++) {
            this.generateStarClusterForSize(gameWidth, gameHeight);
        }
    }

    getRandomStarType() {
        let roll = this.random.nextDouble();

        // Same rarity distribution as Java: Common 60%, Uncommon 25%, Rare 10%, Very Rare 5%
        if (roll < 0.60) {
            return StarType.COMMON;
        } else if (roll < 0.85) {
            return StarType.UNCOMMON;
        } else if (roll < 0.95) {
            return StarType.RARE;
        } else {
            return StarType.VERY_RARE;
        }
    }

    generateStarCluster() {
        const gameWidth = window.GameConstants ? window.GameConstants.getGameWidth() : 1280;
        const gameHeight = window.GameConstants ? window.GameConstants.getGameHeight() : 720;
        this.generateStarClusterForSize(gameWidth, gameHeight);
    }

    generateStarClusterForSize(gameWidth, gameHeight) {
        let clusterX = this.random.nextInt(gameWidth);
        let clusterY = this.random.nextInt(gameHeight);
        let clusterRadius = 30 + this.random.nextInt(70); // 30-100 pixel radius
        let numStars = 8 + this.random.nextInt(15); // 8-22 stars per cluster
        let clusterType = this.getRandomStarType();

        for (let i = 0; i < numStars; i++) {
            let angle = this.random.nextDouble() * Math.PI * 2;
            let distance = this.random.nextDouble() * clusterRadius;

            let starX = clusterX + Math.cos(angle) * distance;
            let starY = clusterY + Math.sin(angle) * distance;

            // Keep stars within screen bounds
            starX = Math.max(0, Math.min(gameWidth - 1, starX));
            starY = Math.max(0, Math.min(gameHeight - 1, starY));

            let size = 1 + this.random.nextInt(3);
            let brightness = 130 + this.random.nextInt(90);

            // 70% chance to use cluster type, 30% chance for random type
            let type = (this.random.nextDouble() < 0.7) ? clusterType : this.getRandomStarType();

            this.stars.push(new Star(starX, starY, size, brightness, type));
        }
    }

    renderStar(ctx, star) {
        let x = star.getX();
        let y = star.getY();
        let size = star.getSize();

        // Apply transparency to star colors (70% opacity like Java)
        let starColor = star.getCurrentColor();
        ctx.globalAlpha = 0.7;

        // Add glow effect for larger stars
        if (size > 1) {
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = starColor;

            switch (star.getShape()) {
                case 'DIAMOND':
                    this.drawDiamondShape(ctx, x + size / 2, y + size / 2, size * 2);
                    break;
                case 'OVAL':
                    ctx.beginPath();
                    ctx.arc(x + size / 2, y + size / 2, size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'STAR':
                    this.drawStarShape(ctx, x + size / 2, y + size / 2, size * 2);
                    break;
            }
        }

        // Draw main star
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = starColor;

        switch (star.getShape()) {
            case 'DIAMOND':
                this.drawDiamondShape(ctx, x + size / 2, y + size / 2, size);
                break;
            case 'OVAL':
                ctx.beginPath();
                ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'STAR':
                this.drawStarShape(ctx, x + size / 2, y + size / 2, size);
                break;
        }

        ctx.globalAlpha = 1.0;
    }

    drawDiamondShape(ctx, centerX, centerY, size) {
        let halfSize = size / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - halfSize); // top
        ctx.lineTo(centerX + halfSize, centerY); // right
        ctx.lineTo(centerX, centerY + halfSize); // bottom
        ctx.lineTo(centerX - halfSize, centerY); // left
        ctx.closePath();
        ctx.fill();
    }

    drawStarShape(ctx, centerX, centerY, size) {
        let outerRadius = size / 2.0;
        let innerRadius = outerRadius * 0.4;

        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            let angle = Math.PI * i / 5.0 - Math.PI / 2;
            let radius = (i % 2 === 0) ? outerRadius : innerRadius;
            let x = centerX + radius * Math.cos(angle);
            let y = centerY + radius * Math.sin(angle);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }

    renderBackground(ctx) {
        // Use actual canvas size instead of fixed dimensions
        const gameWidth = ctx.canvas.width;
        const gameHeight = ctx.canvas.height;

        // Regenerate stars if canvas size has changed significantly
        if (Math.abs(gameWidth - this.lastWidth) > 50 || Math.abs(gameHeight - this.lastHeight) > 50) {
            this.lastWidth = gameWidth;
            this.lastHeight = gameHeight;
            this.stars = [];
            this.asteroids = [];
            this.generateStarsForSize(gameWidth, gameHeight);
        }

        // Create gradient background similar to Java
        let gradient = ctx.createLinearGradient(0, 0, gameWidth, gameHeight);
        gradient.addColorStop(0, 'rgb(5, 5, 20)');
        gradient.addColorStop(1, 'rgb(20, 20, 50)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, gameWidth, gameHeight);

        // Render and update stars
        this.stars.forEach(star => {
            star.update(gameWidth);
            this.renderStar(ctx, star);
        });

        // Randomly spawn asteroids (about 1 every 3 seconds at 60fps)
        if (this.random.nextInt(180) === 0) {
            this.asteroids.push(new Asteroid());
        }

        // Update and render asteroids
        this.asteroids = this.asteroids.filter(asteroid => {
            asteroid.update();
            if (asteroid.isActive()) {
                asteroid.render(ctx);
                return true;
            }
            return false;
        });
    }
}

// Seeded Random implementation to match Java behavior
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 16807) % 2147483647;
        return this.seed;
    }

    nextDouble() {
        return (this.next() - 1) / 2147483646;
    }

    nextInt(max) {
        return Math.floor(this.nextDouble() * max);
    }
}

// Global function for easy access (matching Java usage pattern)
window.renderMenuBackground = function (canvas) {
    if (!window._backgroundArtist) {
        window._backgroundArtist = new BackgroundArtist();
    }
    const ctx = canvas.getContext('2d');
    window._backgroundArtist.renderBackground(ctx);
};

// Static method for direct access like Java
BackgroundArtist.renderBackground = function (ctx) {
    if (!window._backgroundArtist) {
        window._backgroundArtist = new BackgroundArtist();
    }
    window._backgroundArtist.renderBackground(ctx);
};

window.BackgroundArtist = BackgroundArtist;