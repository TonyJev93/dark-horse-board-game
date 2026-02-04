import { HORSE_COLORS } from '../core/GameConfig.js';

/**
 * Manages all UI rendering and user interactions
 * Listens to game events and updates DOM elements
 *
 * @class UIManager
 */
export class UIManager {
    /**
     * Initialize UI manager with dependencies
     * @param {GameState} gameState - Central game state
     * @param {GameEngine} gameEngine - Game engine for card plays
     */
    constructor(gameState, gameEngine) {
        this.gameState = gameState;
        this.gameEngine = gameEngine;
        this.eventBus = gameState.eventBus;
        this.messageBox = document.getElementById('message-box');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('state:changed', () => {
            this.render();
        });

        this.eventBus.on('game:cardPlayed', ({ message, isPlayer }) => {
            this.showMessage(message, isPlayer);
        });

        this.eventBus.on('game:tokenTaken', ({ isPlayer }) => {
            const msg = isPlayer
                ? '다크호스 토큰 획득! 카드를 제출하세요.'
                : `AI ${this.gameState.turn}: 토큰 선점!`;
            this.showMessage(msg, isPlayer);
        });

        this.eventBus.on('game:tokenSkipped', ({ isPlayer }) => {
            this.showMessage('토큰 패스! 카드를 제출하세요.', isPlayer);
        });

        this.eventBus.on('game:finished', ({ results }) => {
            this.showResults(results);
        });
    }

    render() {
        this.renderPlayerStatus();
        this.renderAIStatus();
        this.renderRankings();
        this.renderTokensRemaining();
        this.renderTurnIndicators();
        this.renderCards();
        this.renderGameStatus();
        this.renderTokenModal();
    }

    renderPlayerStatus() {
        const playerTokenDisplay = document.getElementById('player-token-display');
        playerTokenDisplay.innerHTML = '';
        if (this.gameState.tokens[0] > 0) {
            const tokenIcon = document.createElement('div');
            tokenIcon.className =
                'w-6 h-6 bg-black rounded-full border-2 border-white shadow-lg flex items-center justify-center';
            tokenIcon.innerHTML = '<span class="text-white text-[10px] font-black">DH</span>';
            playerTokenDisplay.appendChild(tokenIcon);
        }

        const playerAssigned = document.getElementById('player-assigned-horses');
        playerAssigned.innerHTML = '';
        this.gameState.bettings[0].forEach((id) => {
            const isDarkHorse = id === this.gameState.darkHorseId;
            const horseColor = isDarkHorse ? '000000' : HORSE_COLORS[id].toString(16).padStart(6, '0');
            const box = document.createElement('div');
            box.className =
                'w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs border border-white/20 shadow-lg';
            box.style.backgroundColor = `#${horseColor}`;
            box.innerText = id;
            playerAssigned.appendChild(box);
        });

        document.getElementById('player-card-count').innerText =
            `카드 ${this.gameState.hands[0].length}장`;
    }

    renderAIStatus() {
        for (let i = 1; i <= 3; i++) {
            const aiHorses = document.getElementById(`ai-${i}-horses`);
            aiHorses.innerHTML = '';
            this.gameState.bettings[i].forEach((id) => {
                const isDarkHorse = id === this.gameState.darkHorseId;
                const horseColor = isDarkHorse ? '000000' : HORSE_COLORS[id].toString(16).padStart(6, '0');
                const dot = document.createElement('div');
                dot.className =
                    'w-4 h-4 rounded-md border border-white/10 flex items-center justify-center text-[8px] font-bold';
                dot.style.backgroundColor = `#${horseColor}`;
                dot.innerText = id;
                aiHorses.appendChild(dot);
            });

            const aiToken = document.getElementById(`ai-${i}-token`);
            if (aiToken) {
                if (this.gameState.tokens[i] > 0) {
                    aiToken.classList.remove('hidden');
                    aiToken.innerHTML = '<span class="text-white text-[8px] font-black">DH</span>';
                } else {
                    aiToken.classList.add('hidden');
                    aiToken.innerHTML = '';
                }
            }

            document.getElementById(`ai-${i}-cards`).innerText =
                `${this.gameState.hands[i].length}장`;
        }
    }

    renderRankings() {
        const rankContainer = document.getElementById('rankings');
        rankContainer.innerHTML = '';

        [...this.gameState.horseOrder].reverse().forEach((id, idx) => {
            const isDark = id === this.gameState.darkHorseId;
            const isMyHorse = this.gameState.bettings[0].includes(id);
            const horseColor = isDark ? '000000' : HORSE_COLORS[id].toString(16).padStart(6, '0');
            const div = document.createElement('div');
            div.className = `flex justify-between items-center p-3.5 rounded-2xl border transition-all duration-700 ${isMyHorse ? 'my-horse-rank' : isDark ? 'border-red-500/50 bg-red-500/10' : 'bg-black/40 border-white/5 text-white'}`;
            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="font-black ${isMyHorse ? 'text-white' : 'text-blue-400'} text-xs">${idx + 1}</span>
                    <span class="font-bold text-sm">HORSE #${id} ${isMyHorse ? '<span class="ml-1 text-[8px] bg-white text-red-600 px-1 rounded-sm">MY</span>' : ''}</span>
                </div>
                <div class="w-6 h-6 rounded-lg border border-white/20 relative flex items-center justify-center" style="background-color: #${horseColor}">
                    ${isDark ? '<span class="text-white text-[8px] font-black">DH</span>' : ''}
                </div>
            `;
            rankContainer.appendChild(div);
        });

        document.getElementById('dark-horse-info').innerText = `DH: #${this.gameState.darkHorseId}`;
    }

    renderTokensRemaining() {
        const tokensRemainingDisplay = document.getElementById('tokens-remaining-display');
        const tokensRemainingCount = document.getElementById('tokens-remaining-count');

        if (tokensRemainingDisplay && tokensRemainingCount) {
            tokensRemainingDisplay.innerHTML = '';
            tokensRemainingCount.innerText = this.gameState.tokensAvailable;

            for (let i = 0; i < this.gameState.tokensAvailable; i++) {
                const t = document.createElement('div');
                t.className = 'w-5 h-5 bg-black rounded-full border-2 border-white shadow-lg flex items-center justify-center';
                t.innerHTML = '<span class="text-white text-[8px] font-black">DH</span>';
                tokensRemainingDisplay.appendChild(t);
            }
        }
    }

    renderTurnIndicators() {
        document
            .querySelectorAll('.turn-indicator')
            .forEach((el) => el.classList.remove('active-turn'));

        if (!this.gameState.isGameOver) {
            if (this.gameState.turn === 0) {
                document.getElementById('player-status').classList.add('active-turn');
            } else if (document.getElementById(`ai-${this.gameState.turn}`)) {
                document.getElementById(`ai-${this.gameState.turn}`).classList.add('active-turn');
            }
        }
    }

    renderCards() {
        const cardArea = document.getElementById('card-area');
        cardArea.innerHTML = '';

        this.gameState.hands[0].forEach((card) => {
            const isDisabled =
                this.gameState.turn !== 0 ||
                this.gameState.turnPhase === 'token' ||
                this.gameState.isAnimating ||
                this.gameState.isGameOver;

            const el = document.createElement('div');
            el.className = `card min-w-[140px] h-48 bg-white rounded-3xl shadow-2xl p-5 flex flex-col items-center justify-between text-black pointer-events-auto shrink-0 border-b-8 border-gray-200 ${isDisabled ? 'disabled' : ''}`;

            const icon =
                card.type === 'forward'
                    ? '▲'
                    : card.type === 'backward'
                      ? '▼'
                      : card.type === 'swap'
                        ? '🔄'
                        : card.type === 'rider_fall_off'
                          ? '💥'
                          : '🏇';

            const color =
                card.type === 'forward'
                    ? 'text-blue-600'
                    : card.type === 'backward'
                      ? 'text-red-600'
                      : card.type === 'rider_fall_off'
                        ? 'text-orange-600'
                        : 'text-purple-600';

            const description = card.target
                ? `말 #${card.target}`
                : card.type === 'rider_fall_off'
                  ? '3등 → 7등'
                  : '전략적 선택';

            el.innerHTML = `<span class="text-[10px] font-black text-gray-400 uppercase">${card.type.replace('_', ' ')}</span><div class="text-5xl font-black ${color}">${icon}${card.value || ''}</div><div class="text-[11px] font-bold bg-gray-100 py-2 rounded-xl w-full text-center">${description}</div>`;

            if (!isDisabled) {
                el.onclick = () => this.gameEngine.playCard(0, card.id);
            }

            cardArea.appendChild(el);
        });
    }

    renderGameStatus() {
        const gameStatus = document.getElementById('game-status');

        if (this.gameState.isGameOver) {
            gameStatus.innerText = '경주가 종료되었습니다!';
        } else if (this.gameState.turn === 0) {
            if (this.gameState.turnPhase === 'token') {
                gameStatus.innerText = '다크호스 토큰을 가져갈까요?';
            } else {
                gameStatus.innerText = '카드를 선택하세요.';
            }
        } else {
            gameStatus.innerText = `AI ${this.gameState.turn}의 차례입니다.`;
        }
    }

    renderTokenModal() {
        const canTakeToken =
            this.gameState.turn === 0 &&
            this.gameState.turnPhase === 'token' &&
            this.gameState.tokensAvailable > 0 &&
            !this.gameState.isGameOver &&
            this.gameState.hands[0].length > 1 &&
            this.gameState.tokens[0] === 0;

        const showTokenPhase =
            this.gameState.turn === 0 &&
            this.gameState.turnPhase === 'token' &&
            !this.gameState.isGameOver;

        const tokenModal = document.getElementById('token-modal');
        if (showTokenPhase) {
            tokenModal.classList.remove('hidden');
            document.getElementById('modal-get-token').classList.toggle('hidden', !canTakeToken);
        } else {
            tokenModal.classList.add('hidden');
        }
    }

    showMessage(text, isPlayer = true) {
        this.messageBox.innerText = text;
        this.messageBox.style.opacity = '1';
        this.messageBox.style.color = isPlayer ? '#3b82f6' : '#ef4444';
        setTimeout(() => {
            this.messageBox.style.opacity = '0';
        }, 1000);
    }

    showResults(results) {
        const modal = document.getElementById('result-screen');
        const board = document.getElementById('score-board');
        board.innerHTML = '';

        results.forEach((res, idx) => {
            const row = document.createElement('div');
            row.className = `flex justify-between items-center p-6 rounded-3xl border ${res.isPlayer ? 'bg-blue-600 border-white/50 scale-105 shadow-2xl' : 'bg-white/5 border-white/10 text-white'}`;
            row.innerHTML = `<div class="flex items-center gap-6"><span class="text-3xl font-black italic opacity-30">#${idx + 1}</span><div><div class="font-bold text-xl">${res.name}</div><div class="text-xs opacity-60 italic">Bet:${res.bettingInfo} | Token:${res.tokenBonus}</div></div></div><div class="text-4xl font-black">${res.score} <span class="text-sm opacity-50">PTS</span></div>`;
            board.appendChild(row);
        });

        modal.classList.add('show-result');
    }
}
