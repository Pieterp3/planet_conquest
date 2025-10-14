// Difficulty.js - Port of Difficulty enum
const Difficulty = {
    EASY: { name: 'EASY', botCount: 1, planetCount: 6, enemyRatio: 0.3 },
    MEDIUM: { name: 'MEDIUM', botCount: 2, planetCount: 10, enemyRatio: 0.5 },
    HARD: { name: 'HARD', botCount: 4, planetCount: 14, enemyRatio: 0.7 },
    EXTREME: { name: 'EXTREME', botCount: 6, planetCount: 18, enemyRatio: 0.8 }
};
window.Difficulty = Difficulty;
