// ShopMenu.js - Handles ShopMenu logic, tab switching, upgrades/abilities rendering, coin display, donation dialog
// Use global abilities and upgrades variables

// Initialize PlayerData connection
function getPlayerData() {
    if (window.PlayerData && window.PlayerData.getInstance) {
        return window.PlayerData.getInstance();
    }
    // Fallback mock if PlayerData not available
    if (!window._playerData) {
        window._playerData = {
            coins: 1000,
            upgrades: {},
            abilities: {},
            getUpgradeLevel: function (type) { return this.upgrades[type] || 0; },
            setUpgradeLevel: function (type, level) { this.upgrades[type] = level; },
            canAffordUpgrade: function (type) { return true; },
            purchaseUpgrade: function (type) { return true; },
            isAbilityUnlocked: function (type) { return this.abilities[type] || false; },
            unlockAbility: function (type) { this.abilities[type] = true; return true; },
            addCoins: function (amount) { this.coins += amount; },
            spendCoins: function (amount) { if (this.coins >= amount) { this.coins -= amount; return true; } return false; }
        };
    }
    return window._playerData;
}

// Global functions for upgrade system
window.getUpgradeCost = function (upgradeKey) {
    const playerData = getPlayerData();
    if (playerData.getUpgradeCost) {
        return playerData.getUpgradeCost(upgradeKey);
    }
    // Fallback calculation
    const upgrade = window.upgrades.find(u => u.key === upgradeKey);
    if (!upgrade) return -1;
    const level = playerData.getUpgradeLevel(upgradeKey);
    if (level >= upgrade.maxLevel) return -1;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.growthRate, level));
};

window.purchaseUpgrade = function (upgradeKey) {
    const playerData = getPlayerData();
    if (playerData.purchaseUpgrade) {
        return playerData.purchaseUpgrade(upgradeKey);
    }
    // Fallback logic
    const cost = window.getUpgradeCost(upgradeKey);
    if (cost > 0 && playerData.coins >= cost) {
        playerData.coins -= cost;
        const currentLevel = playerData.getUpgradeLevel(upgradeKey);
        playerData.setUpgradeLevel(upgradeKey, currentLevel + 1);
        return true;
    }
    return false;
};

window.playerCoins = 0;
window.upgradeLevels = {};

window.purchaseAbility = function (abilityName, cost) {
    const playerData = getPlayerData();
    if (playerData.unlockAbility) {
        return playerData.unlockAbility(abilityName);
    }
    // Fallback logic
    if (playerData.coins >= cost && !playerData.isAbilityUnlocked(abilityName)) {
        playerData.coins -= cost;
        playerData.abilities[abilityName] = true;
        return true;
    }
    return false;
};

// Donation logic implementation
window._shopMenu = {
    donate: function (amount) {
        if (!window._playerData) return false;
        if (window._playerData.coins >= amount) {
            window._playerData.coins -= amount;
            if (window._challengeManager && typeof window._challengeManager.onGoldDonated === 'function') {
                window._challengeManager.onGoldDonated(amount);
            }
            window.SaveLoadManager.savePlayerData();
            return true;
        }
        return false;
    }
};

document.addEventListener('DOMContentLoaded', function () {
    // Update global variables from PlayerData
    function updatePlayerData() {
        const playerData = getPlayerData();
        window.playerCoins = playerData.coins || 0;
        window.upgradeLevels = {};
        
        // Load upgrade levels
        if (window.upgrades && Array.isArray(window.upgrades)) {
            window.upgrades.forEach(upgrade => {
                window.upgradeLevels[upgrade.key] = playerData.getUpgradeLevel(upgrade.key);
            });
        }
    }    // Update coin display
    function updateCoinDisplay() {
        updatePlayerData();
        const coinCountElements = document.querySelectorAll('.coin-count');
        coinCountElements.forEach(el => {
            el.textContent = window.playerCoins;
        });
    }

    // Render upgrades dynamically from upgrades.js
    function renderUpgrades() {
        updatePlayerData();
        const upgradesPanel = document.getElementById('upgrades-panel');
        upgradesPanel.innerHTML = '';
        window.upgrades.forEach(upgrade => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.style.display = 'flex';
            card.style.flexDirection = 'row';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'space-between';
            card.style.background = 'rgba(40,40,60,0.85)';
            card.style.borderRadius = '16px';
            card.style.padding = '18px 28px';
            card.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
            // Left: info
            const info = document.createElement('div');
            info.style.flex = '1';
            let level = window.upgradeLevels[upgrade.key] || 0;
            let value = upgrade.calcValue(level);
            info.innerHTML = `<h3 style='margin:0 0 8px 0;color:#ffe066;'>${upgrade.name}</h3><p style='margin:0;color:#ccc;'>${upgrade.desc}<br>Level: <b>${level}</b> | Value: <b>${value}${upgrade.unit}</b></p>`;
            // Right: button
            const btn = document.createElement('button');
            btn.className = 'footer-button gold';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            let cost = window.getUpgradeCost(upgrade.key);
            btn.innerHTML = cost < 0 ? 'Max Level' : `Upgrade <span class='coin-canvas'></span> <span style='margin-left:4px;'>${cost}</span>`;
            btn.disabled = cost < 0 || window.playerCoins < cost;
            // Coin canvas
            const coinSpan = btn.querySelector('.coin-canvas');
            if (coinSpan) {
                const coinBtnCanvas = document.createElement('canvas');
                coinBtnCanvas.width = 24;
                coinBtnCanvas.height = 24;
                coinSpan.appendChild(coinBtnCanvas);
                let coinBtnAngle = 0;
                function animateBtnCoin() {
                    coinBtnAngle += 0.09;
                    const ctx = coinBtnCanvas.getContext('2d');
                    ctx.clearRect(0, 0, 24, 24);
                    ctx.save();
                    ctx.translate(12, 12);
                    ctx.rotate(coinBtnAngle);
                    ctx.beginPath();
                    ctx.arc(0, 0, 10, 0, 2 * Math.PI);
                    ctx.fillStyle = 'gold';
                    ctx.shadowColor = '#ffe066';
                    ctx.shadowBlur = 6;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#ffd700';
                    ctx.stroke();
                    ctx.rotate(-coinBtnAngle);
                    ctx.font = 'bold 12px Arial';
                    ctx.fillStyle = '#fff8dc';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('¢', 0, 1);
                    ctx.restore();
                    requestAnimationFrame(animateBtnCoin);
                }
                animateBtnCoin();
            }
            btn.addEventListener('click', () => {
                const cost = window.getUpgradeCost(upgrade.key);
                const currentLevel = window.upgradeLevels[upgrade.key] || 0;
                const maxLevel = upgrade.maxLevel || 30;
                
                if (currentLevel >= maxLevel) {
                    showMessageDialog('Max Level Reached', `${upgrade.name} is already at maximum level (${maxLevel})!`);
                } else if (window.playerCoins < cost) {
                    showMessageDialog('Not Enough Coins', `You need ${cost} coins to purchase this upgrade.\n\nYou currently have ${window.playerCoins} coins.`);
                } else if (window.purchaseUpgrade(upgrade.key)) {
                    updateCoinDisplay();
                    renderUpgrades();
                    showMessageDialog('Purchase Successful!', `${upgrade.name} upgraded to level ${currentLevel + 1}!`);
                }
            });
            card.appendChild(info);
            card.appendChild(btn);
            upgradesPanel.appendChild(card);
        });
    }

    // Donation dialog logic
    // Already declared later, remove duplicate
    // Animate coin logic (already handled elsewhere or not needed here)

    // Render upgrades dynamically from upgrades.js
    // ...existing code...
    // Render abilities dynamically from abilities.js
    function renderAbilities() {
        const abilitiesPanel = document.getElementById('abilities-panel') || document.createElement('div');
        if (!abilitiesPanel.parentNode) {
            document.body.appendChild(abilitiesPanel);
            abilitiesPanel.id = 'abilities-panel';
        }
        abilitiesPanel.innerHTML = '';
        if (!window.abilities) {
            console.warn('abilities array not found');
            return;
        }

        const playerData = getPlayerData();

        window.abilities.forEach((ability) => {
            const card = document.createElement('div');
            card.className = 'ability-card';
            card.style.display = 'flex';
            card.style.flexDirection = 'row';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'space-between';
            card.style.background = 'rgba(40,40,60,0.85)';
            card.style.borderRadius = '16px';
            card.style.padding = '18px 28px';
            card.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';

            // Left: info
            const info = document.createElement('div');
            info.style.flex = '1';
            info.innerHTML = `<h3 style='margin:0 0 8px 0;color:#ffe066;'><span style='font-size:1.5em;vertical-align:middle;'>${ability.icon}</span> ${ability.name}</h3><p style='margin:0;color:#ccc;'>${ability.desc}</p>`;

            // Right: button
            const btn = document.createElement('button');
            btn.className = 'footer-button gold';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';

            const isUnlocked = playerData.isAbilityUnlocked ? playerData.isAbilityUnlocked(ability.name) : false;
            const canAfford = playerData.coins >= ability.cost;

            btn.innerHTML = isUnlocked ? 'Purchased' : `Unlock <span class='coin-canvas'></span> <span style='margin-left:4px;'>${ability.cost}</span>`;
            btn.disabled = isUnlocked || !canAfford;
            // Coin canvas
            const coinSpan = btn.querySelector('.coin-canvas');
            if (coinSpan) {
                const coinBtnCanvas = document.createElement('canvas');
                coinBtnCanvas.width = 24;
                coinBtnCanvas.height = 24;
                coinSpan.appendChild(coinBtnCanvas);
                let coinBtnAngle = 0;
                function animateBtnCoin() {
                    coinBtnAngle += 0.09;
                    const ctx = coinBtnCanvas.getContext('2d');
                    ctx.clearRect(0, 0, 24, 24);
                    ctx.save();
                    ctx.translate(12, 12);
                    ctx.rotate(coinBtnAngle);
                    ctx.beginPath();
                    ctx.arc(0, 0, 10, 0, 2 * Math.PI);
                    ctx.fillStyle = 'gold';
                    ctx.shadowColor = '#ffe066';
                    ctx.shadowBlur = 6;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#ffd700';
                    ctx.stroke();
                    ctx.rotate(-coinBtnAngle);
                    ctx.font = 'bold 12px Arial';
                    ctx.fillStyle = '#fff8dc';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('¢', 0, 1);
                    ctx.restore();
                    requestAnimationFrame(animateBtnCoin);
                }
                animateBtnCoin();
            }
            btn.addEventListener('click', () => {
                const currentCoins = parseInt(document.getElementById('coin-count').textContent);
                const playerData = window.getPlayerData();
                const isUnlocked = playerData.unlockedAbilities[ability.name];
                
                if (isUnlocked) {
                    showMessageDialog('Already Purchased', 'You have already purchased this ability!');
                } else if (currentCoins < ability.cost) {
                    showMessageDialog('Insufficient Coins', `You need ${ability.cost} coins to purchase this ability. You currently have ${currentCoins} coins.`);
                } else if (window.purchaseAbility(ability.name, ability.cost)) {
                    updateCoinDisplay();
                    renderAbilities();
                    showMessageDialog('Purchase Successful', `Successfully purchased ${ability.name}!`);
                } else {
                    showMessageDialog('Purchase Failed', 'Unable to complete purchase. Please try again.');
                }
            });
            card.appendChild(info);
            card.appendChild(btn);
            abilitiesPanel.appendChild(card);
        });
    }

    // Tab switching functionality
    function showTab(tabName) {
        // Hide all tab panels
        const panels = document.querySelectorAll('.tab-panel');
        panels.forEach(panel => {
            panel.style.display = 'none';
        });
        
        // Remove active class from all buttons
        const buttons = document.querySelectorAll('.tab-button');
        buttons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Show selected panel
        const selectedPanel = document.getElementById(tabName + '-panel');
        if (selectedPanel) {
            selectedPanel.style.display = 'block';
        }
        
        // Add active class to selected button
        const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
    }
    
    // Add event listeners to tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            showTab(tabName);
        });
    });

    // Initialize content
    renderUpgrades();
    renderAbilities();
    
    // Show upgrades tab by default
    showTab('upgrades');

    // Background rendering handled by main page

    // Donation dialog logic
    const donateButton = document.getElementById('donate-button');
    if (donateButton) {
        donateButton.addEventListener('click', () => {
            const donationDialog = document.getElementById('donation-dialog');
            if (donationDialog) donationDialog.style.display = 'flex';
        });
    }
    
    // Back to menu button
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'mainmenu.html';
        });
    }
    // Wait for dialog to be loaded before adding listeners
    function setupDonationDialogListeners() {
        const donationDialog = document.getElementById('donation-dialog');
        const closeDonation = document.getElementById('close-donation');
        const confirmDonation = document.getElementById('confirm-donation');
        if (donationDialog && closeDonation && confirmDonation) {
            closeDonation.addEventListener('click', () => {
                donationDialog.style.display = 'none';
            });
            confirmDonation.addEventListener('click', () => {
                const donationAmountInput = document.getElementById('donation-amount');
                let amount = parseInt(donationAmountInput.value, 10);
                if (isNaN(amount) || amount < 1) {
                    showMessageDialog('Invalid Amount', 'Please enter a valid donation amount.');
                    return;
                }
                if (amount > window._playerData.coins) {
                    showMessageDialog('Not Enough Gold', 'You do not have enough gold to donate that amount!');
                    return;
                }
                // Deduct coins and handle donation logic
                if (window._shopMenu && typeof window._shopMenu.donate === 'function') {
                    window._shopMenu.donate(amount);
                }
                donationDialog.style.display = 'none';
                showMessageDialog('Thank You!', 'Thank you for your donation!');
                // Custom message dialog logic
                function showMessageDialog(title, message) {
                    const dialog = document.getElementById('message-dialog');
                    const titleElem = document.getElementById('message-title');
                    const descElem = document.getElementById('message-desc');
                    const closeBtn = document.getElementById('close-message');
                    const confirmBtn = document.getElementById('confirm-message');
                    if (dialog && titleElem && descElem && closeBtn && confirmBtn) {
                        titleElem.textContent = title;
                        descElem.textContent = message;
                        dialog.style.display = 'flex';
                        function closeDialog() {
                            dialog.style.display = 'none';
                            closeBtn.removeEventListener('click', closeDialog);
                            confirmBtn.removeEventListener('click', closeDialog);
                        }
                        closeBtn.addEventListener('click', closeDialog);
                        confirmBtn.addEventListener('click', closeDialog);
                    }
                }
            });
        } else {
            // Retry until dialog is loaded
            setTimeout(setupDonationDialogListeners, 50);
        }
    }
    setupDonationDialogListeners();

});

// Link from mainmenu to shopmenu
window.openShopMenu = function () {
    window.location.href = 'shopmenu.html';
};
