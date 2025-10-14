// GameMenu.js - Port of GameMenu.java core logic for web
// Assumes existence of supporting JS classes for planets, ships, abilities, etc.

class GameMenu {
    constructor(game, frame) {
        this.game = game;
        this.frame = frame;
        this.frameCount = 0;
        this.lastTime = Date.now();
        this.selectedPlanet = null;
        this.hoveredPlanet = null;
        this.mousePosition = null;
        this.isDragging = false;
        this.hoveredAbility = null;
        this.showAbilityTooltip = false;
        this.abilityTooltipText = '';
        this.tooltipPosition = null;
        this.winPopupShown = false;
        this.clickedPlanet = null;
        this.clickedPlanetClearTime = 0;
        this.pauseMenu = frame.pauseMenu;
        this.gameOverMenu = frame.gameOverMenu;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupListeners();
        this.game.start();
        this.loop();
    }

    loop() {
        if (this.game.isGameEnded() && !this.winPopupShown) {
            this.winPopupShown = true;
            this.gameOverMenu.show();
        }
        this.renderGame(this.ctx);
        this.frameCount++;
        if (Date.now() - this.lastTime >= 1000) {
            document.title = `Space Game - FPS: ${this.frameCount}`;
            this.frameCount = 0;
            this.lastTime = Date.now();
        }
        requestAnimationFrame(() => this.loop());
    }

    renderGame(g) {
        // Clear canvas
        g.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render background
        if (window.BackgroundArtist && window.BackgroundArtist.renderBackground) {
            window.BackgroundArtist.renderBackground(g);
        }

        // Render central star
        if (window.CentralStarRenderer && window.CentralStarRenderer.render) {
            window.CentralStarRenderer.render(g);
        }

        // Render planets
        if (this.game && this.game.getPlanets) {
            const planets = this.game.getPlanets();
            for (const planet of planets) {
                if (window.PlanetArtist && window.PlanetArtist.render) {
                    window.PlanetArtist.render(g, planet, this.selectedPlanet === planet);
                }
            }
        }

        // Render ships
        if (this.game && this.game.getShips) {
            const ships = this.game.getShips();
            for (const ship of ships) {
                if (window.ShipArtist && window.ShipArtist.render) {
                    window.ShipArtist.render(g, ship);
                }
            }
        }

        // Render projectiles
        if (this.game && this.game.getProjectiles) {
            const projectiles = this.game.getProjectiles();
            for (const projectile of projectiles) {
                if (projectile.draw) {
                    projectile.draw(g);
                } else {
                    // Simple fallback rendering
                    g.fillStyle = '#FFD700';
                    g.beginPath();
                    g.arc(projectile.getX(), projectile.getY(), 3, 0, Math.PI * 2);
                    g.fill();
                }
            }
        }

        // Render connection lines (ship targeting)
        if (window.VisualSettings && window.VisualSettings.getInstance().isDisplayConnectionLines()) {
            this.renderConnectionLines(g);
        }

        // Render effects and abilities
        if (window.EffectsArtist && window.EffectsArtist.render) {
            window.EffectsArtist.render(g, this.game);
        }

        // Render UI overlay elements
        this.renderUIOverlay(g);
    }

    renderConnectionLines(g) {
        if (!this.game || !this.game.getShips) return;

        const ships = this.game.getShips();
        g.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        g.lineWidth = 1;

        for (const ship of ships) {
            const destination = ship.getDestination();
            if (destination) {
                g.beginPath();
                g.moveTo(ship.getX(), ship.getY());
                g.lineTo(destination.getX(), destination.getY());
                g.stroke();
            }
        }
    }

    renderUIOverlay(g) {
        // Render pause indicator if paused
        if (this.game && this.game.getEngine && this.game.getEngine().isPaused()) {
            g.fillStyle = 'rgba(0, 0, 0, 0.5)';
            g.font = '48px Arial';
            g.textAlign = 'center';
            g.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }

        // Render game stats
        this.renderGameStats(g);
    }

    renderGameStats(g) {
        if (!this.game) return;

        g.fillStyle = 'white';
        g.font = '16px Arial';
        g.textAlign = 'left';

        const stats = [];
        if (this.game.getPlanets) {
            stats.push(`Planets: ${this.game.getPlanets().length}`);
        }
        if (this.game.getShips) {
            stats.push(`Ships: ${this.game.getShips().length}`);
        }
        if (this.game.getProjectiles) {
            stats.push(`Projectiles: ${this.game.getProjectiles().length}`);
        }

        for (let i = 0; i < stats.length; i++) {
            g.fillText(stats[i], 10, 25 + i * 20);
        }
    }

    setupListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            // TODO: Drag targeting logic
        });
        this.canvas.addEventListener('mouseup', (e) => {
            // TODO: Drag release logic
        });
        this.canvas.addEventListener('mousemove', (e) => {
            // TODO: Hover logic for planets and abilities
        });
        this.canvas.addEventListener('click', (e) => {
            // TODO: Click targeting logic
        });
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyP') {
                if (this.game.isPaused()) {
                    this.pauseMenu.hide();
                    this.game.resume();
                } else {
                    this.pauseMenu.show();
                    this.game.pause();
                }
            } else if (e.code === 'Escape') {
                // TODO: Cancel targeting
                this.pauseMenu.show();
                this.game.pause();
            } else if (e.code === 'Tab') {
                // TODO: Toggle connection line visibility
            } else {
                // TODO: Ability keybinds
            }
        });
    }
}

window.GameMenu = GameMenu;
