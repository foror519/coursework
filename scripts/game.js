const player = storage.get('timeGame_player');
const session = storage.getJSON('timeGame_session', null);

if (!player || !session) {
    window.location.href = '../index.html'; 
}

const MAX_LEVELS = 3;

const state = {
    player: player,
    level: session.level,
    difficulty: session.difficulty,
    isPlaying: false, 
    startTime: 0, 
    timerInterval: null,
    
    targetTime: (session.level === 0 || session.level === 1) ? 10 : session.level === 2 ? 15 : 20,
    maxBuffer: 2,
    
    bestScores: storage.getJSON('timeGame_best_v6', { "0": {}, "1": {}, "2": {}, "3": {} }),
    
    obsTimers: [],
    lastMouse: { x: null, y: null }
};

const dom = {
    area: document.getElementById('game-area'),
    timer: document.getElementById('timer-display'),
    modal: document.getElementById('message-modal'),
    msgTitle: document.getElementById('msg-title'),
    msgDesc: document.getElementById('msg-desc'),
    msgButtons: document.getElementById('msg-buttons')
};

window.onload = () => {
    document.getElementById('player-name-display').textContent = state.player;
    document.getElementById('diff-display').textContent = DIFF_NAMES[state.difficulty];
    document.getElementById('target-display').textContent = state.targetTime.toFixed(2);
    
    dom.area.addEventListener('mousemove', handleSmartMouseMove);
    dom.area.addEventListener('mouseleave', handleMouseLeave);
    
    document.addEventListener('contextmenu', e => { if (state.isPlaying) { e.preventDefault(); endGame(false, "ОШИБКА", "Блокировка ПКМ."); }});
    window.addEventListener('blur', () => { if (state.isPlaying) endGame(false, "СБОЙ", "Окно свернуто."); });

    createTrack();
};

function createTrack() {
    if (state.obsTimers) {
        state.obsTimers.forEach(el => clearTimeout(el.blinkTimer));
    }
    state.obsTimers = [];

    dom.area.innerHTML = '<div class="void-zone"></div>';
    let segments = [], obstacles = [];

    if (state.level === 0) {
        const pathHeight = Math.floor(Math.random() * 61) + 30;
        const pathY = 250 - (pathHeight / 2);
        const topPathHeight = Math.floor(Math.random() * 61) + 30;
        const topPathWidth = Math.floor(Math.random() * 201) + 150;
        const endZoneX = 380 + topPathWidth;
        const endZoneY = 150;

        segments = [
            { w: 60, h: pathHeight, x: 20, y: pathY, type: 'start' }, 
            { w: 240, h: pathHeight, x: 80, y: pathY, type: 'path' },            
            { w: 60, h: 200, x: 320, y: 150, type: 'path' },            
            { w: topPathWidth, h: topPathHeight, x: 380, y: 150, type: 'path' },           
            { w: 60, h: topPathHeight, x: endZoneX, y: endZoneY, type: 'end' }
        ];

        obstacles.push({ 
            x: 250, 
            y: pathY, 
            w: 30, 
            h: pathHeight, 
            anim: 'moveHorizontal', 
            baseDur: 1.5, 
            dist: 100 
        });

        
        
    } else if (state.level === 1) {
        segments = [
            { w: 60, h: 60, x: 20, y: 220, type: 'start' }, { w: 240, h: 60, x: 80, y: 220, type: 'path' },
            { w: 60, h: 200, x: 320, y: 150, type: 'path' }, { w: 300, h: 60, x: 380, y: 150, type: 'path' },
            { w: 60, h: 60, x: 680, y: 150, type: 'end' }
        ];
        obstacles.push({ x: 250, y: 220, w: 30, h: 60, anim: 'moveHorizontal', baseDur: 1.5, dist: 100});
        
    } else if (state.level === 2) {
        segments = [
            { w: 60, h: 60, x: 55, y: 335, type: 'start', borderRadius: '50%'},
            { w: 60, h: 60, x: 56, y: 336, type: 'path', borderRadius: '50%' }, 
            { w: 300, h: 60, x: 50, y: 240, type: 'path', deg: -40 },
            { w: 60, h: 60, x: 290, y: 160, type: 'path', borderRadius: '50%' }, 
            { w: 220, h: 220, x: 290, y: 70, type: 'ring' },
            { w: 60, h: 60, x: 450, y: 160, type: 'path', borderRadius: '50%' }, 
            { w: 300, h: 60, x: 450, y: 240, type: 'path', deg: 40 },
            { w: 60, h: 60, x: 690, y: 340, type: 'path', borderRadius: '50%' }, 
            { w: 60, h: 60, x: 690, y: 340, type: 'end', borderRadius: '50%' },
            { w: 50, h: 20, x: 375, y: 287, type: 'path'},
            { w: 50, h: 20, x: 375, y: 55, type: 'path'},
        ];
        obstacles.push({ x: 130, y: 290, w: 20, h: 60, anim: 'rotateCenter', baseDur: 2.00});
        obstacles.push({ x: 190, y: 240, w: 20, h: 60, anim: 'rotateCenterReverse', baseDur: 2.00});
        obstacles.push({ x: 250, y: 190, w: 20, h: 60, anim: 'rotateCenter', baseDur: 2.00});
        obstacles.push({ x: 650, y: 290, w: 20, h: 60, anim: 'rotateCenter', baseDur: 2.00});
        obstacles.push({ x: 590, y: 240, w: 20, h: 60, anim: 'rotateCenterReverse', baseDur: 2.00});
        obstacles.push({ x: 530, y: 190, w: 20, h: 60, anim: 'rotateCenter', baseDur: 2.00});
        obstacles.push({ x: 322, y: 103, w: 155, h: 155, anim: 'pulseSize', baseDur: 2.00, borderRadius: '50%'});

    } else if (state.level === 3) {
        segments = [
            { w: 60, h: 60, x: 20, y: 50, type: 'start' }, { w: 60, h: 350, x: 20, y: 50, type: 'path' },
            { w: 200, h: 60, x: 20, y: 340, type: 'path' }, { w: 60, h: 350, x: 200, y: 50, type: 'path' },
            { w: 200, h: 60, x: 200, y: 50, type: 'path' }, { w: 60, h: 350, x: 350, y: 50, type: 'path' },
            { w: 200, h: 60, x: 400, y: 340, type: 'path' }, { w: 60, h: 350, x: 550, y: 50, type: 'path' },
            { w: 100, h: 60, x: 600, y: 50, type: 'path' }, { w: 60, h: 350, x: 700, y: 50, type: 'path' },
            { w: 60, h: 60, x: 700, y: 340, type: 'end' }
        ];
        obstacles.push({ x: 50, y: 130, w: 30, h: 30, anim: 'moveHorizontal', baseDur: 1.0, dist: -30});
        obstacles.push({ x: 20, y: 210, w: 30, h: 30, anim: 'moveHorizontal', baseDur: 1.0, dist: 30});
        obstacles.push({ x: 50, y: 290, w: 30, h: 30, anim: 'moveHorizontal', baseDur: 1.0, dist: -30});
        obstacles.push({ x: 120, y: 349, w: 40, h: 40, anim: 'pulseSize', baseDur: 1.0});
        obstacles.push({ x: 230, y: 130, w: 30, h: 30, anim: 'moveHorizontal', baseDur: 1.0, dist: -30});
        obstacles.push({ x: 200, y: 220, w: 30, h: 30, anim: 'moveHorizontal', baseDur: 1.0, dist: 30});
        obstacles.push({ x: 230, y: 310, w: 30, h: 30, anim: 'moveHorizontal', baseDur: 1.0, dist: -30});
        obstacles.push({ x: 285, y: 58, w: 40, h: 40, anim: 'pulseSize', baseDur: 1.0});
        obstacles.push({ x: 350, y: 170, w: 60, h: 20, anim: 'none', baseDur: 1.0, exist: 0.6, hide: 0.9});
        obstacles.push({ x: 350, y: 130, w: 60, h: 20, anim: 'none', baseDur: 1.0, exist: 0.5, hide: 1.0});
        obstacles.push({ x: 350, y: 290, w: 60, h: 20, anim: 'none', baseDur: 1.0, exist: 0.9, hide: 0.6});
        obstacles.push({ x: 350, y: 210, w: 60, h: 20, anim: 'none', baseDur: 1.0, exist: 0.7, hide: 0.8});
        obstacles.push({ x: 350, y: 250, w: 60, h: 20, anim: 'none', baseDur: 1.0, exist: 0.8, hide: 0.7});
        obstacles.push({ x: 430, y: 340, w: 20, h: 60, anim: 'rotateCenter', baseDur: 2.00});
        obstacles.push({ x: 510, y: 340, w: 20, h: 60, anim: 'rotateCenterReverse', baseDur: 2.00});
        obstacles.push({ x: 550, y: 130, w: 60, h: 20, anim: 'none', baseDur: 1.0, exist: 0.9, hide: 0.6});
        obstacles.push({ x: 550, y: 170, w: 60, h: 20, anim: 'none', baseDur: 1.0, exist: 0.8, hide: 0.7});
        obstacles.push({ x: 550, y: 210, w: 60, h: 20, anim: 'none', baseDur: 1.0, exist: 0.7, hide: 0.8});
        obstacles.push({ x: 550, y: 250, w: 60, h: 20, anim: 'none', baseDur: 1.0, exist: 0.6, hide: 0.9});
        obstacles.push({ x: 550, y: 290, w: 60, h: 20, anim: 'none', baseDur: 1.0, exist: 0.5, hide: 1.0});
        obstacles.push({ x: 635, y: 58, w: 40, h: 40, anim: 'pulseSize', baseDur: 1.0});
        obstacles.push({ x: 730, y: 130, w: 30, h: 30, anim: 'moveHorizontal', baseDur: 1.0, dist: -30});
        obstacles.push({ x: 700, y: 210, w: 30, h: 30, anim: 'moveHorizontal', baseDur: 1.0, dist: 30});
        obstacles.push({ x: 730, y: 290, w: 30, h: 30, anim: 'moveHorizontal', baseDur: 1.0, dist: -30});
    }

    segments.forEach(seg => {
        const el = document.createElement('div');
        
        if (seg.type === 'start') {
            el.className = 'zone start-zone'; 
            el.textContent = 'START';
            
            let chargeTimer = null;
            let isCharging = false;

            el.onmousedown = (e) => {
                if (state.isPlaying) return;
                isCharging = true;
                el.style.transform = "scale(0.9)";
                el.style.backgroundColor = "var(--color-yellow)";
                el.style.color = "black";
                el.textContent = "...";
                
                chargeTimer = setTimeout(() => {
                    if (isCharging) {
                        el.style.transform = "scale(1)";
                        el.style.backgroundColor = "var(--color-green)";
                        el.style.color = "white";
                        el.textContent = "GO!";
                        startTimer(e);
                    }
                }, 1000);
            };

            const resetCharge = () => {
                if (!state.isPlaying && isCharging) {
                    isCharging = false;
                    clearTimeout(chargeTimer);
                    el.style.transform = "scale(1)";
                    el.style.backgroundColor = "var(--color-blue)";
                    el.style.color = "white";
                    el.textContent = "START";
                }
            };

            el.onmouseup = resetCharge;
            el.onmouseleave = resetCharge;
            el.ondragstart = () => false; 
            
        } else if (seg.type === 'end') {
            el.className = 'zone end-zone'; el.id = 'end-zone'; el.textContent = 'END';
            el.onmouseenter = winLevel;
        } else if (seg.type === 'ring') {
            el.className = 'track-segment';
            el.style.backgroundColor = 'transparent';
            el.style.border = '60px solid var(--safe-zone)'; 
            el.style.borderRadius = '50%';
            el.style.boxSizing = 'border-box';
        } else {
            el.className = 'track-segment';
        }
        
        el.style.width = seg.w + 'px';
        el.style.height = seg.h + 'px';
        el.style.left = seg.x + 'px';
        el.style.top = seg.y + 'px';
        
        if (seg.deg !== undefined) {
            el.style.rotate = `${seg.deg}deg`;
        }

        if (seg.borderRadius && seg.type !== 'ring') {
            el.style.borderRadius = seg.borderRadius;
        }
        
        dom.area.appendChild(el);
    });

    obstacles.forEach(obs => {
        const el = document.createElement('div');
        el.className = 'obstacle';
        
        let dur = Math.max(0.5, obs.baseDur - (state.difficulty * 0.25));
        const distance = obs.dist || (obs.anim === 'moveHorizontal' ? 160 : 100);
        const direction = obs.anim.includes('rotate') ? 'normal' : 'alternate';
        const animString = obs.anim === 'none' ? 'none' : `${obs.anim} ${dur}s infinite linear ${direction}`;

        el.style.cssText = `
            width: ${obs.w}px; 
            height: ${obs.h}px; 
            left: ${obs.x}px; 
            top: ${obs.y}px; 
            animation: ${animString};
            --move-dist: ${distance}px; 
        `;
        
        if (obs.borderRadius !== undefined) {
            el.style.borderRadius = obs.borderRadius;
        }
        
        if (obs.exist && obs.hide) {
            let isVisible = true;
            
            const blinkSpeed = Math.max(0.4, 1 - ((state.difficulty - 1) * 0.2)); 
            const currentExist = obs.exist * blinkSpeed;
            const currentHide = obs.hide * blinkSpeed;
            
            const toggleVisibility = () => {
                isVisible = !isVisible;
                if (isVisible) {
                    el.classList.remove('ghost');
                    el.blinkTimer = setTimeout(toggleVisibility, currentExist * 1000);
                } else {
                    el.classList.add('ghost');
                    el.blinkTimer = setTimeout(toggleVisibility, currentHide * 1000);
                }
            };
            
            el.blinkTimer = setTimeout(toggleVisibility, currentExist * 1000);
            state.obsTimers.push(el);
        }

        dom.area.appendChild(el);
    });
}

function startTimer(e) {
    if (state.isPlaying) return;
    state.isPlaying = true;
    state.startTime = Date.now();
    if (e) state.lastMouse = { x: e.clientX, y: e.clientY };
    document.getElementById('end-zone').classList.add('active');

    state.timerInterval = setInterval(() => {
        const current = (Date.now() - state.startTime) / 1000;
        dom.timer.textContent = current.toFixed(2);
        if (current > state.targetTime + state.maxBuffer) endGame(false, "ПРОВАЛ", "Время вышло.");
    }, 50);
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!state.isPlaying) return;
    if (state.lastMouse.x) checkCollisionAtPoint(state.lastMouse.x, state.lastMouse.y);
    requestAnimationFrame(gameLoop);
}

function handleSmartMouseMove(e) {
    if (!state.isPlaying) return;
    const { clientX: curX, clientY: curY } = e;
    if (!state.lastMouse.x) { state.lastMouse = { x: curX, y: curY }; return; }

    const dist = Math.hypot(curX - state.lastMouse.x, curY - state.lastMouse.y);
    const steps = Math.ceil(dist / 4);
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        if (checkCollisionAtPoint(state.lastMouse.x + (curX - state.lastMouse.x) * t, state.lastMouse.y + (curY - state.lastMouse.y) * t)) return;
    }
    state.lastMouse = { x: curX, y: curY };
}

function checkCollisionAtPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return false;
    if (el.classList.contains('obstacle')) { endGame(false, "УДАР", "Столкновение!"); return true; }
    if (el.classList.contains('void-zone')) { endGame(false, "СХОД", "Курсор в пустоте."); return true; }
    return false;
}

function handleMouseLeave() { if (state.isPlaying) endGame(false, "ПОТЕРЯ", "Курсор ушел."); }

function winLevel() {
    if (!state.isPlaying) return;
    const finalTime = ((Date.now() - state.startTime) / 1000);
    const delta = Math.abs(state.targetTime - finalTime);
    
    let base = 0, rank = "";
    if (delta <= 0.05) { base = 1000; rank = "ИДЕАЛЬНО"; }
    else if (delta <= 0.15) { base = 500; rank = "ОТЛИЧНО"; }
    else if (delta <= 0.30) { base = 200; rank = "ХОРОШО"; }
    else if (delta <= 1.00) { base = 50; rank = "ДОПУСТИМО"; }
    else { base = 0; rank = "НЕТОЧНО"; }

    const pts = Math.floor(base * (1 + state.difficulty * 0.5));
    
    if (!state.bestScores[state.level]) state.bestScores[state.level] = {};
    const oldRec = state.bestScores[state.level][state.player];
    
    if (!oldRec || pts > oldRec.points || (pts === oldRec.points && delta < parseFloat(oldRec.delta))) {
        if (pts > 0) {
            state.bestScores[state.level][state.player] = { time: finalTime.toFixed(2), delta: delta.toFixed(3), points: pts, difficulty: state.difficulty };
            storage.set('timeGame_best_v6', state.bestScores);
        }
    }
    endGame(true, "УСПЕХ", `Дельта: ±${delta.toFixed(3)}с\nРанг: ${rank}\nОчки: ${pts}`);
}

function endGame(isWin, title, desc) {
    clearInterval(state.timerInterval);
    state.isPlaying = false;
    
    if (isWin) {
        createFireworks();
    }
    
    dom.msgTitle.textContent = title; 
    dom.msgTitle.style.color = isWin ? "var(--color-green)" : "var(--color-red)";
    dom.msgDesc.textContent = desc;
    
    dom.msgButtons.innerHTML = ''; 

    if (isWin && state.level < MAX_LEVELS) {
        const btnNext = document.createElement('button');
        btnNext.textContent = "ДАЛЕЕ >>";
        btnNext.className = "btn-green";
        btnNext.onclick = () => {
            const session = storage.getJSON('timeGame_session');
            session.level = state.level + 1;
            storage.set('timeGame_session', session);
            location.reload(); 
        };
        dom.msgButtons.appendChild(btnNext);
    }

    const btnRetry = document.createElement('button');
    btnRetry.textContent = isWin ? "УЛУЧШИТЬ" : "ЗАНОВО";
    if (!isWin) btnRetry.className = "btn-red";
    btnRetry.onclick = () => location.reload(); 
    dom.msgButtons.appendChild(btnRetry);

    const btnMenu = document.createElement('button');
    btnMenu.textContent = "В МЕНЮ";
    btnMenu.className = "btn-yellow";
    btnMenu.onclick = () => window.location.href = '../index.html';
    dom.msgButtons.appendChild(btnMenu);

    dom.modal.style.display = 'flex';
}

function createFireworks() {
    const colors = ['var(--color-blue)', 'var(--color-green)', 'var(--color-yellow)', 'white'];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < 60; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 200 + 50;
        
        particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}