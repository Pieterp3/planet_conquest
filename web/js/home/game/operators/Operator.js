// Operator.js - Port of Operator (player/bot)
class Operator {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.planets = [];
        this.ships = [];
    }
    addPlanet(planet) {
        this.planets.push(planet);
    }
    addShip(ship) {
        this.ships.push(ship);
    }
}
window.Operator = Operator;
