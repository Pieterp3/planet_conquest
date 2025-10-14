// PlanetArtist.js - Port of PlanetArtist from Java
class PlanetArtist {
    constructor() { }
    setPlanets(planets) { this.planets = planets; }
    setHoveredPlanet(planet) { this.hoveredPlanet = planet; }
    setClickedPlanet(planet) { this.clickedPlanet = planet; }
    setSelectedPlanet(planet) { this.selectedPlanet = planet; }
    renderPlanets(g) {
        if (!this.planets) return;
        this.planets.forEach(planet => {
            g.save();
            g.beginPath();
            g.arc(planet.x, planet.y, planet.radius, 0, 2 * Math.PI);
            g.fillStyle = planet.operator ? planet.operator.color : '#888';
            g.globalAlpha = 0.9;
            g.fill();
            g.globalAlpha = 1.0;
            g.strokeStyle = '#fff';
            g.lineWidth = 2;
            g.stroke();
            g.restore();
        });
        // Highlight hovered planet
        if (this.hoveredPlanet) {
            g.save();
            g.beginPath();
            g.arc(this.hoveredPlanet.x, this.hoveredPlanet.y, this.hoveredPlanet.radius + 6, 0, 2 * Math.PI);
            g.strokeStyle = '#ff0';
            g.lineWidth = 3;
            g.stroke();
            g.restore();
        }
        // Highlight clicked planet
        if (this.clickedPlanet) {
            g.save();
            g.beginPath();
            g.arc(this.clickedPlanet.x, this.clickedPlanet.y, this.clickedPlanet.radius + 10, 0, 2 * Math.PI);
            g.strokeStyle = '#0ff';
            g.lineWidth = 4;
            g.stroke();
            g.restore();
        }
        // Highlight selected planet
        if (this.selectedPlanet) {
            g.save();
            g.beginPath();
            g.arc(this.selectedPlanet.x, this.selectedPlanet.y, this.selectedPlanet.radius + 14, 0, 2 * Math.PI);
            g.strokeStyle = '#fff';
            g.lineWidth = 5;
            g.stroke();
            g.restore();
        }
    }
}
window.PlanetArtist = PlanetArtist;
