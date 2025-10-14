// PlanetFeatures.js - Port of PlanetFeatures
class PlanetFeatures {
    constructor() {
        this.rings = [];
        this.craters = [];
        this.moons = [];
    }
    addRing(ring) { this.rings.push(ring); }
    addCrater(crater) { this.craters.push(crater); }
    addMoon(moon) { this.moons.push(moon); }
    render(g, planet) {
        this.rings.forEach(ring => ring.render(g));
        this.craters.forEach(crater => crater.render(g));
        this.moons.forEach(moon => moon.render(g));
    }
}
window.PlanetFeatures = PlanetFeatures;
