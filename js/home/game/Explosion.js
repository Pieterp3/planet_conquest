// Explosion.js - Port of Explosion entity
class Explosion {
    constructor(x, y, radius, duration) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.duration = duration;
        this.startTime = Date.now();
    }
    render(g) {
        let elapsed = Date.now() - this.startTime;
        let alpha = 1.0 - (elapsed / this.duration);
        if (alpha < 0) alpha = 0;
        g.save();
        g.globalAlpha = alpha;
        g.beginPath();
        g.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        g.fillStyle = 'orange';
        g.fill();
        g.globalAlpha = 1.0;
        g.restore();
    }
}
window.Explosion = Explosion;
