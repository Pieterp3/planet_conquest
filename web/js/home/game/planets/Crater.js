// Crater.js - Port of Crater entity
class Crater {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    render(g) {
        g.save();
        g.beginPath();
        g.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        g.fillStyle = '#888';
        g.fill();
        g.restore();
    }
}
window.Crater = Crater;
