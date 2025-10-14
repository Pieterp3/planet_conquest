// Ported from UpgradeType.java
// 1-to-1 port from Java
const UpgradeType = {
    DOUBLE_SHIP_CHANCE: {
        displayName: "Double Ship Chance",
        unit: "%",
        baseCost: 50,
        growthRate: 1.22,
        calculateCost: function (currentLevel) {
            if (currentLevel >= 30) return -1;
            return Math.round(this.baseCost * Math.pow(this.growthRate, currentLevel));
        },
        calculateValue: function (level) { return Math.min(50.0, level * 2.0); }
    },
    SHIP_DAMAGE: {
        displayName: "Ship Damage",
        unit: "%",
        baseCost: 15,
        growthRate: 1.15,
        calculateCost: function (currentLevel) {
            if (currentLevel >= 30) return -1;
            return Math.round(this.baseCost * Math.pow(this.growthRate, currentLevel));
        },
        calculateValue: function (level) { return level * 5.0; }
    },
    SHIP_HEALTH: {
        displayName: "Ship Health",
        unit: "%",
        baseCost: 12,
        growthRate: 1.14,
        calculateCost: function (currentLevel) {
            if (currentLevel >= 30) return -1;
            return Math.round(this.baseCost * Math.pow(this.growthRate, currentLevel));
        },
        calculateValue: function (level) { return level * 10.0; }
    },
    PLANET_HEALTH: {
        displayName: "Planet Health",
        unit: "%",
        baseCost: 20,
        growthRate: 1.17,
        calculateCost: function (currentLevel) {
            if (currentLevel >= 30) return -1;
            return Math.round(this.baseCost * Math.pow(this.growthRate, currentLevel));
        },
        calculateValue: function (level) { return level * 15.0; }
    },
    PLANET_DAMAGE_REDUCTION: {
        displayName: "Planet Damage Reduction",
        unit: "%",
        baseCost: 25,
        growthRate: 1.18,
        calculateCost: function (currentLevel) {
            if (currentLevel >= 30) return -1;
            return Math.round(this.baseCost * Math.pow(this.growthRate, currentLevel));
        },
        calculateValue: function (level) { return Math.min(75.0, level * 3.0); }
    },
    SHIP_SPEED: {
        displayName: "Ship Speed",
        unit: "%",
        baseCost: 16,
        growthRate: 1.13,
        calculateCost: function (currentLevel) {
            if (currentLevel >= 30) return -1;
            return Math.round(this.baseCost * Math.pow(this.growthRate, currentLevel));
        },
        calculateValue: function (level) { return level * 4.0; }
    },
    SHIP_SPAWN_SPEED: {
        displayName: "Ship Spawn Speed",
        unit: "%",
        baseCost: 18,
        growthRate: 1.15,
        calculateCost: function (currentLevel) {
            if (currentLevel >= 30) return -1;
            return Math.round(this.baseCost * Math.pow(this.growthRate, currentLevel));
        },
        calculateValue: function (level) { return level * 6.0; }
    },
    ABILITY_COOLDOWN: {
        displayName: "Ability Cooldown Reduction",
        unit: "%",
        baseCost: 30,
        growthRate: 1.20,
        calculateCost: function (currentLevel) {
            if (currentLevel >= 30) return -1;
            return Math.round(this.baseCost * Math.pow(this.growthRate, currentLevel));
        },
        calculateValue: function (level) { return Math.min(50.0, level * 2.0); }
    }
};
if (typeof module !== 'undefined') module.exports = UpgradeType;