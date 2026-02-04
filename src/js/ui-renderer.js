function renderUI() {
    const playerTokenDisplay = document.getElementById('player-token-display');
    playerTokenDisplay.innerHTML = '';
    if (GameState.tokens[0] > 0) {
        const tokenIcon = document.createElement('div');
        tokenIcon.className = "w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center";
        tokenIcon.innerHTML = '<span class="text-white text-[10px] font-black">DH</span>';
        playerTokenDisplay.appendChild(tokenIcon);
    }
    
    const playerAssigned = document.getElementById('player-assigned-horses');
    playerAssigned.innerHTML = '';
    GameState.bettings[0].forEach(id => {
        const box = document.createElement('div');
        box.className = "w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs border border-white/20 shadow-lg";
        box.style.backgroundColor = `#${horseColors[id].toString(16).padStart(6, '0')}`;
        box.innerText = id;
        playerAssigned.appendChild(box);
    });

    for(let i=1; i<=3; i++) {
        const aiHorses = document.getElementById(`ai-${i}-horses`);
        aiHorses.innerHTML = '';
        GameState.bettings[i].forEach(id => {
            const dot = document.createElement('div');
            dot.className = "w-4 h-4 rounded-md border border-white/10 flex items-center justify-center text-[8px] font-bold";
            dot.style.backgroundColor = `#${horseColors[id].toString(16).padStart(6, '0')}`;
            dot.innerText = id;
            aiHorses.appendChild(dot);
        });
        
        const aiToken = document.getElementById(`ai-${i}-token`);
        if (aiToken) {
            if (GameState.tokens[i] > 0) {
                aiToken.classList.remove('hidden');
            } else {
                aiToken.classList.add('hidden');
            }
        }
        
        document.getElementById(`ai-${i}-cards`).innerText = `${GameState.hands[i].length}장`;
    }

    const rankContainer = document.getElementById('rankings');
    rankContainer.innerHTML = '';
    [...GameState.horseOrder].reverse().forEach((id, idx) => {
        const isDark = id === GameState.darkHorseId;
        const isMyHorse = GameState.bettings[0].includes(id);
        const div = document.createElement('div');
        div.className = `flex justify-between items-center p-3.5 rounded-2xl border transition-all duration-700 ${isMyHorse ? 'my-horse-rank' : (isDark ? 'border-red-500/50 bg-red-500/10' : 'bg-black/40 border-white/5 text-white')}`;
        div.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="font-black ${isMyHorse ? 'text-white' : 'text-blue-400'} text-xs">${idx + 1}</span>
                    <span class="font-bold text-sm">HORSE #${id} ${isMyHorse ? '<span class="ml-1 text-[8px] bg-white text-red-600 px-1 rounded-sm">MY</span>' : ''}</span>
                </div>
                <div class="w-6 h-6 rounded-lg border border-white/20" style="background-color: #${horseColors[id].toString(16).padStart(6, '0')}"></div>
            `;
        rankContainer.appendChild(div);
    });

    const tokensRemainingDisplay = document.getElementById('tokens-remaining-display');
    const tokensRemainingCount = document.getElementById('tokens-remaining-count');
    if (tokensRemainingDisplay && tokensRemainingCount) {
        tokensRemainingDisplay.innerHTML = '';
        tokensRemainingCount.innerText = GameState.tokensAvailable;
        
        for(let i=0; i<GameState.tokensAvailable; i++) {
            const t = document.createElement('div');
            t.className = "w-5 h-5 bg-red-600 rounded-full border-2 border-white shadow-lg";
            tokensRemainingDisplay.appendChild(t);
        }
    }

    document.querySelectorAll('.turn-indicator').forEach(el => el.classList.remove('active-turn'));
    if (!GameState.isGameOver) {
        if (GameState.turn === 0) document.getElementById('player-status').classList.add('active-turn');
        else if (document.getElementById(`ai-${GameState.turn}`)) document.getElementById(`ai-${GameState.turn}`).classList.add('active-turn');
    }

    const cardArea = document.getElementById('card-area');
    cardArea.innerHTML = '';
    GameState.hands[0].forEach((card) => {
        const isDisabled = GameState.turn !== 0 || GameState.turnPhase === 'token' || GameState.isAnimating || GameState.isGameOver;
        const el = document.createElement('div');
        el.className = `card min-w-[140px] h-48 bg-white rounded-3xl shadow-2xl p-5 flex flex-col items-center justify-between text-black pointer-events-auto shrink-0 border-b-8 border-gray-200 ${isDisabled ? 'disabled' : ''}`;
        let icon = card.type === 'forward' ? '▲' : (card.type === 'backward' ? '▼' : (card.type === 'swap' ? '🔄' : (card.type === 'rider_fall_off' ? '💥' : '🏇')));
        let color = card.type === 'forward' ? 'text-blue-600' : (card.type === 'backward' ? 'text-red-600' : (card.type === 'rider_fall_off' ? 'text-orange-600' : 'text-purple-600'));
        let description = card.target ? `말 #${card.target}` : (card.type === 'rider_fall_off' ? '3등 → 7등' : '전략적 선택');
        el.innerHTML = `<span class="text-[10px] font-black text-gray-400 uppercase">${card.type.replace('_', ' ')}</span><div class="text-5xl font-black ${color}">${icon}${card.value || ''}</div><div class="text-[11px] font-bold bg-gray-100 py-2 rounded-xl w-full text-center">${description}</div>`;
        if (!isDisabled) el.onclick = () => playCard(0, card.id);
        cardArea.appendChild(el);
    });

    const gameStatus = document.getElementById('game-status');
    if (GameState.isGameOver) {
        gameStatus.innerText = '경주가 종료되었습니다!';
    } else if (GameState.turn === 0) {
        if (GameState.turnPhase === 'token') {
            gameStatus.innerText = '다크호스 토큰을 가져갈까요?';
        } else {
            gameStatus.innerText = '카드를 선택하세요.';
        }
    } else {
        gameStatus.innerText = `AI ${GameState.turn}의 차례입니다.`;
    }

    const canTakeToken = GameState.turn === 0 && 
                       GameState.turnPhase === 'token' && 
                       GameState.tokensAvailable > 0 && 
                       !GameState.isGameOver && 
                       GameState.hands[0].length > 1 &&
                       GameState.tokens[0] === 0;
    
    const showTokenPhase = GameState.turn === 0 && 
                          GameState.turnPhase === 'token' && 
                          !GameState.isGameOver;
    
    const tokenModal = document.getElementById('token-modal');
    if (showTokenPhase) {
        tokenModal.classList.remove('hidden');
        document.getElementById('modal-get-token').classList.toggle('hidden', !canTakeToken);
    } else {
        tokenModal.classList.add('hidden');
    }
    
    const btnGetToken = document.getElementById('btn-get-token');
    const btnSkipToken = document.getElementById('btn-skip-token');
    if (btnGetToken) btnGetToken.classList.toggle('hidden', !canTakeToken);
    if (btnSkipToken) btnSkipToken.classList.toggle('hidden', !showTokenPhase);
    
    document.getElementById('player-card-count').innerText = `카드 ${GameState.hands[0].length}장`;
    document.getElementById('dark-horse-info').innerText = `DH: #${GameState.darkHorseId}`;
}
