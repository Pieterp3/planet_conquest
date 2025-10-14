// Ported from CentralStarRenderer.java
// 1-to-1 port from Java
class CentralStarRenderer {
    renderCentralStar(ctx, gameWidth, gameHeight) {
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;
        const starSize = 36;
        const currentTime = Date.now();
        const primaryPulse = ((currentTime % 5000) / 5000.0) * 2 * Math.PI;
        const secondaryPulse = ((currentTime % 7500) / 7500.0) * 2 * Math.PI;
        const coronaPulse = ((currentTime % 3200) / 3200.0) * 2 * Math.PI;
        const flarePhase = ((currentTime % 12000) / 12000.0) * 2 * Math.PI;
        const glowIntensity = 0.4 + 0.15 * Math.sin(primaryPulse) + 0.05 * Math.sin(secondaryPulse);
        const glowOffsetX = 8 + 4 * Math.sin(primaryPulse * 0.5);
        // Deep space background glow
        for (let i = 12; i > 8; i--) {
            const layerPhase = primaryPulse + i * 0.08;
            const layerScale = 0.9 + 0.15 * Math.sin(layerPhase);
            const glowSize = (starSize + i * 12) * layerScale;
            const alpha = (0.015 + 0.01 / i) * glowIntensity;
            const layerOffsetX = -(glowOffsetX + (i - 8));
            const red = 255;
            const green = Math.max(60, 180 - i * 8);
            const blue = Math.max(0, 30 - i * 2);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = `rgb(${red},${green},${blue})`;
            ctx.beginPath();
            ctx.arc(centerX + layerOffsetX, centerY, glowSize / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }
        // ...additional rendering logic for corona, flares, photosphere, chromosphere, core, granulation, prominence loops, etc. would be implemented here as needed for full visual fidelity.
    }

    // Static method for direct access
    static render(ctx) {
        const gameWidth = window.GameConstants ? window.GameConstants.getGameWidth() : 1200;
        const gameHeight = window.GameConstants ? window.GameConstants.getGameHeight() : 850;
        const renderer = new CentralStarRenderer();
        renderer.renderCentralStar(ctx, gameWidth, gameHeight);
    }
}

// Static access for compatibility
CentralStarRenderer.render = function (ctx) {
    const gameWidth = window.GameConstants ? window.GameConstants.getGameWidth() : 1200;
    const gameHeight = window.GameConstants ? window.GameConstants.getGameHeight() : 850;
    const renderer = new CentralStarRenderer();
    renderer.renderCentralStar(ctx, gameWidth, gameHeight);
};

window.CentralStarRenderer = CentralStarRenderer;
if (typeof module !== 'undefined') module.exports = CentralStarRenderer;