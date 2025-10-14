// VisualSettings.js - Port of VisualSettings singleton
class VisualSettings {
    constructor() {
        this.displayConnectionLines = true;
        this.displayEffects = true;
        this.displayProjectiles = true;
        this.playerPlanetColor = '#00f';
        this.connectionLineOpacity = 0.6;
    }
    static getInstance() {
        if (!window._visualSettings) window._visualSettings = new VisualSettings();
        return window._visualSettings;
    }
    setDisplayConnectionLines(val) { this.displayConnectionLines = val; }
    isDisplayConnectionLines() { return this.displayConnectionLines; }
    getAbilityForKey(keyCode) {
        // Map keyCode to ability type
        switch (keyCode) {
            case 49: // '1'
                return window.AbilityType.FREEZE;
            case 50: // '2'
                return window.AbilityType.SHIELD;
            case 51: // '3'
                return window.AbilityType.FLAME;
            case 52: // '4'
                return window.AbilityType.BLACKHOLE;
            default:
                return null;
        }
    }
}
window.VisualSettings = VisualSettings;
