// Ported from Player.java
// 1-to-1 port from Java
class Player extends Operator {
    constructor(game) {
        super('Player', '#0066FF');
        this.id = 0;
        this.game = game;
    }

    getId() { return this.id; }
    setGame(game) { this.game = game; }
    getGame() { return this.game; }

    removeShip(ship) {
        const index = this.ships.indexOf(ship);
        if (index >= 0) {
            this.ships.splice(index, 1);
        }

        // Also remove from game
        if (this.game && this.game.removeShip) {
            this.game.removeShip(ship);
        }
    }

    removePlanet(planet) {
        const index = this.planets.indexOf(planet);
        if (index >= 0) {
            this.planets.splice(index, 1);
        }
    }

    tick() {
        // Player doesn't have autonomous behavior like bots
    }
}

window.Player = Player;