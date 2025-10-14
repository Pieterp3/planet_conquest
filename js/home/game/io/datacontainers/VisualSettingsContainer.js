// Ported from VisualSettingsContainer.java
// 1-to-1 port from Java
class VisualSettingsContainer {
    constructor({
        displayConnectionLines = true,
        displayEffects = true,
        displayProjectiles = true,
        displayPlanetMoons = true,
        displayShips = true,
        connectionLineOpacity = 0.6,
        playerPlanetColor = 'blue',
        keybindMap = null
    } = {}) {
        this.displayConnectionLines = displayConnectionLines;
        this.displayEffects = displayEffects;
        this.displayProjectiles = displayProjectiles;
        this.displayPlanetMoons = displayPlanetMoons;
        this.displayShips = displayShips;
        this.connectionLineOpacity = connectionLineOpacity;
        this.playerPlanetColor = playerPlanetColor;
        this.keybindMap = keybindMap;
    }
}
if (typeof module !== 'undefined') module.exports = VisualSettingsContainer;