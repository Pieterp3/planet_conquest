// PersistentStorage.js - IndexedDB-based storage that persists across cookie clearing

class PersistentStorage {
    constructor() {
        this.dbName = 'PlanetGameDB';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                this.isInitialized = true;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores for different data types
                if (!db.objectStoreNames.contains('playerData')) {
                    db.createObjectStore('playerData', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('gameSettings')) {
                    db.createObjectStore('gameSettings', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('achievements')) {
                    db.createObjectStore('achievements', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('gameStats')) {
                    db.createObjectStore('gameStats', { keyPath: 'id' });
                }
            };
        });
    }

    async savePlayerData(data) {
        await this.init();
        return this.save('playerData', { id: 'main', ...data });
    }

    async loadPlayerData() {
        await this.init();
        const data = await this.load('playerData', 'main');
        return data || {
            coins: 0,
            upgrades: {},
            abilities: {},
            bestTimes: {}
        };
    }

    async saveSettings(settings) {
        await this.init();
        return this.save('gameSettings', { id: 'main', ...settings });
    }

    async loadSettings() {
        await this.init();
        const settings = await this.load('gameSettings', 'main');
        return settings || {
            connectionLines: true,
            visualEffects: true,
            showProjectiles: true,
            lineOpacity: 60,
            playerColor: '#0066FF',
            masterVolume: 75,
            soundEffects: true,
            backgroundMusic: true
        };
    }

    async saveAchievements(achievements) {
        await this.init();
        return this.save('achievements', { id: 'main', ...achievements });
    }

    async loadAchievements() {
        await this.init();
        const achievements = await this.load('achievements', 'main');
        return achievements || {
            completedAchievements: {},
            progress: {},
            careerStats: {
                totalGames: 0,
                gamesWon: 0,
                totalCoins: 0,
                planetsCaptured: 0,
                abilitiesUsed: 0
            }
        };
    }

    async save(storeName, data) {
        if (!this.isInitialized) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async load(storeName, key) {
        if (!this.isInitialized) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async saveChallengeData(challengeData) {
        await this.init();
        return this.save('challengeData', { id: 'main', ...challengeData });
    }

    async loadChallengeData() {
        await this.init();
        const data = await this.load('challengeData', 'main');
        return data || {
            totalPlanetsCaptured: 0,
            totalAbilitiesUsed: 0,
            totalGoldDonated: 0,
            totalUpgradesPurchased: 0,
            totalAbilitiesUnlocked: 0,
            perfectGamesCount: {},
            specificAbilityUsage: {},
            completedChallenges: []
        };
    }

    // Migration from localStorage to IndexedDB
    async migrateFromLocalStorage() {
        try {
            // Migrate PlayerData
            const playerDataStr = localStorage.getItem('planetGame_playerData');
            if (playerDataStr) {
                const playerData = JSON.parse(playerDataStr);
                await this.savePlayerData(playerData);
                console.log('Migrated player data to IndexedDB');
            }

            // Migrate Settings
            const settingsStr = localStorage.getItem('planetGame_settings');
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                await this.saveSettings(settings);
                console.log('Migrated settings to IndexedDB');
            }

            // Clear localStorage after successful migration
            localStorage.removeItem('planetGame_playerData');
            localStorage.removeItem('planetGame_settings');
            
        } catch (error) {
            console.warn('Failed to migrate data from localStorage:', error);
        }
    }

    // Backup to localStorage as fallback
    async backupToLocalStorage() {
        try {
            const playerData = await this.loadPlayerData();
            const settings = await this.loadSettings();
            
            localStorage.setItem('planetGame_playerData_backup', JSON.stringify(playerData));
            localStorage.setItem('planetGame_settings_backup', JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to backup to localStorage:', error);
        }
    }

    // Check if IndexedDB is supported
    static isSupported() {
        return 'indexedDB' in window;
    }
}

// Global instance
window.PersistentStorage = PersistentStorage;

// Create and initialize global instance
window._persistentStorage = new PersistentStorage();

// Auto-migrate data on first load
window._persistentStorage.init().then(() => {
    window._persistentStorage.migrateFromLocalStorage();
}).catch(error => {
    console.warn('Failed to initialize persistent storage:', error);
});

export default PersistentStorage;