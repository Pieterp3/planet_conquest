// PlayerData.js - Player progression and upgrade system
class PlayerData {
    constructor() {
        this.coins = 0;
        this.upgrades = {};
        this.abilities = {};
        this.bestTimes = {};
        this.maxUpgradeLevel = 30;
        this.baseUpgradeCosts = {
            'SHIP_SPEED': 10,
            'SHIP_HEALTH': 12,
            'PLANET_PRODUCTION': 15,
            'ABILITY_COOLDOWN': 20
        };
        this.abilityUnlockCosts = {
            'FREEZE': 50,
            'SHIELD': 100,
            'FACTORY_HYPE': 150,
            'PLANETARY_FLAME': 200,
            'BLACK_HOLE': 300,
            'PLANETARY_INFECTION': 500
        };

        // Initialize data asynchronously
        this.loadPromise = this.load();
    }

    static getInstance() {
        if (!window._playerData) {
            window._playerData = new PlayerData();
        }
        return window._playerData;
    }

    calculatePotentialReward(elapsedTime, difficulty) {
        let base = 10;

        // Difficulty multipliers
        switch (difficulty) {
            case 'EASY': base *= 0.5; break;
            case 'MEDIUM': base *= 1.0; break;
            case 'HARD': base *= 1.5; break;
            case 'EXTREME': base *= 2.0; break;
            default: base *= 1.0;
        }

        // Time bonus (faster completion = more coins)
        const timeBonus = Math.max(0, 300 - Math.floor(elapsedTime / 1000));
        base += timeBonus;

        return Math.floor(base);
    }

    calculatePotentialRewardWithBonus(elapsedTime, difficulty, totalPlanets, uncapturedPlanets) {
        const base = this.calculatePotentialReward(elapsedTime, difficulty);
        const planetBonus = uncapturedPlanets * 2;
        return base + planetBonus;
    }

    getUpgradeMultiplier(type) {
        const level = this.upgrades[type] || 0;
        return 1.0 + (level * 0.05); // 5% improvement per level
    }

    getUpgradeLevel(type) {
        return this.upgrades[type] || 0;
    }

    getUpgradeCost(type) {
        const level = this.getUpgradeLevel(type);
        if (level >= this.maxUpgradeLevel) return -1;

        const baseCost = this.baseUpgradeCosts[type] || 10;
        // Exponential cost growth
        return Math.floor(baseCost * Math.pow(1.15, level));
    }

    canAffordUpgrade(type) {
        const cost = this.getUpgradeCost(type);
        return cost !== -1 && this.coins >= cost;
    }

    purchaseUpgrade(type) {
        const cost = this.getUpgradeCost(type);
        if (cost === -1 || this.coins < cost) return false;

        this.coins -= cost;
        this.upgrades[type] = (this.upgrades[type] || 0) + 1;
        this.save();
        return true;
    }

    getAbilityLevel(type) {
        return this.abilities[type] || 0;
    }

    isAbilityUnlocked(type) {
        return this.getAbilityLevel(type) > 0;
    }

    canAffordAbility(type) {
        const cost = this.abilityUnlockCosts[type] || 100;
        return this.coins >= cost && !this.isAbilityUnlocked(type);
    }

    unlockAbility(type) {
        const cost = this.abilityUnlockCosts[type] || 100;
        if (this.coins < cost || this.isAbilityUnlocked(type)) return false;

        this.coins -= cost;
        this.abilities[type] = 1;
        this.save();
        return true;
    }

    addCoins(amount) {
        this.coins += amount;
        this.save();
    }

    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            this.save();
            return true;
        }
        return false;
    }

    setBestTime(difficulty, time) {
        if (!this.bestTimes[difficulty] || time < this.bestTimes[difficulty]) {
            this.bestTimes[difficulty] = time;
            this.save();
            return true;
        }
        return false;
    }

    getBestTime(difficulty) {
        return this.bestTimes[difficulty] || null;
    }

    async save() {
        const saveData = {
            coins: this.coins,
            upgrades: this.upgrades,
            abilities: this.abilities,
            bestTimes: this.bestTimes
        };
        
        try {
            // Use persistent storage if available
            if (window._persistentStorage && window._persistentStorage.isInitialized) {
                await window._persistentStorage.savePlayerData(saveData);
            } else {
                // Fallback to localStorage
                localStorage.setItem('planetGame_playerData', JSON.stringify(saveData));
            }
        } catch (error) {
            console.warn('Failed to save player data:', error);
            // Emergency fallback to localStorage
            localStorage.setItem('planetGame_playerData', JSON.stringify(saveData));
        }
    }

    async load() {
        try {
            let data = null;
            
            // Try persistent storage first
            if (window._persistentStorage) {
                try {
                    data = await window._persistentStorage.loadPlayerData();
                } catch (error) {
                    console.warn('Failed to load from persistent storage:', error);
                }
            }
            
            // Fallback to localStorage if persistent storage failed
            if (!data) {
                const saveData = localStorage.getItem('planetGame_playerData');
                if (saveData) {
                    data = JSON.parse(saveData);
                }
            }
            
            if (data) {
                this.coins = data.coins || 0;
                this.upgrades = data.upgrades || {};
                this.abilities = data.abilities || {};
                this.bestTimes = data.bestTimes || {};
            }
        } catch (e) {
            console.warn('Failed to load player data:', e);
        }
    }

    reset() {
        this.coins = 0;
        this.upgrades = {};
        this.abilities = {};
        this.bestTimes = {};
        this.save();
    }
}
window.PlayerData = PlayerData;
