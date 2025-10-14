// Ring.js - Port of Ring entity
class Ring {
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
        g.strokeStyle = this.color;
        g.lineWidth = 3;
        g.stroke();
        g.restore();
    }
}
window.Ring = Ring;
