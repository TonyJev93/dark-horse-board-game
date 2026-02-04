function setupGameData() {
    GameState.horseOrder = [...GameState.horseIds].sort(() => Math.random() - 0.5);
    GameState.darkHorseId = GameState.horseOrder[0];

    for(let i=0; i<4; i++) {
        GameState.bettings[i] = [...GameState.horseIds].sort(() => Math.random() - 0.5).slice(0, 2);
    }

    const types = ['forward', 'backward', 'swap', 'rider_fall_off'];
    const allActionCards = [];
    for(let i = 0; i < 40; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        let value = (type === 'forward' || type === 'backward') ? Math.floor(Math.random() * 2) + 1 : null;
        let target = (Math.random() > 0.4 && type !== 'rider_fall_off') ? GameState.horseIds[Math.floor(Math.random() * 7)] : null;
        allActionCards.push({ id: i, type, value, target });
    }

    for(let i = 0; i < 4; i++) {
        GameState.hands[i] = allActionCards.splice(0, 6);
    }
}

function showMessage(text, isPlayer = true) {
    const box = document.getElementById('message-box');
    box.innerText = text;
    box.style.opacity = '1';
    box.style.color = isPlayer ? '#3b82f6' : '#ef4444';
    setTimeout(() => { box.style.opacity = '0'; }, 1000);
}

function takeDarkHorseToken() {
    if (GameState.turn !== 0 || GameState.turnPhase !== 'token' || GameState.tokensAvailable <= 0 || GameState.isAnimating || GameState.hands[0].length <= 1) {
        if (GameState.hands[0].length <= 1) showMessage("카드가 1장 이하일 때는 토큰을 가져올 수 없습니다!", true);
        return;
    }
    GameState.tokens[0]++;
    GameState.tokensAvailable--;
    showMessage("다크호스 토큰 획득! 카드를 제출하세요.", true);
    
    GameState.turnPhase = 'card';
    renderUI();
}

function skipToken() {
    if (GameState.turn !== 0 || GameState.turnPhase !== 'token') return;
    
    showMessage("토큰 패스! 카드를 제출하세요.", true);
    GameState.turnPhase = 'card';
    renderUI();
}

async function playCard(playerIdx, cardId) {
    if (GameState.isAnimating || GameState.turn !== playerIdx) return;
    
    if (playerIdx === 0 && GameState.turnPhase !== 'card') return;
    
    const hand = GameState.hands[playerIdx];
    const cardIdx = hand.findIndex(c => c.id === cardId);
    const card = hand[cardIdx];
    GameState.isAnimating = true;
    processMove(card, playerIdx === 0);
    hand.splice(cardIdx, 1);
    renderUI();
    setTimeout(() => { GameState.isAnimating = false; endTurn(); }, 1000);
}

function processMove(card, isPlayer) {
    let horseId = card.target || GameState.horseOrder[Math.floor(Math.random() * 7)];
    let currentRank = GameState.horseOrder.indexOf(horseId);
    let name = isPlayer ? "나" : `AI ${GameState.turn}`;

    if (card.type === 'rider_fall_off') {
        const thirdRankHorse = GameState.horseOrder[4];
        GameState.horseOrder.splice(4, 1);
        GameState.horseOrder.unshift(thirdRankHorse);
        showMessage(`${name}: 3등 말 #${thirdRankHorse} 낙마!`, isPlayer);
    } else if (card.type === 'forward') {
        let moveValue = card.value || 1;
        if (currentRank === 6) {
            moveValue = -moveValue;
            showMessage(`${name}: #${horseId} 1등이라 후진!`, isPlayer);
        } else {
            showMessage(`${name}: #${horseId} 가속!`, isPlayer);
        }
        const newRank = Math.max(0, Math.min(6, currentRank + moveValue));
        GameState.horseOrder.splice(currentRank, 1);
        GameState.horseOrder.splice(newRank, 0, horseId);
    } else if (card.type === 'backward') {
        let moveValue = card.value || 1;
        if (currentRank === 0) {
            moveValue = -moveValue;
            showMessage(`${name}: #${horseId} 꼴찌라 전진!`, isPlayer);
        } else {
            showMessage(`${name}: #${horseId} 주춤...`, isPlayer);
        }
        const newRank = Math.max(0, Math.min(6, currentRank - moveValue));
        GameState.horseOrder.splice(currentRank, 1);
        GameState.horseOrder.splice(newRank, 0, horseId);
    } else if (card.type === 'swap') {
        const idx = Math.min(5, Math.max(0, currentRank));
        [GameState.horseOrder[idx], GameState.horseOrder[idx+1]] = [GameState.horseOrder[idx+1], GameState.horseOrder[idx]];
        showMessage(`${name}: 순위 탈환!`, isPlayer);
    }
    updateHorsePositions();
}

function endTurn() {
    if (GameState.isGameOver) return;
    const totalRemaining = GameState.hands.reduce((sum, h) => sum + h.length, 0);
    if (totalRemaining === 0) { finishGame(); return; }

    let nextTurn = (GameState.turn + 1) % 4;
    let safetyCounter = 0;
    while (GameState.hands[nextTurn].length === 0 && (GameState.tokensAvailable <= 0 || nextTurn === 0)) {
        nextTurn = (nextTurn + 1) % 4;
        if(++safetyCounter > 4) { finishGame(); return; }
    }
    GameState.turn = nextTurn;
    
    GameState.turnPhase = 'token';
    renderUI();
    
    if (GameState.turn !== 0) {
        setTimeout(aiTurn, 1000);
    } else {
        startPlayerTurn();
    }
}

function startPlayerTurn() {
    const hasTokensAvailable = GameState.tokensAvailable > 0;
    const hasEnoughCards = GameState.hands[0].length > 1;
    const alreadyHasToken = GameState.tokens[0] > 0;
    
    if (hasTokensAvailable && !alreadyHasToken && hasEnoughCards) {
        GameState.turnPhase = 'token';
        renderUI();
    } else {
        GameState.turnPhase = 'card';
        renderUI();
    }
}

function aiTurn() {
    if (GameState.isGameOver) return;
    const aiIdx = GameState.turn;
    const hand = GameState.hands[aiIdx];
    if (GameState.tokensAvailable > 0 && hand.length > 1 && Math.random() < 0.2) {
        GameState.tokens[aiIdx]++; GameState.tokensAvailable--;
        showMessage(`AI ${aiIdx}: 토큰 선점!`, false);
        renderUI();
        setTimeout(() => {
            if (hand.length > 0) {
                playCard(aiIdx, hand[Math.floor(Math.random() * hand.length)].id);
            }
        }, 500);
    } else if (hand.length > 0) {
        playCard(aiIdx, hand[Math.floor(Math.random() * hand.length)].id);
    } else endTurn();
}

function finishGame() {
    if (GameState.isGameOver) return;
    GameState.isGameOver = true;
    renderUI();
    const winnerId = GameState.horseOrder[6];
    const winnerHorse = horses[winnerId];
    const targetCamPos = new THREE.Vector3(winnerHorse.position.x + 5, 8, winnerHorse.position.z + 12);
    let frame = 0;
    const animateCam = () => {
        if(frame < 120) {
            camera.position.lerp(targetCamPos, 0.05);
            camera.lookAt(winnerHorse.position);
            frame++; requestAnimationFrame(animateCam);
        } else showResultModal();
    };
    animateCam();
}

function showResultModal() {
    const modal = document.getElementById('result-screen');
    const board = document.getElementById('score-board');
    board.innerHTML = '';
    const results = [];
    const dhInTop3 = GameState.horseOrder.slice(4).includes(GameState.darkHorseId);

    for(let i=0; i<4; i++) {
        let score = 0;
        let bettingInfo = "";
        
        const bettingCounts = {};
        GameState.bettings[i].forEach(id => {
            bettingCounts[id] = (bettingCounts[id] || 0) + 1;
        });

        GameState.bettings[i].forEach(id => {
            const rankIdx = GameState.horseOrder.indexOf(id);
            const pts = GameState.rankPoints[rankIdx];
            
            if (bettingCounts[id] === 2) {
                if (!bettingInfo.includes(`#${id}`)) {
                    const doublePoints = pts * 2;
                    score += doublePoints;
                    bettingInfo += ` #${id}×2(${doublePoints}점)`;
                }
            } else {
                score += pts;
                bettingInfo += ` #${id}(${pts}점)`;
            }
        });

        const tokenCount = GameState.tokens[i];
        const tokenBonus = dhInTop3 ? (tokenCount * 5) : (tokenCount * -3);
        score += tokenBonus;
        results.push({ name: i === 0 ? "Player (나)" : `AI 플레이어 ${i}`, score, tokenBonus, bettingInfo, isPlayer: i === 0 });
    }

    results.sort((a, b) => b.score - a.score);
    results.forEach((res, idx) => {
        const row = document.createElement('div');
        row.className = `flex justify-between items-center p-6 rounded-3xl border ${res.isPlayer ? 'bg-blue-600 border-white/50 scale-105 shadow-2xl' : 'bg-white/5 border-white/10 text-white'}`;
        row.innerHTML = `<div class="flex items-center gap-6"><span class="text-3xl font-black italic opacity-30">#${idx + 1}</span><div><div class="font-bold text-xl">${res.name}</div><div class="text-xs opacity-60 italic">Bet:${res.bettingInfo} | Token:${res.tokenBonus}</div></div></div><div class="text-4xl font-black">${res.score} <span class="text-sm opacity-50">PTS</span></div>`;
        board.appendChild(row);
    });
    modal.classList.add('show-result');
}
