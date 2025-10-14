// GameGenerator.js - Port of GameGenerator
class GameGenerator {
    static generate(difficulty) {
        // Generate planets, operators, assign ownership, set up game
        let game = new window.Game();
        game.difficulty = difficulty;
        game.start();
        return game;
    }
}
window.GameGenerator = GameGenerator;
