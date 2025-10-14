// CoinIcon.js - Port of CoinIcon
class CoinIcon {
    static drawCoinWithText(g, x, y, text, font, color) {
        g.save();
        g.font = font;
        g.fillStyle = color;
        g.beginPath();
        g.arc(x + 12, y - 8, 10, 0, 2 * Math.PI);
        g.fill();
        g.fillStyle = '#fff';
        g.fillText(text, x + 28, y);
        g.restore();
    }
}
window.CoinIcon = CoinIcon;
