// AbilityType.js - Port of AbilityType enum
const AbilityType = {
    FREEZE: {
        displayName: 'Freeze',
        drawIcon: function (g, x, y, size, active) {
            g.save();
            g.beginPath();
            g.arc(x, y, size / 2, 0, 2 * Math.PI);
            g.strokeStyle = active ? '#0ff' : '#88f';
            g.lineWidth = 3;
            g.stroke();
            g.restore();
        },
        getTooltipText: function (level) { return 'Freeze ability (Level ' + level + ')'; }
    },
    SHIELD: {
        displayName: 'Shield',
        drawIcon: function (g, x, y, size, active) {
            g.save();
            g.beginPath();
            g.arc(x, y, size / 2, 0, 2 * Math.PI);
            g.strokeStyle = active ? '#0f0' : '#8f8';
            g.lineWidth = 3;
            g.stroke();
            g.restore();
        },
        getTooltipText: function (level) { return 'Shield ability (Level ' + level + ')'; }
    },
    FLAME: {
        displayName: 'Flame',
        drawIcon: function (g, x, y, size, active) {
            g.save();
            g.beginPath();
            g.arc(x, y, size / 2, 0, 2 * Math.PI);
            g.strokeStyle = active ? '#f80' : '#fa0';
            g.lineWidth = 3;
            g.stroke();
            g.restore();
        },
        getTooltipText: function (level) { return 'Flame ability (Level ' + level + ')'; }
    },
    BLACKHOLE: {
        displayName: 'Black Hole',
        drawIcon: function (g, x, y, size, active) {
            g.save();
            g.beginPath();
            g.arc(x, y, size / 2, 0, 2 * Math.PI);
            g.strokeStyle = active ? '#222' : '#444';
            g.lineWidth = 3;
            g.stroke();
            g.restore();
        },
        getTooltipText: function (level) { return 'Black Hole ability (Level ' + level + ')'; }
    }
};
window.AbilityType = AbilityType;
