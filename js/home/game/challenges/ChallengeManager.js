// ChallengeManager.js - Port of Java ChallengeManager
class ChallengeManager {
    constructor() {
        this.challenges = new Map();
        this.activeChallenges = [];
        
        // Game session tracking
        this.gameStartTime = 0;
        this.specificAbilityUsage = new Map();
        this.planetsLostThisGame = false;
        this.planetTypesCapturedThisGame = new Set();
        this.currentGameDifficulty = null;

        // Career/total tracking (persistent across games)
        this.totalPlanetsCaptured = 0;
        this.totalAbilitiesUsed = 0;
        this.totalGoldDonated = 0;
        this.totalUpgradesPurchased = 0;
        this.totalAbilitiesUnlocked = 0;
        this.perfectGamesCount = new Map(); // difficulty -> count

        // Achievement notifications
        this.pendingNotifications = [];
        this.pendingProgressNotifications = [];

        this.initializeChallenges();
        this.loadProgress();
    }

    static getInstance() {
        if (!ChallengeManager._instance) {
            ChallengeManager._instance = new ChallengeManager();
        }
        return ChallengeManager._instance;
    }

    initializeChallenges() {
        // Time-based challenges
        this.addChallenge("speed_easy", "Speed Demon I", 
            "Complete an Easy mission in under 60 seconds",
            "COMPLETE_MISSION_TIME", "COMMON", 50, {
                requiredDifficulty: "EASY",
                timeLimit: 60000
            });

        this.addChallenge("speed_medium", "Speed Demon II", 
            "Complete a Medium mission in under 90 seconds",
            "COMPLETE_MISSION_TIME", "UNCOMMON", 100, {
                requiredDifficulty: "MEDIUM",
                timeLimit: 90000
            });

        this.addChallenge("speed_hard", "Lightning Strike", 
            "Complete a Hard mission in under 120 seconds",
            "COMPLETE_MISSION_TIME", "RARE", 200, {
                requiredDifficulty: "HARD",
                timeLimit: 120000
            });

        this.addChallenge("speed_extreme", "Impossible Speed", 
            "Complete an Extreme mission in under 180 seconds",
            "COMPLETE_MISSION_TIME", "LEGENDARY", 500, {
                requiredDifficulty: "EXTREME",
                timeLimit: 180000
            });

        // Ability usage challenges
        this.addChallenge("ability_novice", "Ability Novice", 
            "Use 25 abilities in total",
            "USE_ABILITIES_COUNT", "COMMON", 30, {
                targetCount: 25
            });

        this.addChallenge("ability_adept", "Ability Adept", 
            "Use 100 abilities in total",
            "USE_ABILITIES_COUNT", "UNCOMMON", 75, {
                targetCount: 100
            });

        this.addChallenge("ability_master", "Ability Master", 
            "Use 500 abilities in total",
            "USE_ABILITIES_COUNT", "RARE", 200, {
                targetCount: 500
            });

        // Specific ability challenges
        const abilities = [
            "FREEZE", "MISSILE_BARRAGE", "SHIELD", "FACTORY_HYPE", 
            "IMPROVED_FACTORIES", "ANSWERED_PRAYERS", "CURSE", 
            "BLACK_HOLE", "PLANETARY_FLAME", "PLANETARY_INFECTION", 
            "UNSTOPPABLE_SHIPS", "ORBITAL_FREEZE"
        ];

        abilities.forEach(ability => {
            const displayName = this.formatAbilityName(ability);
            this.addChallenge(`ability_${ability.toLowerCase()}_specialist`, 
                `${displayName} Specialist`, 
                `Use ${displayName} 20 times`,
                "USE_SPECIFIC_ABILITY", "UNCOMMON", 80, {
                    specificAbility: ability,
                    targetCount: 20
                });

            this.addChallenge(`purchase_${ability.toLowerCase()}`, 
                `Unlock ${displayName}`, 
                `Purchase the ${displayName} ability`,
                "PURCHASE_SPECIFIC_ABILITY", "COMMON", 50, {
                    specificAbility: ability,
                    targetCount: 1
                });
        });

        // Planet capture challenges
        this.addChallenge("conqueror_basic", "Basic Conqueror", 
            "Capture 50 planets total",
            "CAPTURE_PLANETS", "COMMON", 40, {
                targetCount: 50
            });

        this.addChallenge("conqueror_advanced", "Advanced Conqueror", 
            "Capture 200 planets total",
            "CAPTURE_PLANETS", "UNCOMMON", 100, {
                targetCount: 200
            });

        this.addChallenge("conqueror_master", "Galactic Emperor", 
            "Capture 1000 planets total",
            "CAPTURE_PLANETS", "EPIC", 300, {
                targetCount: 1000
            });

        // Perfect game challenges
        this.addChallenge("perfect_easy", "Easy Perfectionist", 
            "Win 5 Easy games without losing a planet",
            "WIN_WITHOUT_LOSING_PLANET", "UNCOMMON", 80, {
                requiredDifficulty: "EASY",
                targetCount: 5
            });

        this.addChallenge("perfect_medium", "Medium Perfectionist", 
            "Win 3 Medium games without losing a planet",
            "WIN_WITHOUT_LOSING_PLANET", "RARE", 150, {
                requiredDifficulty: "MEDIUM",
                targetCount: 3
            });

        this.addChallenge("perfect_hard", "Untouchable", 
            "Win 1 Hard game without losing a planet",
            "WIN_WITHOUT_LOSING_PLANET", "EPIC", 300, {
                requiredDifficulty: "HARD",
                targetCount: 1
            });

        // Gold donation challenges
        this.addChallenge("generous_basic", "Generous Soul", 
            "Donate 500 gold total",
            "DONATE_GOLD", "COMMON", 25, {
                targetCount: 500
            });

        this.addChallenge("generous_advanced", "Philanthropist", 
            "Donate 2000 gold total",
            "DONATE_GOLD", "RARE", 100, {
                targetCount: 2000
            });

        // Progression challenges
        this.addChallenge("unlock_collector", "Ability Collector", 
            "Unlock 5 different abilities",
            "UNLOCK_ABILITIES", "UNCOMMON", 60, {
                targetCount: 5
            });

        this.addChallenge("upgrade_buyer", "Upgrade Enthusiast", 
            "Purchase 50 upgrades total",
            "PURCHASE_UPGRADES", "UNCOMMON", 75, {
                targetCount: 50
            });

        // Planet type restriction challenges
        this.addChallenge("no_attack_planets", "Pacifist Victory", 
            "Win a game without capturing Attack planets",
            "WIN_WITHOUT_CAPTURING_PLANET_TYPE", "RARE", 120, {
                excludedPlanetType: "ATTACK"
            });

        this.addChallenge("no_defense_planets", "Offensive Master", 
            "Win a game without capturing Defense planets",
            "WIN_WITHOUT_CAPTURING_PLANET_TYPE", "RARE", 120, {
                excludedPlanetType: "DEFENCE"
            });

        this.addChallenge("no_speed_planets", "Methodical Victory", 
            "Win a game without capturing Speed planets",
            "WIN_WITHOUT_CAPTURING_PLANET_TYPE", "RARE", 120, {
                excludedPlanetType: "SPEED"
            });
    }

    addChallenge(id, name, description, type, rarity, coinReward, properties = {}) {
        const challenge = {
            id,
            name,
            description,
            type,
            rarity,
            coinReward,
            completed: false,
            progress: 0,
            ...properties
        };
        
        this.challenges.set(id, challenge);
        return challenge;
    }

    formatAbilityName(ability) {
        return ability.toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Event handlers - called by game systems
    onGameStart(difficulty) {
        this.gameStartTime = Date.now();
        this.currentGameDifficulty = difficulty;
        this.planetsLostThisGame = false;
        this.planetTypesCapturedThisGame.clear();
    }

    onGameWon() {
        if (!this.gameStartTime) return;
        
        const gameTime = Date.now() - this.gameStartTime;
        
        // Check time-based challenges
        this.checkTimeChallenge("speed_easy", "EASY", 60000, gameTime);
        this.checkTimeChallenge("speed_medium", "MEDIUM", 90000, gameTime);
        this.checkTimeChallenge("speed_hard", "HARD", 120000, gameTime);
        this.checkTimeChallenge("speed_extreme", "EXTREME", 180000, gameTime);

        // Check perfect game challenges
        if (!this.planetsLostThisGame) {
            this.checkPerfectGameChallenge("perfect_easy", "EASY");
            this.checkPerfectGameChallenge("perfect_medium", "MEDIUM");
            this.checkPerfectGameChallenge("perfect_hard", "HARD");
        }

        // Check planet type restriction challenges
        this.checkPlanetTypeRestriction();
    }

    onPlanetCaptured(planetType) {
        this.totalPlanetsCaptured++;
        if (planetType) {
            this.planetTypesCapturedThisGame.add(planetType);
        }
        
        this.updateProgress("conqueror_basic", this.totalPlanetsCaptured);
        this.updateProgress("conqueror_advanced", this.totalPlanetsCaptured);
        this.updateProgress("conqueror_master", this.totalPlanetsCaptured);
        
        this.saveProgress();
    }

    onPlanetLost() {
        this.planetsLostThisGame = true;
    }

    onAbilityUsed(abilityType) {
        this.totalAbilitiesUsed++;
        
        // Track specific ability usage
        const currentCount = this.specificAbilityUsage.get(abilityType) || 0;
        this.specificAbilityUsage.set(abilityType, currentCount + 1);
        
        // Update general ability challenges
        this.updateProgress("ability_novice", this.totalAbilitiesUsed);
        this.updateProgress("ability_adept", this.totalAbilitiesUsed);
        this.updateProgress("ability_master", this.totalAbilitiesUsed);
        
        // Update specific ability challenge
        const specificChallengeId = `ability_${abilityType.toLowerCase()}_specialist`;
        this.updateProgress(specificChallengeId, currentCount + 1);
        
        this.saveProgress();
    }

    onAbilityPurchased(abilityType) {
        this.totalAbilitiesUnlocked++;
        
        const purchaseChallengeId = `purchase_${abilityType.toLowerCase()}`;
        this.updateProgress(purchaseChallengeId, 1);
        this.updateProgress("unlock_collector", this.totalAbilitiesUnlocked);
        
        this.saveProgress();
    }

    onUpgradePurchased() {
        this.totalUpgradesPurchased++;
        this.updateProgress("upgrade_buyer", this.totalUpgradesPurchased);
        this.saveProgress();
    }

    onGoldDonated(amount) {
        this.totalGoldDonated += amount;
        this.updateProgress("generous_basic", this.totalGoldDonated);
        this.updateProgress("generous_advanced", this.totalGoldDonated);
        this.saveProgress();
    }

    checkTimeChallenge(challengeId, requiredDifficulty, timeLimit, actualTime) {
        if (this.currentGameDifficulty === requiredDifficulty && actualTime <= timeLimit) {
            this.completeChallenge(challengeId);
        }
    }

    checkPerfectGameChallenge(challengeId, requiredDifficulty) {
        if (this.currentGameDifficulty === requiredDifficulty) {
            const currentCount = this.perfectGamesCount.get(requiredDifficulty) || 0;
            this.perfectGamesCount.set(requiredDifficulty, currentCount + 1);
            this.updateProgress(challengeId, currentCount + 1);
        }
    }

    checkPlanetTypeRestriction() {
        // Check if player avoided capturing specific planet types
        if (!this.planetTypesCapturedThisGame.has("ATTACK")) {
            this.completeChallenge("no_attack_planets");
        }
        if (!this.planetTypesCapturedThisGame.has("DEFENCE")) {
            this.completeChallenge("no_defense_planets");
        }
        if (!this.planetTypesCapturedThisGame.has("SPEED")) {
            this.completeChallenge("no_speed_planets");
        }
    }

    updateProgress(challengeId, currentValue) {
        const challenge = this.challenges.get(challengeId);
        if (!challenge || challenge.completed) return;
        
        const oldProgress = challenge.progress;
        challenge.progress = currentValue;
        
        // Check if challenge is completed
        if (challenge.targetCount && currentValue >= challenge.targetCount) {
            this.completeChallenge(challengeId);
        } else if (oldProgress !== currentValue) {
            // Show progress notification
            this.addProgressNotification(challenge, currentValue);
        }
    }

    completeChallenge(challengeId) {
        const challenge = this.challenges.get(challengeId);
        if (!challenge || challenge.completed) return;
        
        challenge.completed = true;
        challenge.progress = challenge.targetCount || 1;
        
        // Award coins
        if (window.PlayerData) {
            window.PlayerData.getInstance().addCoins(challenge.coinReward);
        }
        
        // Add achievement notification
        this.addAchievementNotification(challenge);
        this.saveProgress();
    }

    addAchievementNotification(challenge) {
        this.pendingNotifications.push({
            name: challenge.name,
            description: challenge.description,
            rarity: challenge.rarity,
            coinReward: challenge.coinReward,
            timestamp: Date.now(),
            displayTime: 5000
        });
    }

    addProgressNotification(challenge, currentValue) {
        if (challenge.targetCount) {
            this.pendingProgressNotifications.push({
                name: challenge.name,
                progress: currentValue,
                target: challenge.targetCount,
                timestamp: Date.now(),
                displayTime: 3000
            });
        }
    }

    getAchievements() {
        return Array.from(this.challenges.values());
    }

    getAllChallenges() {
        return Array.from(this.challenges.values())
            .sort((a, b) => {
                // Sort by rarity then by completion status
                const rarityOrder = { "COMMON": 1, "UNCOMMON": 2, "RARE": 3, "EPIC": 4, "LEGENDARY": 5 };
                const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
                if (rarityDiff !== 0) return rarityDiff;
                
                return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
            });
    }

    getPendingNotifications() {
        const now = Date.now();
        
        // Remove expired notifications
        this.pendingNotifications = this.pendingNotifications.filter(n => 
            now - n.timestamp < n.displayTime);
        this.pendingProgressNotifications = this.pendingProgressNotifications.filter(n => 
            now - n.timestamp < n.displayTime);
        
        return {
            achievements: [...this.pendingNotifications],
            progress: [...this.pendingProgressNotifications]
        };
    }

    async saveProgress() {
        if (window.PersistentStorage) {
            const data = {
                totalPlanetsCaptured: this.totalPlanetsCaptured,
                totalAbilitiesUsed: this.totalAbilitiesUsed,
                totalGoldDonated: this.totalGoldDonated,
                totalUpgradesPurchased: this.totalUpgradesPurchased,
                totalAbilitiesUnlocked: this.totalAbilitiesUnlocked,
                perfectGamesCount: Object.fromEntries(this.perfectGamesCount),
                specificAbilityUsage: Object.fromEntries(this.specificAbilityUsage),
                completedChallenges: Array.from(this.challenges.values())
                    .filter(c => c.completed)
                    .map(c => ({ id: c.id, progress: c.progress }))
            };
            
            try {
                await window.PersistentStorage.saveChallengeData(data);
            } catch (error) {
                console.error("Failed to save challenge progress:", error);
            }
        }
    }

    async loadProgress() {
        if (window.PersistentStorage) {
            try {
                const data = await window.PersistentStorage.loadChallengeData();
                if (data) {
                    this.totalPlanetsCaptured = data.totalPlanetsCaptured || 0;
                    this.totalAbilitiesUsed = data.totalAbilitiesUsed || 0;
                    this.totalGoldDonated = data.totalGoldDonated || 0;
                    this.totalUpgradesPurchased = data.totalUpgradesPurchased || 0;
                    this.totalAbilitiesUnlocked = data.totalAbilitiesUnlocked || 0;
                    
                    if (data.perfectGamesCount) {
                        this.perfectGamesCount = new Map(Object.entries(data.perfectGamesCount));
                    }
                    
                    if (data.specificAbilityUsage) {
                        this.specificAbilityUsage = new Map(Object.entries(data.specificAbilityUsage));
                    }
                    
                    // Restore challenge completion status
                    if (data.completedChallenges) {
                        data.completedChallenges.forEach(completed => {
                            const challenge = this.challenges.get(completed.id);
                            if (challenge) {
                                challenge.completed = true;
                                challenge.progress = completed.progress;
                            }
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load challenge progress:", error);
            }
        }
    }

    // Legacy method for compatibility
    getPendingProgressNotifications() {
        return this.pendingProgressNotifications;
    }
}

// Global instance
window.ChallengeManager = ChallengeManager;
window._challengeManager = ChallengeManager.getInstance();
