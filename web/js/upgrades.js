
// upgrades.js - Accurate upgrade data from UpgradeType.java
window.upgrades = [
    {
        key: 'DOUBLE_SHIP_CHANCE',
        name: 'Double Ship Chance',
        desc: 'Chance to spawn double ships per tick',
        unit: '%',
        baseCost: 50,
        growthRate: 1.22,
        maxLevel: 25,
        calcValue: level => Math.min(50.0, level * 2.0)
    },
    {
        key: 'SHIP_DAMAGE',
        name: 'Ship Damage',
        desc: 'Increase ship damage',
        unit: '%',
        baseCost: 15,
        growthRate: 1.15,
        maxLevel: 30,
        calcValue: level => level * 5.0
    },
    {
        key: 'SHIP_HEALTH',
        name: 'Ship Health',
        desc: 'Increase ship health',
        unit: '%',
        baseCost: 12,
        growthRate: 1.14,
        maxLevel: 30,
        calcValue: level => level * 10.0
    },
    {
        key: 'PLANET_HEALTH',
        name: 'Planet Health',
        desc: 'Increase planet health',
        unit: '%',
        baseCost: 20,
        growthRate: 1.17,
        maxLevel: 30,
        calcValue: level => level * 15.0
    },
    {
        key: 'PLANET_DAMAGE_REDUCTION',
        name: 'Planet Damage Reduction',
        desc: 'Reduce damage taken by planets',
        unit: '%',
        baseCost: 25,
        growthRate: 1.18,
        maxLevel: 25,
        calcValue: level => Math.min(75.0, level * 3.0)
    },
    {
        key: 'SHIP_SPEED',
        name: 'Ship Speed',
        desc: 'Increase ship speed',
        unit: '%',
        baseCost: 16,
        growthRate: 1.13,
        maxLevel: 30,
        calcValue: level => level * 4.0
    },
    {
        key: 'SHIP_SPAWN_SPEED',
        name: 'Ship Spawn Speed',
        desc: 'Increase ship spawn speed',
        unit: '%',
        baseCost: 18,
        growthRate: 1.15,
        maxLevel: 30,
        calcValue: level => level * 6.0
    },
    {
        key: 'ABILITY_COOLDOWN',
        name: 'Ability Cooldown Reduction',
        desc: 'Reduce ability cooldown',
        unit: '%',
        baseCost: 30,
        growthRate: 1.20,
        maxLevel: 25,
        calcValue: level => Math.min(50.0, level * 2.0)
    }

];

// --- Upgrade & Ability Purchase Logic ---
window.playerCoins = 0;
window.upgradeLevels = {};
window.purchasedAbilities = {};

// Load progress from localStorage
window.loadProgress = function () {
    const coins = localStorage.getItem('playerCoins');
    playerCoins = coins ? parseInt(coins) : 0;
    const levels = localStorage.getItem('upgradeLevels');
    upgradeLevels = levels ? JSON.parse(levels) : {};
    const abilities = localStorage.getItem('purchasedAbilities');
    purchasedAbilities = abilities ? JSON.parse(abilities) : {};
}

// Save progress to localStorage
window.saveProgress = function () {
    localStorage.setItem('playerCoins', playerCoins);
    localStorage.setItem('upgradeLevels', JSON.stringify(upgradeLevels));
    localStorage.setItem('purchasedAbilities', JSON.stringify(purchasedAbilities));
}

// Calculate upgrade cost for next level
window.getUpgradeCost = function (upgradeKey) {
    const upgrade = upgrades.find(u => u.key === upgradeKey);
    const level = upgradeLevels[upgradeKey] || 0;
    if (level >= upgrade.maxLevel) return -1;
    return Math.round(upgrade.baseCost * Math.pow(upgrade.growthRate, level));
}

// Purchase an upgrade
window.purchaseUpgrade = function (upgradeKey) {
    const cost = getUpgradeCost(upgradeKey);
    if (cost < 0 || playerCoins < cost) return false;
    upgradeLevels[upgradeKey] = (upgradeLevels[upgradeKey] || 0) + 1;
    playerCoins -= cost;
    saveProgress();
    return true;
}

// Purchase an ability
window.purchaseAbility = function (abilityName, cost) {
    if (purchasedAbilities[abilityName]) return false; // Already purchased
    if (playerCoins < cost) return false;
    purchasedAbilities[abilityName] = true;
    playerCoins -= cost;
    saveProgress();
    return true;
}

// Utility: get upgrade value at current level
window.getUpgradeValue = function (upgradeKey) {
    const upgrade = upgrades.find(u => u.key === upgradeKey);
    const level = upgradeLevels[upgradeKey] || 0;
    return upgrade.calcValue(level);
}

// Initialize progress on load
loadProgress();
