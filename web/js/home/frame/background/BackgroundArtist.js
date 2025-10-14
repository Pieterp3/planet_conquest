
// BackgroundArtist.js - High-fidelity animated space background for menus
(function () {
    // --- CONFIG ---
    const WIDTH = window.innerWidth, HEIGHT = window.innerHeight; // Default canvas size
    const STAR_COUNT = 150;
    const CLUSTER_COUNT = 6;
    const ASTEROID_MIN_SIZE = 2, ASTEROID_MAX_SIZE = 8;
    const ASTEROID_TRAIL_LENGTH = 5;
    const ASTEROID_SPAWN_INTERVAL = 180; // ~3 seconds at 60fps
    // --- STAR LOGIC ---
    const STAR_TYPES = ["common", "uncommon", "rare", "very_rare"];
    const STAR_COLORS = {
        common: "#ffe066",
        uncommon: "#ff6666",
        rare: "#6699ff",
        very_rare: "#ffffff"
    };
    const STAR_SHAPES = ["diamond", "oval", "star"];
    function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
    function randFloat(a, b) { return Math.random() * (b - a) + a; }
    function Star(x, y, size, brightness, type, shape) {
        this.x = x;
        this.y = y;
        this.baseY = y;
        this.baseSize = size;
        this.currentSize = size;
        this.brightness = brightness;
        this.type = type;
        this.shape = shape;
        this.twinkleFactor = Math.random() * Math.PI * 2;
        this.twinkleRate = 0.1 / size;
        this.movementSpeed = 0.1 + (size * 0.05);
        this.sineOffset = Math.random() * Math.PI * 2;
        this.sineAmplitude = 10 + (size * 5);
        this.secondarySineOffset = Math.random() * Math.PI * 2;
        this.secondaryAmplitude = 5 + (size * 2);
        this.verticalDrift = (Math.random() - 0.5) * 0.02;
    }
    Star.prototype.update = function () {
        this.x += this.movementSpeed;
        if (this.x > WIDTH + this.baseSize) this.x = -this.baseSize;
        let primaryWave = Math.sin((this.x * 0.01) + this.sineOffset) * this.sineAmplitude;
        let secondaryWave = Math.sin((this.x * 0.03) + this.secondarySineOffset) * this.secondaryAmplitude;
        this.baseY += this.verticalDrift;
        if (this.baseY < -50) this.baseY = HEIGHT + 50;
        if (this.baseY > HEIGHT + 50) this.baseY = -50;
        this.y = this.baseY + primaryWave + secondaryWave;
        let brightnessVariation = Math.sin(this.twinkleFactor) * 30;
        this.brightness = Math.max(100, Math.min(255, 200 + brightnessVariation));
        let maxVariation = Math.min(0.8, this.baseSize * 0.3);
        let sizeVariation = Math.sin(this.twinkleFactor * 1.5) * maxVariation;
        this.currentSize = Math.max(1, Math.round(this.baseSize + sizeVariation));
        this.twinkleFactor += this.twinkleRate;
    };
    Star.prototype.getColor = function () {
        let color = STAR_COLORS[this.type] || "#fff";
        let colorShift = Math.sin(this.twinkleFactor) * 0.3;
        let c = hexToRgb(color);
        let r = Math.max(0, Math.min(255, c.r * (1 + colorShift * 0.5)));
        let g = Math.max(0, Math.min(255, c.g * (1 + colorShift * 0.5)));
        let b = Math.max(0, Math.min(255, c.b * (1 + colorShift * 0.5)));
        let brightnessFactor = this.brightness / 255.0;
        r = Math.round(r * brightnessFactor);
        g = Math.round(g * brightnessFactor);
        b = Math.round(b * brightnessFactor);
        return `rgba(${r},${g},${b},1)`;
    };
    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        let bigint = parseInt(hex, 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;
        return { r, g, b };
    }
    // --- ASTEROID LOGIC ---
    function Asteroid() {
        let edge = randInt(0, 3);
        switch (edge) {
            case 0: this.x = randInt(0, WIDTH); this.y = -10; break;
            case 1: this.x = WIDTH + 10; this.y = randInt(0, HEIGHT); break;
            case 2: this.x = randInt(0, WIDTH); this.y = HEIGHT + 10; break;
            case 3: this.x = -10; this.y = randInt(0, HEIGHT); break;
        }
        let targetX = randFloat(0, WIDTH), targetY = randFloat(0, HEIGHT);
        let deltaX = targetX - this.x, deltaY = targetY - this.y;
        let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        let speed = randFloat(2, 5);
        this.dx = (deltaX / distance) * speed;
        this.dy = (deltaY / distance) * speed;
        this.size = randInt(ASTEROID_MIN_SIZE, ASTEROID_MAX_SIZE);
        let gray = randInt(150, 230);
        this.color = `rgb(${gray},${gray - 10},${gray - 20})`;
        this.active = true;
        this.shape = generateAsteroidShape(this.size);
    }
    Asteroid.prototype.update = function () {
        this.x += this.dx;
        this.y += this.dy;
        if (this.x < -20 || this.x > WIDTH + 20 || this.y < -20 || this.y > HEIGHT + 20) this.active = false;
    };
    function generateAsteroidShape(size) {
        let numPoints = Math.max(8, size);
        let points = [];
        for (let p = 0; p < numPoints; p++) {
            let angle = (p * 2 * Math.PI) / numPoints;
            let wave1 = angle * 3 + randFloat(0, Math.PI * 2);
            let wave2 = angle * 7 + randFloat(0, Math.PI * 2);
            let wave3 = angle * 11 + randFloat(0, Math.PI * 2);
            let waveOffset = 0.2 * Math.sin(wave1) + 0.1 * Math.sin(wave2) + 0.05 * Math.sin(wave3);
            let baseRadius = size / 2.0;
            let wavyRadius = baseRadius * (0.7 + 0.3 * (1.0 + waveOffset));
            points.push({
                x: Math.cos(angle) * wavyRadius,
                y: Math.sin(angle) * wavyRadius
            });
        }
        return points;
    }
    function drawAsteroid(ctx, asteroid, x, y, size, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        let scale = size / asteroid.size;
        for (let i = 0; i < asteroid.shape.length; i++) {
            let pt = asteroid.shape[i];
            if (i === 0) ctx.moveTo(pt.x * scale, pt.y * scale);
            else ctx.lineTo(pt.x * scale, pt.y * scale);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.globalAlpha = 1.0;
        ctx.fill();
        ctx.strokeStyle = shadeColor(color, -30);
        ctx.stroke();
        ctx.restore();
    }
    function shadeColor(color, percent) {
        let rgb = color.match(/\d+/g);
        let r = Math.max(0, Math.min(255, parseInt(rgb[0]) + percent));
        let g = Math.max(0, Math.min(255, parseInt(rgb[1]) + percent));
        let b = Math.max(0, Math.min(255, parseInt(rgb[2]) + percent));
        return `rgb(${r},${g},${b})`;
    }
    // --- DRAWING ---
    function drawDiamond(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.rect(-size / 2, -size / 2, size, size);
        ctx.fill();
        ctx.restore();
    }
    function drawStar(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const angle = Math.PI * i / 5 - Math.PI / 2;
            const r = (i % 2 === 0) ? size / 2 : size / 2 * 0.4;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    // --- BACKGROUND ---
    function drawBackground(ctx) {
        let grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
        grad.addColorStop(0, "#050514");
        grad.addColorStop(1, "#141432");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    function drawStars(ctx, stars) {
        for (const star of stars) {
            // Glow effect
            if (star.currentSize > 1) {
                ctx.save();
                ctx.globalAlpha = 0.15;
                ctx.fillStyle = star.getColor();
                if (star.shape === "diamond") drawDiamond(ctx, star.x, star.y, star.currentSize * 2);
                else if (star.shape === "star") drawStar(ctx, star.x, star.y, star.currentSize * 2);
                else ctx.beginPath(), ctx.arc(star.x, star.y, star.currentSize * 2, 0, 2 * Math.PI), ctx.fill();
                ctx.restore();
            }
            // Main star
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = star.getColor();
            if (star.shape === "diamond") drawDiamond(ctx, star.x, star.y, star.currentSize);
            else if (star.shape === "star") drawStar(ctx, star.x, star.y, star.currentSize);
            else ctx.beginPath(), ctx.arc(star.x, star.y, star.currentSize, 0, 2 * Math.PI), ctx.fill();
            ctx.restore();
        }
    }
    function drawAsteroids(ctx, asteroids) {
        for (const asteroid of asteroids) {
            if (!asteroid.active) continue;
            // Draw fading polygonal trail
            for (let i = ASTEROID_TRAIL_LENGTH; i >= 1; i--) {
                let trailX = asteroid.x - asteroid.dx * i * 0.5;
                let trailY = asteroid.y - asteroid.dy * i * 0.5;
                let alpha = Math.max(0, 0.8 - (i * 0.15));
                let trailColor = asteroid.color.replace('rgb', 'rgba').replace(')', `,` + alpha + ")");
                let trailSize = Math.max(1, asteroid.size - i);
                drawAsteroid(ctx, asteroid, trailX, trailY, trailSize, trailColor);
            }
            // Main asteroid
            drawAsteroid(ctx, asteroid, asteroid.x, asteroid.y, asteroid.size, asteroid.color);
        }
    }
    // --- STAR GENERATION ---
    function createStars() {
        const stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push(new Star(
                randInt(0, WIDTH),
                randInt(0, HEIGHT),
                randInt(1, 3),
                randInt(100, 255),
                STAR_TYPES[Math.floor(Math.random() * STAR_TYPES.length)],
                STAR_SHAPES[Math.floor(Math.random() * STAR_SHAPES.length)]
            ));
        }
        // Clusters
        for (let c = 0; c < CLUSTER_COUNT; c++) {
            const cx = randInt(0, WIDTH), cy = randInt(0, HEIGHT);
            const cr = randInt(30, 100), n = randInt(8, 22);
            const clusterType = STAR_TYPES[Math.floor(Math.random() * STAR_TYPES.length)];
            for (let i = 0; i < n; i++) {
                const angle = randFloat(0, Math.PI * 2);
                const dist = randFloat(0, cr);
                let x = cx + Math.cos(angle) * dist;
                let y = cy + Math.sin(angle) * dist;
                x = Math.max(0, Math.min(WIDTH - 1, x));
                y = Math.max(0, Math.min(HEIGHT - 1, y));
                stars.push(new Star(
                    x,
                    y,
                    randInt(1, 3),
                    randInt(130, 220),
                    Math.random() < 0.7 ? clusterType : STAR_TYPES[Math.floor(Math.random() * STAR_TYPES.length)],
                    STAR_SHAPES[Math.floor(Math.random() * STAR_SHAPES.length)]
                ));
            }
        }
        return stars;
    }
    // --- ASTEROID GENERATION ---
    function createAsteroids() {
        return [];
    }
    // --- MAIN RENDER ---
    window.renderMenuBackground = function (canvas) {
        function setupAndRender() {
            // Use window size if canvas size is zero or not styled yet
            let w = canvas.offsetWidth || window.innerWidth;
            let h = canvas.offsetHeight || window.innerHeight;
            if (w < 10 || h < 10) {
                // Canvas not ready, retry shortly
                setTimeout(() => setupAndRender(), 50);
                return;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            const stars = createStars();
            let asteroids = createAsteroids();
            let asteroidSpawnTimer = 0;
            function animate() {
                drawBackground(ctx);
                for (const star of stars) star.update();
                drawStars(ctx, stars);
                for (const asteroid of asteroids) asteroid.update();
                drawAsteroids(ctx, asteroids);
                asteroidSpawnTimer++;
                if (asteroidSpawnTimer >= ASTEROID_SPAWN_INTERVAL) {
                    asteroids.push(new Asteroid());
                    asteroidSpawnTimer = 0;
                }
                asteroids = asteroids.filter(a => a.active);
                requestAnimationFrame(animate);
            }
            animate();
        }
        setupAndRender();
    };
})();
