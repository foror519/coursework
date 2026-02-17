const currentPlayer = storage.get('timeGame_player');
if (!currentPlayer) window.location.href = 'login.html';


const bestScores = storage.getJSON('timeGame_best_v6', { "1": {}, "2": {}, "3": {} });

window.onload = () => viewRecords(1);

function viewRecords(lvl) {
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