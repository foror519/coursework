window.onload = () => {
    const player = storage.get('timeGame_player');
    if (!player) {
        window.location.href = 'pages/login.html';
        return;
    }
    document.getElementById('player-name').textContent = player;
};

function startGame() {
    const diff = parseInt(document.getElementById('difficulty-select').value);
    const lvl = parseInt(document.getElementById('level-select').value);
    storage.set('timeGame_session', { level: lvl, difficulty: diff });
    window.location.href = 'pages/game.html';
}

function goToRating() { window.location.href = 'pages/rating.html'; }
function logout() { localStorage.removeItem('timeGame_player'); window.location.href = 'pages/login.html'; }

function updateSessionData() {
    const levelSelect = document.getElementById('level-select');
    const diffSelect = document.getElementById('difficulty-select');
    const session = { level: levelSelect.value, difficulty: diffSelect.value };
    localStorage.setItem('timeGame_session', JSON.stringify(session));
}

let activeRow = 0; 
let activeCol = 0; 
let menuGrid = [];

window.addEventListener('DOMContentLoaded', () => {
    const sessionData = localStorage.getItem('timeGame_session');
    const levelSelect = document.getElementById('level-select'); 
    const difficultySelect = document.getElementById('difficulty-select');

    if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.level !== undefined && levelSelect) levelSelect.value = session.level;
        if (session.difficulty !== undefined && difficultySelect) difficultySelect.value = session.difficulty;
    }

    menuGrid = [
        [document.getElementById('difficulty-select')],
        [document.getElementById('level-select')],   
        [                                         
            document.getElementById('btn-start'),
            document.getElementById('btn-rating'),
            document.getElementById('btn-logout')
        ]
    ];

    menuGrid.forEach((row, rIdx) => {
        row.forEach((el, cIdx) => {
            if (!el) return;
            el.addEventListener('mouseenter', () => {
                activeRow = rIdx;
                activeCol = cIdx;
                renderFocus();
            });
            if (el.tagName === 'SELECT') {
                el.addEventListener('change', () => {
                    updateSessionData();
                    el.blur();
                });
            }
        });
    });

    activeRow = 0;
    activeCol = 0;
    renderFocus(); 
});

function renderFocus() {
    menuGrid.forEach(row => row.forEach(el => {
        if (el) el.classList.remove('menu-focused');
    }));
    const target = menuGrid[activeRow][activeCol];
    if (target) target.classList.add('menu-focused');
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
        if (activeRow === 0 || activeRow === 1) {
            const select = menuGrid[activeRow][0];
            select.selectedIndex = Math.min(select.options.length - 1, select.selectedIndex + 1);
            updateSessionData();
        } else {
            activeCol = Math.min(menuGrid[activeRow].length - 1, activeCol + 1);
        }
    } 
    else if (e.key === 'ArrowLeft') {
        if (activeRow === 0 || activeRow === 1) {
            const select = menuGrid[activeRow][0];
            select.selectedIndex = Math.max(0, select.selectedIndex - 1);
            updateSessionData();
        } else {
            activeCol = Math.max(0, activeCol - 1);
        }
    } 
    else if (e.key === 'Enter') {
        if (activeRow === 2) {
            menuGrid[activeRow][activeCol].click();
        }
    }
    
    renderFocus();
});