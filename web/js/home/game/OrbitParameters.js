// OrbitParameters.js - Port of OrbitParameters
class OrbitParameters {
    constructor(centerX, centerY, a, b, angle, speed) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.a = a;
        this.b = b;
        this.angle = angle;
        this.speed = speed;
    }
    update() {
        this.angle += this.speed;
    }
    getPosition() {
        return {
            x: this.centerX + this.a * Math.cos(this.angle),
            y: this.centerY + this.b * Math.sin(this.angle)
        };
    }
}
window.OrbitParameters = OrbitParameters;
