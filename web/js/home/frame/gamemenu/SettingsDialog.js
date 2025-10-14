// Ported from SettingsDialog.java
// 1-to-1 port from Java
class SettingsDialog {
    constructor(frame, backgroundArtist, settings) {
        this.frame = frame;
        this.backgroundArtist = backgroundArtist;
        this.settings = settings;
        this.settingsDialog = null;
        // UI Components
        this.connectionLinesCheckBox = null;
        this.opacitySlider = null;
        this.effectsCheckBox = null;
        this.projectilesCheckBox = null;
        this.planetMoonsCheckBox = null;
        this.shipsCheckBox = null;
        this.opacityValueLabel = null;
        this.planetColorComboBox = null;
    }
    show() {
        // Would create and show a custom settings dialog with space theme aesthetic
        // All UI logic would be implemented using HTML/CSS/JS in the web version
        // This is a stub for the full dialog logic
    }
    hide() {
        // Would hide the settings dialog
        this.settingsDialog = null;
    }
    isVisible() {
        // Would check if the settings dialog is currently visible
        return !!this.settingsDialog;
    }
    // Additional UI setup and event logic would be implemented in the actual web UI
}
if (typeof module !== 'undefined') module.exports = SettingsDialog;