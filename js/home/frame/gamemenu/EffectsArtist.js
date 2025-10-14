// EffectsArtist.js - Port of EffectsArtist from Java
class EffectsArtist {
    constructor(game) {
        this.game = game;
    }
    renderAbilityEffects(g) {
        // Render freeze effect
        if (this.game.abilityManager && this.game.abilityManager.isAbilityActive(window.AbilityType.FREEZE)) {
            g.save();
            g.globalAlpha = 0.3;
            g.fillStyle = '#0ff';
            g.fillRect(0, 0, g.canvas.width, g.canvas.height);
            g.globalAlpha = 1.0;
            g.restore();
        }
        // Render black hole effect
        if (this.game.abilityManager && this.game.abilityManager.isAbilityActive(window.AbilityType.BLACKHOLE)) {
            g.save();
            g.globalAlpha = 0.2;
            g.fillStyle = '#222';
            g.beginPath();
            g.arc(g.canvas.width / 2, g.canvas.height / 2, 80, 0, 2 * Math.PI);
            g.fill();
            g.globalAlpha = 1.0;
            g.restore();
        }
        // Render flame effect
        if (this.game.abilityManager && this.game.abilityManager.isAbilityActive(window.AbilityType.FLAME)) {
            g.save();
            g.globalAlpha = 0.2;
            g.fillStyle = '#f80';
            g.fillRect(0, 0, g.canvas.width, g.canvas.height);
            g.globalAlpha = 1.0;
            g.restore();
        }
    }
}
window.EffectsArtist = EffectsArtist;
