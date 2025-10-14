// ShipArtist.js - Port of ShipArtist from Java
class ShipArtist {
    constructor(planetArtist) {
        this.planetArtist = planetArtist;
    }
    setShips(ships) { this.ships = ships; }
    setProjectiles(projectiles) { this.projectiles = projectiles; }
    renderShips(g) {
        if (!this.ships) return;
        this.ships.forEach(ship => {
            g.save();
            g.beginPath();
            g.arc(ship.x, ship.y, 8, 0, 2 * Math.PI);
            g.fillStyle = ship.operator ? ship.operator.color : '#fff';
            g.fill();
            g.strokeStyle = '#222';
            g.lineWidth = 1;
            g.stroke();
            g.restore();
        });
        // Render projectiles
        if (this.projectiles) {
            this.projectiles.forEach(proj => {
                g.save();
                g.beginPath();
                g.arc(proj.x, proj.y, 4, 0, 2 * Math.PI);
                g.fillStyle = '#ffd700';
                g.globalAlpha = 0.8;
                g.fill();
                g.globalAlpha = 1.0;
                g.restore();
            });
        }
    }
}
window.ShipArtist = ShipArtist;
