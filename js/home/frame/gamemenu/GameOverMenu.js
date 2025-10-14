// GameOverMenu.js - Port of GameOverMenu logic
class GameOverMenu {
    constructor() {
        this.overlay = document.getElementById('gameOverOverlay');
        this.restartBtn = document.getElementById('restartBtn');
        this.restartBtn.addEventListener('click', () => this.hide());
    }
    show() {
        this.overlay.style.display = 'flex';
    }
    hide() {
        this.overlay.style.display = 'none';
    }
}
window.GameOverMenu = GameOverMenu;
