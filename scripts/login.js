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