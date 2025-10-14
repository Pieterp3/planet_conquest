// PauseMenu.js - Port of PauseMenu logic
class PauseMenu {
    constructor() {
        this.overlay = document.getElementById('pauseOverlay');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.resumeBtn.addEventListener('click', () => this.hide());
    }
    show() {
        this.overlay.style.display = 'flex';
    }
    hide() {
        this.overlay.style.display = 'none';
    }
}
window.PauseMenu = PauseMenu;
