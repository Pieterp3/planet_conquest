// Game.js - Central game coordinator managing all entities and systems

class Game {
    constructor(difficulty = 'MEDIUM') {
        // Entity collections
        this.planets = [];
        this.ships = [];
        this.projectiles = [];
        this.bots = [];
        this.explosions = [];

        // System managers
        this.abilityManager = null;
        this.combatManager = null;
        this.effectsArtist = null;
        this.planetArtist = null;
        this.shipArtist = null;

        // Game state
        this.difficulty = difficulty;
        this.player = null;
        this.gameStartTime = 0;
        this.gameEndTime = 0;
        this.gameWon = false;
        this.gameLost = false;
        this.paused = false;
        this.elapsedTime = 0;
        this.ended = false;

        // Rendering state
        this.selectedPlanet = null;

        this.initialize();
    }

    initialize() {
        // Initialize system managers
        this.abilityManager = window.AbilityManager ? new window.AbilityManager(this) : null;
        this.combatManager = window.CombatManager ? new window.CombatManager(this) : null;
        this.effectsArtist = window.EffectsArtist ? new window.EffectsArtist() : null;
        this.planetArtist = window.PlanetArtist ? new window.PlanetArtist() : null;
        this.shipArtist = window.ShipArtist ? new window.ShipArtist() : null;

        // Create player
        this.player = window.Player ? new window.Player() : { name: 'Player', ships: [], planets: [] };

        this.gameStartTime = Date.now();
    }

    start() {
        this.elapsedTime = 0;
        this.ended = false;
        this.paused = false;
        this.gameWon = false;
        this.gameLost = false;

        // Generate game world
        this.generateWorld();

        this.gameStartTime = Date.now();
    }

    generateWorld() {
        // Use GameGenerator to create planets and assign ownership
        if (window.GameGenerator) {
            const generator = new window.GameGenerator();
            const gameData = generator.generate(this.difficulty);

            this.planets = gameData.planets || [];
            this.bots = gameData.bots || [];

            // Set game reference for all entities
            for (const planet of this.planets) {
                planet.setGame(this);
                if (planet.getOperator() === this.player) {
                    planet.setOperator(this.player);
                }
            }

            for (const bot of this.bots) {
                bot.setGame(this);
            }
        } else {
            // Fallback: create a simple game world
            this.createFallbackWorld();
        }
    }

    createFallbackWorld() {
        const centerX = window.GameConstants ? window.GameConstants.getGameWidth() / 2 : 640;
        const centerY = window.GameConstants ? window.GameConstants.getGameHeight() / 2 : 360;

        // Get difficulty parameters
        const difficultyObj = window.Difficulty ? window.Difficulty[this.difficulty] : { botCount: 2, planetCount: 8 };

        // Create planets in orbital positions
        this.planets = [];
        this.bots = [];

        for (let i = 0; i < difficultyObj.planetCount; i++) {
            const angle = (i / difficultyObj.planetCount) * Math.PI * 2;
            const distance = 150 + (i % 3) * 100; // Varying orbital distances
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            const planet = new window.Planet(x, y, null, distance, angle);
            planet.setGame(this);

            // Assign ownership: first planet to player, others to bots or neutral
            if (i === 0) {
                planet.setOperator(this.player);
                if (this.player.addPlanet) this.player.addPlanet(planet);
            } else if (i <= difficultyObj.botCount) {
                // Create bots as needed
                let bot = this.bots[i - 1];
                if (!bot) {
                    bot = window.Bot ? new window.Bot('BOT_' + i, this.difficulty) :
                        { name: 'Bot ' + i, ships: [], planets: [], tick: () => { } };
                    if (bot.setGame) bot.setGame(this);
                    this.bots.push(bot);
                }
                planet.setOperator(bot);
                if (bot.addPlanet) bot.addPlanet(planet);
            }
            // Remaining planets stay neutral (null operator)

            this.planets.push(planet);
        }

        this.ships = [];
        this.projectiles = [];
        this.explosions = [];
    }

    // Main game update method called by Engine
    tick() {
        if (this.paused || this.ended) return;

        this.elapsedTime += 1000 / 60; // Assuming 60 FPS

        // Update all entities
        this.updatePlanets();
        this.updateShips();
        this.updateProjectiles();
        this.updateBots();
        this.updateExplosions();

        // Update system managers
        if (this.abilityManager && this.abilityManager.update) {
            this.abilityManager.update();
        }
        if (this.combatManager && this.combatManager.update) {
            this.combatManager.update();
        }

        // Check win/loss conditions
        this.checkGameState();
    }

    updatePlanets() {
        for (const planet of this.planets) {
            if (planet.tick) planet.tick();
        }
    }

    updateShips() {
        // Use array copy to prevent concurrent modification issues
        const shipsToUpdate = [...this.ships];
        for (const ship of shipsToUpdate) {
            if (this.ships.includes(ship) && ship.tick) { // Still in game
                ship.tick();
            }
        }
    }

    updateProjectiles() {
        const projectilesToUpdate = [...this.projectiles];
        for (const projectile of projectilesToUpdate) {
            if (this.projectiles.includes(projectile) && projectile.tick) {
                projectile.tick();
            }
        }
    }

    updateBots() {
        for (const bot of this.bots) {
            if (bot.tick) bot.tick();
        }
    }

    updateExplosions() {
        this.explosions = this.explosions.filter(explosion => {
            if (explosion.tick) explosion.tick();
            return !explosion.isFinished || !explosion.isFinished();
        });
    }

    checkGameState() {
        if (this.gameWon || this.gameLost || this.ended) return;

        // Count planets by operator
        let playerPlanets = 0;
        let botPlanets = 0;
        let neutralPlanets = 0;

        for (const planet of this.planets) {
            const operator = planet.getOperator ? planet.getOperator() : planet.operator;
            if (operator === this.player) {
                playerPlanets++;
            } else if (operator && (operator.constructor.name === 'Bot' || operator.name.includes('Bot'))) {
                botPlanets++;
            } else {
                neutralPlanets++;
            }
        }

        // Win condition: player owns all planets (or all non-neutral)
        if (playerPlanets > 0 && botPlanets === 0) {
            this.gameWon = true;
            this.ended = true;
            this.gameEndTime = Date.now();
            this.onGameWon();
        }

        // Loss condition: player has no planets and no ships
        if (playerPlanets === 0 && this.getPlayerShips().length === 0) {
            this.gameLost = true;
            this.ended = true;
            this.gameEndTime = Date.now();
            this.onGameLost();
        }
    }

    onGameWon() {
        // Notify challenge manager
        if (window.ChallengeManager) {
            const challengeManager = window.ChallengeManager.getInstance();
            if (challengeManager.onGameWon) {
                const gameTime = this.gameEndTime - this.gameStartTime;
                challengeManager.onGameWon(this.difficulty, gameTime);
            }
        }
    }

    onGameLost() {
        // Handle game loss
        console.log('Game lost!');
    }

    // Entity management methods
    addShip(ship) {
        if (!this.ships.includes(ship)) {
            this.ships.push(ship);
            if (ship.setGame) ship.setGame(this);
        }
    }

    removeShip(ship) {
        const index = this.ships.indexOf(ship);
        if (index >= 0) {
            this.ships.splice(index, 1);
        }

        // Remove from combat manager
        if (this.combatManager && this.combatManager.removeShipFromCombat) {
            this.combatManager.removeShipFromCombat(ship);
        }
    }

    addProjectile(projectile) {
        if (!this.projectiles.includes(projectile)) {
            this.projectiles.push(projectile);
            if (projectile.setGame) projectile.setGame(this);
        }
    }

    removeProjectile(projectile) {
        const index = this.projectiles.indexOf(projectile);
        if (index >= 0) {
            this.projectiles.splice(index, 1);
        }
    }

    addExplosion(explosion) {
        this.explosions.push(explosion);
    }

    // Getters
    getPlanets() { return this.planets; }
    getShips() { return this.ships; }
    getProjectiles() { return this.projectiles; }
    getBots() { return this.bots; }
    getExplosions() { return this.explosions; }
    getPlayer() { return this.player; }
    getDifficulty() { return this.difficulty; }
    getElapsedTime() { return this.elapsedTime; }

    getPlayerShips() {
        return this.ships.filter(ship => {
            const operator = ship.getOperator ? ship.getOperator() : ship.operator;
            return operator === this.player;
        });
    }

    getPlayerPlanets() {
        return this.planets.filter(planet => {
            const operator = planet.getOperator ? planet.getOperator() : planet.operator;
            return operator === this.player;
        });
    }

    // System manager getters
    getAbilityManager() { return this.abilityManager; }
    getCombatManager() { return this.combatManager; }
    getEffectsArtist() { return this.effectsArtist; }
    getPlanetArtist() { return this.planetArtist; }
    getShipArtist() { return this.shipArtist; }
    getEngine() { return { enableSlowMode: () => { }, disableSlowMode: () => { }, isPaused: () => this.paused }; }

    // Game state methods
    isGameWon() { return this.gameWon; }
    isGameLost() { return this.gameLost; }
    isPaused() { return this.paused; }
    isGameEnded() { return this.ended; }

    pause() { this.paused = true; }
    resume() { this.paused = false; }

    getGameTime() {
        if (this.gameEndTime > 0) {
            return this.gameEndTime - this.gameStartTime;
        }
        return Date.now() - this.gameStartTime;
    }

    // Selection methods
    getSelectedPlanet() { return this.selectedPlanet; }
    setSelectedPlanet(planet) { this.selectedPlanet = planet; }

    // Find planet at coordinates (for mouse interaction)
    findPlanetAt(x, y) {
        for (const planet of this.planets) {
            const planetX = planet.getX ? planet.getX() : planet.x;
            const planetY = planet.getY ? planet.getY() : planet.y;
            const radius = planet.getActualRadius ? planet.getActualRadius() : (planet.radius || 35);
            const distance = Math.hypot(planetX - x, planetY - y);
            if (distance <= radius) {
                return planet;
            }
        }
        return null;
    }
}

window.Game = Game;
