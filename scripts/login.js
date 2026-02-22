let activeRow = 0;
let menuGrid = [];

window.onload = () => {
    const currentPlayer = storage.get('timeGame_player');
    if (currentPlayer) {
        document.getElementById('username-input').value = currentPlayer;
    }
};

function login() {
    const input = document.getElementById('username-input').value.trim();
    if (input) {
        storage.set('timeGame_player', input);
        window.location.href = '../index.html';
    } else {
        alert("Позывной не может быть пустым!");
    }
}

window.addEventListener('DOMContentLoaded', () => {
    menuGrid = [
        [document.getElementById('username-input')],
        [document.getElementById('btn-login')]
    ];

    menuGrid.forEach((row, rIdx) => {
        if (row[0]) {
            row[0].addEventListener('mouseenter', () => {
                activeRow = rIdx;
                renderFocus();
            });
        }
    });

    renderFocus(); 
});

function renderFocus() {
    menuGrid.forEach(row => { if (row[0]) row[0].classList.remove('menu-focused'); });
    const target = menuGrid[activeRow][0];
    if (target) {
        target.classList.add('menu-focused');
        if (target.tagName === 'INPUT') target.focus(); 
        else target.blur(); 
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeRow = Math.min(1, activeRow + 1);
        renderFocus();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeRow = Math.max(0, activeRow - 1);
        renderFocus();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        menuGrid[1][0].click(); 
    }
});