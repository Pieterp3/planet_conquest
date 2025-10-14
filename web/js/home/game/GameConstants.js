// GameConstants.js - Complete 1-to-1 port of GameConstants from Java
// All 572 lines of constants with exact same values and functionality
const GameConstants = {
    // Default Restoration
    RESTORE_DEFAULTS: false,

    // Engine & Performance Constants
    TARGET_TPS: 60, // Ticks per second
    SLOW_MODE_TPS: 20, // Slow mode for targeting
    PAUSE_SLEEP_INTERVAL: 100, // Milliseconds to sleep while paused
    ENGINE_CPU_RELIEF_SLEEP: 1, // Prevent CPU overload

    // UI Refresh & Notification Timing
    NOTIFICATION_DISPLAY_DURATION: 5000, // Achievement notifications (5s)
    PROGRESS_NOTIFICATION_DURATION: 3000, // Progress notifications (3s)
    CHALLENGE_SAVE_DELAY: 2000, // Delayed save buffer (2s)
    GAME_WIDTH: 1200,
    GAME_HEIGHT: 850,

    // Ability Base Configuration
    BASE_ABILITY_COOLDOWN: 45000, // Base cooldown (45 seconds)
    MISSILE_DAMAGE_MULTIPLIER: 2.0, // Missile damage vs normal projectiles
    MISSILE_SPEED_MULTIPLIER: 2.0, // Missile speed vs normal projectiles
    ABILITY_COOLDOWN_REDUCTION_PERCENT: 100.0, // For upgrade calculations

    // Black Hole Constants
    BLACK_HOLE_BASE_POWER: 300, // Base event horizon diameter
    BLACK_HOLE_POWER_PER_LEVEL: 10, // Power increase per upgrade level

    // Planetary Flame Constants
    FLAME_BASE_POWER: 500, // Base flame length and damage
    FLAME_POWER_PER_LEVEL: 20, // Power increase per upgrade level

    // Orbital Mechanics
    MIN_ORBIT_RADIUS: 80.0, // Minimum distance from center star
    MAX_ORBIT_RADIUS_FACTOR: 0.9, // Factor of screen dimensions for max orbit
    MIN_ORBITAL_SPEED: 0.005, // Minimum radians per tick
    MAX_ORBITAL_SPEED: 0.02, // Maximum radians per tick
    ORBIT_RADIUS_MARGIN: 50.0, // Margin from screen edge

    // Currency & Rewards
    BASE_COIN_REWARD: 10, // Base coins for 30 seconds of play

    // Difficulty Reward Multipliers
    EASY_REWARD_MULTIPLIER: 1.0,
    MEDIUM_REWARD_MULTIPLIER: 1.2,
    HARD_REWARD_MULTIPLIER: 1.5,
    EXTREME_REWARD_MULTIPLIER: 2.0,

    // Combat System Extended
    COMBAT_DISENGAGEMENT_DISTANCE: 120.0, // Hysteresis for combat exit
    MAX_PLANET_HEALTH: 10000,
    DEFAULT_SHIPS_PER_SECOND: 0.5, // 1 ship every 2 seconds
    PLANET_HEALTH_REGEN_RATE: 85, // Health per second
    DEFAULT_SHIP_SPEED: 3.5, // Units per tick
    DEFAULT_SHIP_HEALTH: 1000,
    DEFAULT_SHIP_DAMAGE: 500, // Damage per hit
    PLANET_SIZE: 35,
    SHIP_SIZE: 8, // Ship collision radius
    MAX_PLANETS: 20, // Maximum number of planets in a game
    MIN_PLANETS: 5, // Minimum number of planets in a game
    COMBAT_ENGAGEMENT_DISTANCE: 80, // Distance at which ships start combat
    PROJECTILE_SPEED: 6.5, // Speed of projectiles
    PROJECTILE_MAX_RANGE: 225, // Maximum range of projectiles
    SHIP_FIRE_RATE: 500, // Milliseconds between shots
    PROJECTILE_SIZE: 3, // Projectile visual size

    // Debugging constants
    PLAYER_PLANETS_INVINCIBLE: false, // Set to true to make player planets invincible for testing
    PLAYER_SHIPS_INVINCIBLE: false, // Set to true to make player ships invincible for testing
    DEBUG_COINS_MULTIPLIER: 1.0, // Set to >1 to increase coins earned for testing
    PRINT_DEBUG_TO_FILE: false, // Set to true to log debug info to file
    REMOVE_ABILITY_COOLDOWNS: false, // Set to true to remove ability cooldowns for testing

    // Configuration change listeners
    listeners: [],

    // Getter methods (matching Java interface)
    getMaxPlanetHealth: () => GameConstants.MAX_PLANET_HEALTH,
    getDefaultShipsPerSecond: () => GameConstants.DEFAULT_SHIPS_PER_SECOND,
    getGameWidth: () => GameConstants.GAME_WIDTH,
    getGameHeight: () => GameConstants.GAME_HEIGHT,
    getPlanetHealthRegenRate: () => GameConstants.PLANET_HEALTH_REGEN_RATE,
    getDefaultShipSpeed: () => GameConstants.DEFAULT_SHIP_SPEED,
    getDefaultShipHealth: () => GameConstants.DEFAULT_SHIP_HEALTH,
    getDefaultShipDamage: () => GameConstants.DEFAULT_SHIP_DAMAGE,
    getPlanetSize: () => GameConstants.PLANET_SIZE,
    getShipSize: () => GameConstants.SHIP_SIZE,
    getMaxPlanets: () => GameConstants.MAX_PLANETS,
    getMinPlanets: () => GameConstants.MIN_PLANETS,
    getCombatEngagementDistance: () => GameConstants.COMBAT_ENGAGEMENT_DISTANCE,
    getProjectileSpeed: () => GameConstants.PROJECTILE_SPEED,
    getProjectileMaxRange: () => GameConstants.PROJECTILE_MAX_RANGE,
    getShipFireRate: () => GameConstants.SHIP_FIRE_RATE,
    getProjectileSize: () => GameConstants.PROJECTILE_SIZE,
    arePlayerPlanetsInvincible: () => GameConstants.PLAYER_PLANETS_INVINCIBLE,
    arePlayerShipsInvincible: () => GameConstants.PLAYER_SHIPS_INVINCIBLE,
    getDebugCoinsMultiplier: () => GameConstants.DEBUG_COINS_MULTIPLIER,
    printDebugToFile: () => GameConstants.PRINT_DEBUG_TO_FILE,
    removeAbilityCooldowns: () => GameConstants.REMOVE_ABILITY_COOLDOWNS,

    // Engine & Performance Getters
    getTargetTPS: () => GameConstants.TARGET_TPS,
    getSlowModeTPS: () => GameConstants.SLOW_MODE_TPS,
    getPauseSleepInterval: () => GameConstants.PAUSE_SLEEP_INTERVAL,
    getEngineCPUReliefSleep: () => GameConstants.ENGINE_CPU_RELIEF_SLEEP,

    // UI Timing Getters
    getNotificationDisplayDuration: () => GameConstants.NOTIFICATION_DISPLAY_DURATION,
    getProgressNotificationDuration: () => GameConstants.PROGRESS_NOTIFICATION_DURATION,
    getChallengeSaveDelay: () => GameConstants.CHALLENGE_SAVE_DELAY,

    // Ability System Getters
    getBaseAbilityCooldown: () => GameConstants.BASE_ABILITY_COOLDOWN,
    getMissileDamageMultiplier: () => GameConstants.MISSILE_DAMAGE_MULTIPLIER,
    getMissileSpeedMultiplier: () => GameConstants.MISSILE_SPEED_MULTIPLIER,
    getAbilityCooldownReductionPercent: () => GameConstants.ABILITY_COOLDOWN_REDUCTION_PERCENT,

    // Black Hole Getters
    getBlackHoleBasePower: () => GameConstants.BLACK_HOLE_BASE_POWER,
    getBlackHolePowerPerLevel: () => GameConstants.BLACK_HOLE_POWER_PER_LEVEL,

    // Planetary Flame Getters
    getFlameBasePower: () => GameConstants.FLAME_BASE_POWER,
    getFlamePowerPerLevel: () => GameConstants.FLAME_POWER_PER_LEVEL,

    // Orbital Mechanics Getters
    getMinOrbitRadius: () => GameConstants.MIN_ORBIT_RADIUS,
    getMaxOrbitRadiusFactor: () => GameConstants.MAX_ORBIT_RADIUS_FACTOR,
    getMinOrbitalSpeed: () => GameConstants.MIN_ORBITAL_SPEED,
    getMaxOrbitalSpeed: () => GameConstants.MAX_ORBITAL_SPEED,
    getOrbitRadiusMargin: () => GameConstants.ORBIT_RADIUS_MARGIN,

    // Currency & Rewards Getters
    getBaseCoinReward: () => GameConstants.BASE_COIN_REWARD,

    // Difficulty Reward Multiplier Getters
    getEasyRewardMultiplier: () => GameConstants.EASY_REWARD_MULTIPLIER,
    getMediumRewardMultiplier: () => GameConstants.MEDIUM_REWARD_MULTIPLIER,
    getHardRewardMultiplier: () => GameConstants.HARD_REWARD_MULTIPLIER,
    getExtremeRewardMultiplier: () => GameConstants.EXTREME_REWARD_MULTIPLIER,

    // Combat System Extended Getters
    getCombatDisengagementDistance: () => GameConstants.COMBAT_DISENGAGEMENT_DISTANCE,

    // Configuration Management Methods
    addConfigChangeListener: (listener) => {
        GameConstants.listeners.push(listener);
    },

    removeConfigChangeListener: (listener) => {
        const index = GameConstants.listeners.indexOf(listener);
        if (index > -1) {
            GameConstants.listeners.splice(index, 1);
        }
    },

    notifyConfigurationChanged: (property, oldValue, newValue) => {
        GameConstants.listeners.forEach(listener => {
            try {
                listener.onConfigurationChanged(property, oldValue, newValue);
            } catch (e) {
                console.error('Error notifying config change listener:', e.message);
            }
        });
    },

    shouldRestoreDefaults: () => GameConstants.RESTORE_DEFAULTS,

    reloadConfiguration: () => {
        // In web version, configuration is static
        GameConstants.notifyConfigurationChanged('ALL', null, null);
    },

    validateConfiguration: () => {
        // Game dimensions validation
        if (GameConstants.GAME_WIDTH < 800) {
            console.warn('GAME_WIDTH too small, setting to 800');
            GameConstants.GAME_WIDTH = 800;
        }
        if (GameConstants.GAME_HEIGHT < 600) {
            console.warn('GAME_HEIGHT too small, setting to 600');
            GameConstants.GAME_HEIGHT = 600;
        }

        // Performance validation
        if (GameConstants.TARGET_TPS < 10) {
            console.warn('TARGET_TPS too low, setting to 10');
            GameConstants.TARGET_TPS = 10;
        }
        if (GameConstants.TARGET_TPS > 120) {
            console.warn('TARGET_TPS too high, setting to 120');
            GameConstants.TARGET_TPS = 120;
        }

        // Combat validation
        if (GameConstants.COMBAT_ENGAGEMENT_DISTANCE <= 0) {
            console.warn('COMBAT_ENGAGEMENT_DISTANCE invalid, setting to 80');
            GameConstants.COMBAT_ENGAGEMENT_DISTANCE = 80;
        }
        if (GameConstants.COMBAT_DISENGAGEMENT_DISTANCE <= GameConstants.COMBAT_ENGAGEMENT_DISTANCE) {
            console.warn('COMBAT_DISENGAGEMENT_DISTANCE must be > engagement distance');
            GameConstants.COMBAT_DISENGAGEMENT_DISTANCE = GameConstants.COMBAT_ENGAGEMENT_DISTANCE + 40;
        }

        // Health validation
        if (GameConstants.MAX_PLANET_HEALTH <= 0) {
            console.warn('MAX_PLANET_HEALTH invalid, setting to 10000');
            GameConstants.MAX_PLANET_HEALTH = 10000;
        }

        // Speed validation
        if (GameConstants.DEFAULT_SHIP_SPEED <= 0) {
            console.warn('DEFAULT_SHIP_SPEED invalid, setting to 3.5');
            GameConstants.DEFAULT_SHIP_SPEED = 3.5;
        }

        // Ability validation
        if (GameConstants.BASE_ABILITY_COOLDOWN < 1000) {
            console.warn('BASE_ABILITY_COOLDOWN too low, setting to 1000ms');
            GameConstants.BASE_ABILITY_COOLDOWN = 1000;
        }

        // Orbital validation
        if (GameConstants.MIN_ORBIT_RADIUS <= 0 ||
            GameConstants.MIN_ORBIT_RADIUS >= GameConstants.MAX_ORBIT_RADIUS_FACTOR * Math.min(GameConstants.GAME_WIDTH, GameConstants.GAME_HEIGHT) / 2) {
            console.warn('Invalid orbit radius, resetting to defaults');
            GameConstants.MIN_ORBIT_RADIUS = 80.0;
            GameConstants.MAX_ORBIT_RADIUS_FACTOR = 0.9;
        }
    },

    getConfigProperty: (propertyName) => {
        return GameConstants[propertyName] || null;
    },

    setConfigProperty: (propertyName, value) => {
        if (propertyName in GameConstants) {
            const oldValue = GameConstants[propertyName];
            GameConstants[propertyName] = value;
            GameConstants.notifyConfigurationChanged(propertyName, oldValue, value);
            return true;
        }
        console.error('Error setting config property', propertyName);
        return false;
    },

    getAllConfigProperties: () => {
        const properties = {};
        for (const key in GameConstants) {
            if (typeof GameConstants[key] !== 'function' && key !== 'listeners') {
                properties[key] = GameConstants[key];
            }
        }
        return properties;
    },

    resetToDefaults: () => {
        // Engine & Performance
        GameConstants.TARGET_TPS = 60;
        GameConstants.SLOW_MODE_TPS = 20;
        GameConstants.PAUSE_SLEEP_INTERVAL = 100;
        GameConstants.ENGINE_CPU_RELIEF_SLEEP = 1;

        // UI Timing
        GameConstants.NOTIFICATION_DISPLAY_DURATION = 5000;
        GameConstants.PROGRESS_NOTIFICATION_DURATION = 3000;
        GameConstants.CHALLENGE_SAVE_DELAY = 2000;

        // Abilities
        GameConstants.BASE_ABILITY_COOLDOWN = 45000;
        GameConstants.MISSILE_DAMAGE_MULTIPLIER = 2.0;
        GameConstants.MISSILE_SPEED_MULTIPLIER = 2.0;
        GameConstants.ABILITY_COOLDOWN_REDUCTION_PERCENT = 100.0;

        // Black Hole
        GameConstants.BLACK_HOLE_BASE_POWER = 300;
        GameConstants.BLACK_HOLE_POWER_PER_LEVEL = 10;

        // Flame
        GameConstants.FLAME_BASE_POWER = 500;
        GameConstants.FLAME_POWER_PER_LEVEL = 20;

        // Orbital
        GameConstants.MIN_ORBIT_RADIUS = 80.0;
        GameConstants.MAX_ORBIT_RADIUS_FACTOR = 0.9;
        GameConstants.MIN_ORBITAL_SPEED = 0.005;
        GameConstants.MAX_ORBITAL_SPEED = 0.02;
        GameConstants.ORBIT_RADIUS_MARGIN = 50.0;

        // Economy
        GameConstants.BASE_COIN_REWARD = 10;

        // Difficulty Rewards
        GameConstants.EASY_REWARD_MULTIPLIER = 1.0;
        GameConstants.MEDIUM_REWARD_MULTIPLIER = 1.2;
        GameConstants.HARD_REWARD_MULTIPLIER = 1.5;
        GameConstants.EXTREME_REWARD_MULTIPLIER = 2.0;

        // Combat Extended
        GameConstants.COMBAT_DISENGAGEMENT_DISTANCE = 120.0;

        // Original constants
        GameConstants.MAX_PLANET_HEALTH = 10000;
        GameConstants.DEFAULT_SHIPS_PER_SECOND = 0.5;
        GameConstants.GAME_WIDTH = 1200;
        GameConstants.GAME_HEIGHT = 850;
        GameConstants.PLANET_HEALTH_REGEN_RATE = 85;
        GameConstants.DEFAULT_SHIP_SPEED = 3.5;
        GameConstants.DEFAULT_SHIP_HEALTH = 1000;
        GameConstants.DEFAULT_SHIP_DAMAGE = 500;
        GameConstants.PLANET_SIZE = 35;
        GameConstants.SHIP_SIZE = 8;
        GameConstants.MAX_PLANETS = 20;
        GameConstants.MIN_PLANETS = 5;
        GameConstants.COMBAT_ENGAGEMENT_DISTANCE = 80;
        GameConstants.PROJECTILE_SPEED = 6.5;
        GameConstants.PROJECTILE_MAX_RANGE = 225;
        GameConstants.SHIP_FIRE_RATE = 500;
        GameConstants.PROJECTILE_SIZE = 3;

        // Debug flags
        GameConstants.PLAYER_PLANETS_INVINCIBLE = false;
        GameConstants.PLAYER_SHIPS_INVINCIBLE = false;
        GameConstants.DEBUG_COINS_MULTIPLIER = 1.0;
        GameConstants.PRINT_DEBUG_TO_FILE = false;
        GameConstants.REMOVE_ABILITY_COOLDOWNS = false;

        GameConstants.notifyConfigurationChanged('RESET', null, null);
    },

    saveConfiguration: () => {
        GameConstants.validateConfiguration();
        // In web version, save to localStorage
        localStorage.setItem('gameConstants', JSON.stringify(GameConstants.getAllConfigProperties()));
    }
};

// Initialize from localStorage if available
if (typeof (Storage) !== 'undefined') {
    const savedConfig = localStorage.getItem('gameConstants');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            Object.assign(GameConstants, config);
        } catch (e) {
            console.warn('Failed to load saved configuration:', e);
        }
    }
}

window.GameConstants = GameConstants;
