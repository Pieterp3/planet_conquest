// SettingsMenu.js - Port of SettingsMenu
class SettingsMenu {
    constructor() {
        this.overlay = document.getElementById('settings-overlay');
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'settings-overlay';
            this.overlay.style.position = 'fixed';
            this.overlay.style.top = '0';
            this.overlay.style.left = '0';
            this.overlay.style.width = '100vw';
            this.overlay.style.height = '100vh';
            this.overlay.style.background = 'rgba(0,0,0,0.8)';
            this.overlay.style.color = '#fff';
            this.overlay.style.display = 'none';
            this.overlay.style.zIndex = '100';
            this.overlay.innerHTML = '<div style="margin:80px auto;padding:40px;background:#222;border-radius:16px;max-width:400px;text-align:center;"><h2>Settings</h2><button id="close-settings">Close</button></div>';
            document.body.appendChild(this.overlay);
            this.overlay.querySelector('#close-settings').onclick = () => this.hide();
        }
    }
    show() {
        this.overlay.style.display = 'flex';
    }
    hide() {
        this.overlay.style.display = 'none';
    }
}
window.SettingsMenu = SettingsMenu;
