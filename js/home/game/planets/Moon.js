// Moon.js - Port of Moon entity
class Moon {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    render(g) {
        g.save();
        g.beginPath();
        g.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        g.fillStyle = this.color;
        g.fill();
        g.restore();
    }
}
window.Moon = Moon;
