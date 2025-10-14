// AchievementMenu.js - Comprehensive achievement system
class AchievementMenu {
    constructor() {
        this.challengeManager = window._challengeManager || window.ChallengeManager?.getInstance();
        this.createAchievementPage();
    }

    createAchievementPage() {
        document.body.innerHTML = `
            <style>
                .achievement-container {
                    background: linear-gradient(135deg, #000428, #004e92);
                    color: white;
                    min-height: 100vh;
                    padding: 20px;
                    font-family: 'Orbitron', monospace;
                }
                
                .achievement-header {
                    text-align: center;
                    margin-bottom: 30px;
                    background: rgba(255,255,255,0.1);
                    padding: 20px;
                    border-radius: 10px;
                    backdrop-filter: blur(10px);
                }
                
                .achievement-header h1 {
                    margin: 0;
                    font-size: 2.5rem;
                    text-shadow: 0 0 20px #00f;
                }
                
                .back-button {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    background: rgba(0,0,255,0.7);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    text-decoration: none;
                    font-family: 'Orbitron', monospace;
                    transition: all 0.3s;
                    z-index: 1000;
                }
                
                .back-button:hover {
                    background: #00f;
                    box-shadow: 0 0 20px #00f;
                }
                
                .achievement-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 30px;
                }
                
                .stat-card {
                    background: rgba(255,255,255,0.1);
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                }
                
                .stat-number {
                    font-size: 2rem;
                    font-weight: bold;
                    color: #87ceeb;
                }
                
                .achievement-categories {
                    display: grid;
                    gap: 20px;
                }
                
                .category-section {
                    background: rgba(255,255,255,0.05);
                    padding: 20px;
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                
                .category-title {
                    font-size: 1.5rem;
                    margin-bottom: 15px;
                    color: #87ceeb;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .achievement-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 15px;
                }
                
                .achievement-card {
                    background: rgba(255,255,255,0.1);
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid;
                    transition: all 0.3s;
                    position: relative;
                }
                
                .achievement-card.completed {
                    border-left-color: #00ff00;
                    background: rgba(0,255,0,0.1);
                }
                
                .achievement-card.common { border-left-color: #888; }
                .achievement-card.uncommon { border-left-color: #00ff00; }
                .achievement-card.rare { border-left-color: #0080ff; }
                .achievement-card.epic { border-left-color: #8000ff; }
                .achievement-card.legendary { border-left-color: #ffa500; }
                
                .achievement-name {
                    font-size: 1.1rem;
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #fff;
                }
                
                .achievement-description {
                    color: #ccc;
                    font-size: 0.9rem;
                    margin-bottom: 10px;
                }
                
                .achievement-progress {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.8rem;
                }
                
                .progress-bar {
                    flex: 1;
                    height: 6px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 3px;
                    margin: 0 10px;
                    overflow: hidden;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #00f, #87ceeb);
                    border-radius: 3px;
                    transition: width 0.3s;
                }
                
                .coin-reward {
                    color: #ffd700;
                    font-weight: bold;
                }
                
                .completed-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    color: #00ff00;
                    font-size: 1.5rem;
                }
                
                @media (max-width: 768px) {
                    .achievement-container {
                        padding: 10px;
                    }
                    
                    .achievement-header h1 {
                        font-size: 2rem;
                    }
                    
                    .achievement-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .achievement-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            </style>
            
            <a href="mainmenu.html" class="back-button">← Back to Menu</a>
            
            <div class="achievement-container">
                <div class="achievement-header">
                    <h1>🏆 Achievements</h1>
                    <p>Track your galactic conquest progress</p>
                </div>
                
                <div class="achievement-stats" id="achievement-stats">
                    <!-- Stats will be populated by JavaScript -->
                </div>
                
                <div class="achievement-categories" id="achievement-categories">
                    <!-- Categories will be populated by JavaScript -->
                </div>
            </div>
        `;
        
        this.renderContent();
    }

    renderContent() {
        if (!this.challengeManager) {
            document.getElementById('achievement-categories').innerHTML = 
                '<p style="text-align: center; color: #ff6666;">Challenge system not available</p>';
            return;
        }

        const challenges = this.challengeManager.getAllChallenges();
        const completedCount = challenges.filter(c => c.completed).length;
        
        this.renderStats(challenges, completedCount);
        this.renderChallenges(challenges);
    }

    renderStats(challenges, completedCount) {
        const statsHtml = `
            <div class="stat-card">
                <div class="stat-number">${completedCount}</div>
                <div>Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${challenges.length}</div>
                <div>Total Achievements</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.challengeManager.totalPlanetsCaptured}</div>
                <div>Planets Captured</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.challengeManager.totalAbilitiesUsed}</div>
                <div>Abilities Used</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Math.round((completedCount / challenges.length) * 100)}%</div>
                <div>Completion Rate</div>
            </div>
        `;
        
        document.getElementById('achievement-stats').innerHTML = statsHtml;
    }

    renderChallenges(challenges) {
        const categories = {
            'Speed Challenges': challenges.filter(c => c.type === 'COMPLETE_MISSION_TIME'),
            'Ability Mastery': challenges.filter(c => c.type === 'USE_ABILITIES_COUNT' || c.type === 'USE_SPECIFIC_ABILITY'),
            'Planet Conquest': challenges.filter(c => c.type === 'CAPTURE_PLANETS'),
            'Perfect Games': challenges.filter(c => c.type === 'WIN_WITHOUT_LOSING_PLANET'),
            'Progression': challenges.filter(c => c.type === 'PURCHASE_SPECIFIC_ABILITY' || c.type === 'UNLOCK_ABILITIES' || c.type === 'PURCHASE_UPGRADES'),
            'Special Challenges': challenges.filter(c => c.type === 'WIN_WITHOUT_CAPTURING_PLANET_TYPE' || c.type === 'DONATE_GOLD')
        };

        const categoryIcons = {
            'Speed Challenges': '⚡',
            'Ability Mastery': '🔮',
            'Planet Conquest': '🌍',
            'Perfect Games': '💎',
            'Progression': '📈',
            'Special Challenges': '🏅'
        };

        let categoriesHtml = '';
        
        for (const [categoryName, categoryAchievements] of Object.entries(categories)) {
            if (categoryAchievements.length === 0) continue;
            
            const completedInCategory = categoryAchievements.filter(c => c.completed).length;
            
            categoriesHtml += `
                <div class="category-section">
                    <div class="category-title">
                        ${categoryIcons[categoryName]} ${categoryName}
                        <span style="margin-left: auto; font-size: 0.8rem; color: #ccc;">
                            (${completedInCategory}/${categoryAchievements.length})
                        </span>
                    </div>
                    <div class="achievement-grid">
                        ${categoryAchievements.map(achievement => this.renderAchievement(achievement)).join('')}
                    </div>
                </div>
            `;
        }
        
        document.getElementById('achievement-categories').innerHTML = categoriesHtml;
    }

    renderAchievement(achievement) {
        const progress = achievement.targetCount ? achievement.progress : (achievement.completed ? 1 : 0);
        const target = achievement.targetCount || 1;
        const progressPercent = Math.min((progress / target) * 100, 100);
        
        const progressText = achievement.targetCount 
            ? `${progress}/${target}` 
            : (achievement.completed ? 'Complete' : 'Incomplete');

        return `
            <div class="achievement-card ${achievement.rarity.toLowerCase()} ${achievement.completed ? 'completed' : ''}">
                ${achievement.completed ? '<div class="completed-badge">✓</div>' : ''}
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-progress">
                    <span>${progressText}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="coin-reward">💰${achievement.coinReward}</span>
                </div>
            </div>
        `;
    }
}

window.AchievementMenu = AchievementMenu;
