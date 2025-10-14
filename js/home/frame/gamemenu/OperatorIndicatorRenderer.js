// OperatorIndicatorRenderer.js - Port of OperatorIndicatorRenderer
class OperatorIndicatorRenderer {
    constructor(game, width, planetArtist, effectsArtist) {
        this.game = game;
        this.width = width;
        this.planetArtist = planetArtist;
        this.effectsArtist = effectsArtist;
    }
    renderOperatorIndicators(g) {
        // Render operator indicators (player/bot colors, selection)
        if (!this.game.operators) return;
        let x = 20, y = 20;
        this.game.operators.forEach((op, i) => {
            g.save();
            g.beginPath();
            g.arc(x + i * 40, y, 16, 0, 2 * Math.PI);
            g.fillStyle = op.color;
            g.fill();
            g.strokeStyle = '#fff';
            g.lineWidth = 2;
            g.stroke();
            g.font = 'bold 12px Arial';
            g.fillStyle = '#fff';
            g.fillText(op.name, x + i * 40 - 16, y + 30);
            g.restore();
        });
    }
}
window.OperatorIndicatorRenderer = OperatorIndicatorRenderer;
