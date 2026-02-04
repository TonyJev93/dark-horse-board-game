import { CardProcessor } from './CardProcessor.js';
import { GameSetup } from './GameSetup.js';
import { ScoreCalculator } from './ScoreCalculator.js';

/**
 * Main game engine coordinating game flow, card processing, and AI turns
 * Manages turns, emits game events, and orchestrates state updates
 *
 * @class GameEngine
 */
export class GameEngine {
    /**
     * Initialize game engine with dependencies
     * @param {GameState} gameState - Central game state
     * @param {SceneManager} sceneManager - 3D scene manager
     * @param {UIManager} uiManager - UI manager
     */
    constructor(gameState, sceneManager, uiManager) {
        this.gameState = gameState;
        this.sceneManager = sceneManager;
        this.uiManager = uiManager;
        this.eventBus = gameState.eventBus;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('state:horseOrder', ({ newValue }) => {
            this.sceneManager.updateHorsePositions(newValue);
        });

        this.eventBus.on('state:isAnimating', ({ newValue }) => {
            if (!newValue) {
                this.eventBus.emit('animation:completed', {});
            }
        });
    }

    /**
     * Initialize game (setup horses and dark horse)
     */
    init() {
        GameSetup.initializeGame(this.gameState);
        this.eventBus.emit('game:initialized', {
            darkHorseId: this.gameState.darkHorseId,
            horseOrder: this.gameState.horseOrder,
        });
        
        // Show game start message
        this.showGameStartMessage();
        
        // Start the first turn based on who is first
        if (this.gameState.turn !== 0) {
            // AI goes first
            setTimeout(() => this.aiTurn(), 2000);
        } else {
            // Player goes first
            setTimeout(() => this.startPlayerTurn(), 2000);
        }
    }

    async playCard(playerIdx, cardId) {
        if (this.gameState.isAnimating || this.gameState.turn !== playerIdx) {
            return;
        }

        if (playerIdx === 0 && this.gameState.turnPhase !== 'card') {
            return;
        }

        const card = this.gameState.removeCard(playerIdx, cardId);
        if (!card) return;

        this.gameState.isAnimating = true;

        const playerName = playerIdx === 0 ? '나' : `AI ${playerIdx}`;
        const result = CardProcessor.processCard(card, this.gameState.horseOrder, playerName);

        this.gameState.horseOrder = result.newOrder;

        this.eventBus.emit('game:cardPlayed', {
            playerIdx,
            card,
            message: result.message,
            isPlayer: playerIdx === 0,
        });

        setTimeout(() => {
            this.gameState.isAnimating = false;
            this.endTurn();
        }, 1000);
    }

    takeDarkHorseToken(playerIdx) {
        if (
            this.gameState.turn !== playerIdx ||
            this.gameState.turnPhase !== 'token' ||
            !this.gameState.canTakeToken(playerIdx)
        ) {
            if (this.gameState.hands[playerIdx].length <= 1) {
                this.uiManager.showMessage(
                    '카드가 1장 이하일 때는 토큰을 가져올 수 없습니다!',
                    playerIdx === 0
                );
            }
            return;
        }

        this.gameState.takeToken(playerIdx);
        this.gameState.turnPhase = 'card';

        this.eventBus.emit('game:tokenTaken', {
            playerIdx,
            isPlayer: playerIdx === 0,
        });
    }

    skipToken(playerIdx) {
        if (this.gameState.turn !== playerIdx || this.gameState.turnPhase !== 'token') {
            return;
        }

        this.gameState.turnPhase = 'card';

        this.eventBus.emit('game:tokenSkipped', {
            playerIdx,
            isPlayer: playerIdx === 0,
        });
    }

    endTurn() {
        if (this.gameState.isGameOver) return;

        const totalRemaining = this.gameState.getTotalCardsRemaining();
        if (totalRemaining === 0) {
            this.finishGame();
            return;
        }

        let nextTurn = (this.gameState.turn + 1) % this.gameState.playerCount;
        let safetyCounter = 0;

        while (
            this.gameState.hands[nextTurn].length === 0 &&
            (this.gameState.tokensAvailable <= 0 || nextTurn === 0)
        ) {
            nextTurn = (nextTurn + 1) % this.gameState.playerCount;
            if (++safetyCounter > 4) {
                this.finishGame();
                return;
            }
        }

        this.gameState.turn = nextTurn;
        this.gameState.turnPhase = 'token';

        this.eventBus.emit('game:turnChanged', {
            turn: nextTurn,
            phase: 'token',
        });

        if (this.gameState.turn !== 0) {
            setTimeout(() => this.aiTurn(), 1000);
        } else {
            this.startPlayerTurn();
        }
    }

    startPlayerTurn() {
        const hasTokensAvailable = this.gameState.tokensAvailable > 0;
        const hasEnoughCards = this.gameState.hands[0].length > 1;
        const alreadyHasToken = this.gameState.tokens[0] > 0;

        if (hasTokensAvailable && !alreadyHasToken && hasEnoughCards) {
            this.gameState.turnPhase = 'token';
        } else {
            this.gameState.turnPhase = 'card';
        }

        this.eventBus.emit('game:playerTurnStarted', {
            phase: this.gameState.turnPhase,
        });
    }

    aiTurn() {
        if (this.gameState.isGameOver) return;

        const aiIdx = this.gameState.turn;
        const hand = this.gameState.hands[aiIdx];

        if (this.gameState.tokensAvailable > 0 && hand.length > 1 && Math.random() < 0.2) {
            this.gameState.takeToken(aiIdx);

            this.eventBus.emit('game:tokenTaken', {
                playerIdx: aiIdx,
                isPlayer: false,
            });

            setTimeout(() => {
                if (hand.length > 0) {
                    this.playCard(aiIdx, hand[Math.floor(Math.random() * hand.length)].id);
                }
            }, 500);
        } else if (hand.length > 0) {
            this.playCard(aiIdx, hand[Math.floor(Math.random() * hand.length)].id);
        } else {
            this.endTurn();
        }
    }

    finishGame() {
        if (this.gameState.isGameOver) return;

        this.gameState.isGameOver = true;

        const winnerId = this.gameState.horseOrder[6];

        this.eventBus.emit('game:finishing', {
            winnerId,
        });

        this.sceneManager.animateCamera(winnerId, () => {
            this.showResultModal();
        });
    }

    showResultModal() {
        const results = ScoreCalculator.calculateScores(this.gameState);

        this.eventBus.emit('game:finished', {
            results,
        });
    }

    showGameStartMessage() {
        this.eventBus.emit('game:startMessage', {
            message: '게임 시작!!!'
        });
    }
}
