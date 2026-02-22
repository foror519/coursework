const currentPlayer = storage.get('timeGame_player');
if (!currentPlayer) window.location.href = 'login.html';

const bestScores = storage.getJSON('timeGame_best_v6', { "0": {}, "1": {}, "2": {}, "3": {} });

let activeRow = 0;
let activeCol = 0;
let menuGrid = [];

window.onload = () => {
    viewRecords(0);
};

function viewRecords(lvl) {
    document.getElementById('tab-lvl-0').className = lvl === 0 ? 'btn-yellow' : '';
    document.getElementById('tab-lvl-1').className = lvl === 1 ? 'btn-yellow' : '';
    document.getElementById('tab-lvl-2').className = lvl === 2 ? 'btn-yellow' : '';
    document.getElementById('tab-lvl-3').className = lvl === 3 ? 'btn-yellow' : '';

    const list = document.getElementById('records-list');
    list.innerHTML = '';
    const levelData = bestScores[lvl] || {};
    
    const playersArray = Object.keys(levelData).map(name => ({ name, ...levelData[name] }));
    playersArray.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return parseFloat(a.delta) - parseFloat(b.delta);
    });

    if (playersArray.length === 0) {
        list.innerHTML = `<tr><td colspan="5">В этом секторе пока нет записей</td></tr>`;
        return;
    }

    playersArray.forEach((rec, index) => {
        const isMe = rec.name === currentPlayer;
        const color = isMe ? 'var(--color-green)' : 'var(--color-blue)';
        const weight = isMe ? 'bold' : 'normal';

        list.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td style="color:${color}; font-weight:${weight}">${rec.name}</td>
                <td class="diff-cell">${DIFF_NAMES[rec.difficulty] || 'UNK'}</td>
                <td class="points-cell">${rec.points}</td>
                <td>±${rec.delta}s</td>
            </tr>
        `;
    });
}

window.addEventListener('DOMContentLoaded', () => {
    menuGrid = [
        [
            document.getElementById('tab-lvl-0'),
            document.getElementById('tab-lvl-1'),
            document.getElementById('tab-lvl-2'),
            document.getElementById('tab-lvl-3')
        ],
        [document.getElementById('btn-back')]
    ];

    menuGrid.forEach((row, rIdx) => {
        row.forEach((el, cIdx) => {
            if (!el) return;
            el.addEventListener('mouseenter', () => {
                activeRow = rIdx;
                activeCol = cIdx;
                renderFocus();
            });
        });
    });

    renderFocus();
});

function renderFocus() {
    menuGrid.forEach(row => row.forEach(el => {
        if (el) el.classList.remove('menu-focused');
    }));
    const target = menuGrid[activeRow][activeCol];
    if (target) {
        target.classList.add('menu-focused');
        target.blur();
    }
}

document.addEventListener('keydown', (e) => {
    const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
    if (!gameKeys.includes(e.key)) return;

    e.preventDefault();
    if (document.activeElement) document.activeElement.blur();

    if (e.key === 'ArrowDown') {
        activeRow = Math.min(menuGrid.length - 1, activeRow + 1);
        if (activeCol >= menuGrid[activeRow].length) activeCol = 0;
    } 
    else if (e.key === 'ArrowUp') {
        activeRow = Math.max(0, activeRow - 1);
        if (activeCol >= menuGrid[activeRow].length) activeCol = 0;
    } 
    else if (e.key === 'ArrowRight') {
        activeCol = Math.min(menuGrid[activeRow].length - 1, activeCol + 1);
    } 
    else if (e.key === 'ArrowLeft') {
        activeCol = Math.max(0, activeCol - 1);
    } 
    else if (e.key === 'Enter') {
        menuGrid[activeRow][activeCol].click();
    }

    renderFocus();
});