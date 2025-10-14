// SaveLoadManager.js - Port of SaveLoadManager
class SaveLoadManager {
    static savePlayerData() {
        localStorage.setItem('playerData', JSON.stringify(PlayerData.getInstance()));
    }
    static loadPlayerData() {
        const data = localStorage.getItem('playerData');
        if (data) {
            Object.assign(PlayerData.getInstance(), JSON.parse(data));
        }
    }
    static saveChallengeData() {
        if (window.ChallengeManager && window.ChallengeManager.getInstance) {
            localStorage.setItem('challengeData', JSON.stringify(window.ChallengeManager.getInstance()));
        }
    }
    static loadChallengeData() {
        const data = localStorage.getItem('challengeData');
        if (data && window.ChallengeManager && window.ChallengeManager.getInstance) {
            Object.assign(window.ChallengeManager.getInstance(), JSON.parse(data));
        }
    }
    static saveVisualSettings() {
        localStorage.setItem('visualSettings', JSON.stringify(window.VisualSettings.getInstance()));
    }
    static loadVisualSettings() {
        const data = localStorage.getItem('visualSettings');
        if (data) {
            Object.assign(window.VisualSettings.getInstance(), JSON.parse(data));
        }
    }
}
window.SaveLoadManager = SaveLoadManager;
