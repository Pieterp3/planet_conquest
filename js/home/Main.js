// Ported from Main.java
// 1-to-1 port from Java
class Main {
    static game = null;
    static frame = null;
    static outputDir = null;
    static main(args) {
        // Output redirection logic (logs.txt) would be handled differently in JS
        // Game constants and save/load logic would be handled by other modules
        // Shutdown hooks are not needed in browser JS
        Main.game = new Game();
        Main.frame = new GameFrame(Main.game);
    }
    static getGame() { return Main.game; }
    static getFrame() { return Main.frame; }
}
if (typeof module !== 'undefined') module.exports = Main;