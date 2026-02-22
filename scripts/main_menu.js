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

function goToRating() {
    window.location.href = 'pages/rating.html';
}

function logout() {
    localStorage.removeItem('timeGame_player');
    window.location.href = 'pages/login.html';
}
window.addEventListener('DOMContentLoaded', () => {
    const sessionData = localStorage.getItem('timeGame_session');
    
    if (sessionData) {
        const session = JSON.parse(sessionData);
        
        const levelSelect = document.getElementById('level-select'); 
        const difficultySelect = document.getElementById('difficulty-select');
        
        if (session.level && levelSelect) levelSelect.value = session.level;
        if (session.difficulty && difficultySelect) difficultySelect.value = session.difficulty;
    }
});

document.getElementById('level-select').addEventListener('change', updateSessionData);
document.getElementById('difficulty-select').addEventListener('change', updateSessionData);

function updateSessionData() {
    const level = document.getElementById('level-select').value;
    const diff = document.getElementById('difficulty-select').value;
    
    const session = { level: level, difficulty: diff };
    localStorage.setItem('timeGame_session', JSON.stringify(session));
}

document.addEventListener('keydown', (e) => {
    const diffSelect = document.getElementById('difficulty-select');
    const lvlSelect = document.getElementById('level-select');

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        let current = parseInt(diffSelect.value);
        current = e.key === 'ArrowUp' ? Math.min(3, current + 1) : Math.max(0, current - 1);
        diffSelect.value = current;
        updateSessionData();
    } 
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        let current = parseInt(lvlSelect.value);
        current = e.key === 'ArrowRight' ? Math.min(3, current + 1) : Math.max(0, current - 1);
        lvlSelect.value = current;
        updateSessionData();
    } 
    else if (e.key === 'Enter') {
        startGame();
    }
});