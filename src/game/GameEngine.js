import { CardProcessor } from './CardProcessor.js';
import { GameSetup } from './GameSetup.js';
import { ScoreCalculator } from './ScoreCalculator.js';
import { HORSE_COUNT } from '../core/GameConfig.js';

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

        this.eventBus.on('betting:confirmed', ({ selection }) => {
            this.startGameAfterBetting(selection);
        });

        this.eventBus.on('placement:horseSelected', ({ horseId }) => {
            this.gameState.selectHorseForPlacement(horseId);
        });

        this.eventBus.on('placement:placeHorse', ({ position }) => {
            this.placeHorse(position);
        });

        this.eventBus.on('placement:skipAll', () => {
            this.skipAllPlacement();
        });
    }

    /**
     * Initialize game (setup horses and dark horse)
     */
    init() {
        console.log('GameEngine.init() - gamePhase:', this.gameState.gamePhase);
        if (this.gameState.gamePhase === 'betting') {
            console.log('Showing betting selection...');
            this.uiManager.showBettingSelection();
        } else if (this.gameState.gamePhase === 'placement') {
            console.log('Showing placement screen...');
            this.uiManager.showPlacementScreen();
            if (this.gameState.placementTurn !== 0) {
                setTimeout(() => this.aiPlacementTurn(), 1000);
            }
        } else {
            this.startGameAfterBetting();
        }
    }

    startGameAfterBetting(playerBetting = null) {
        GameSetup.initializeGame(this.gameState, playerBetting);
        this.eventBus.emit('game:initialized', {
            darkHorseId: this.gameState.darkHorseId,
            horseOrder: this.gameState.horseOrder,
        });
        
        setTimeout(() => {
            this.showGameStartMessage();
            
            setTimeout(() => {
                if (this.gameState.turn !== 0) {
                    this.aiTurn();
                } else {
                    this.startPlayerTurn();
                }
            }, 2000);
        }, 500);
    }

    async playCard(playerIdx, cardId, cardData = null) {
        if (this.gameState.isAnimating || this.gameState.turn !== playerIdx) {
            return;
        }

        if (playerIdx === 0 && this.gameState.turnPhase !== 'card') {
            return;
        }

        const card = this.gameState.removeCard(playerIdx, cardId);
        if (!card) return;

        if (card.type === 'exchange_betting') {
            if (playerIdx === 0) {
                this.uiManager.showExchangeBettingModal(card);
            } else {
                this.aiExchangeBetting(playerIdx);
            }
            return;
        }

        const processedCard = card.type === 'plus_minus' && cardData ? { ...card, ...cardData } : card;

        this.gameState.isAnimating = true;

        const playerName = playerIdx === 0 ? '나' : `AI ${playerIdx}`;
        const result = CardProcessor.processCard(processedCard, this.gameState.horseOrder, playerName);

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
        const message = `다크호스: ${this.gameState.darkHorseId}번 말 (${HORSE_COUNT}등)`;
        this.eventBus.emit('game:startMessage', { message });
    }

    placeHorse(position) {
        const isComplete = this.gameState.placeHorseAt(position);
        
        if (isComplete) {
            this.uiManager.hidePlacementScreen();
            this.gameState.gamePhase = 'playing';
            this.startGameAfterBetting(this.gameState.playerBettingSelection);
        } else {
            if (this.gameState.placementTurn !== 0) {
                setTimeout(() => this.aiPlacementTurn(), 1000);
            }
        }
    }

    skipAllPlacement() {
        if (this.gameState.placementTurn !== 0) return;

        const remainingHorses = [...this.gameState.availableHorses];
        const shuffledHorses = remainingHorses.sort(() => Math.random() - 0.5);

        this.gameState.placedHorses = [...this.gameState.placedHorses, ...shuffledHorses.slice(0, -1)];
        this.gameState.darkHorseId = shuffledHorses[shuffledHorses.length - 1];
        this.gameState.availableHorses = [this.gameState.darkHorseId];
        this.gameState.horseOrder = [this.gameState.darkHorseId, ...this.gameState.placedHorses];

        this.uiManager.hidePlacementScreen();
        this.gameState.gamePhase = 'playing';
        this.startGameAfterBetting(this.gameState.playerBettingSelection);
    }

    aiPlacementTurn() {
        const availableHorses = this.gameState.availableHorses;
        if (availableHorses.length === 0) return;

        const randomHorse = availableHorses[Math.floor(Math.random() * availableHorses.length)];
        this.gameState.selectHorseForPlacement(randomHorse);

        setTimeout(() => {
            const randomPosition = Math.random() > 0.5 ? 'left' : 'right';
            this.placeHorse(randomPosition);
        }, 500);
    }

    performExchangeBetting(playerIdx, targetPlayerIdx, playerCardIdx, targetCardIdx) {
        const result = this.gameState.exchangeBettingCard(playerIdx, targetPlayerIdx, playerCardIdx, targetCardIdx);
        
        if (result) {
            const playerName = playerIdx === 0 ? '나' : `AI ${playerIdx}`;
            const targetName = targetPlayerIdx === 0 ? '나' : `AI ${targetPlayerIdx}`;
            const message = `${playerName}: ${result.playerCard}번 ↔ ${targetName}의 ${result.targetCard}번 말 교환!`;
            
            this.eventBus.emit('game:cardPlayed', {
                playerIdx,
                message,
                isPlayer: playerIdx === 0,
            });
            
            const delay = playerIdx === 0 ? 2000 : 1500;
            setTimeout(() => {
                this.gameState.isAnimating = false;
                this.sceneManager.updateBettingArrows(this.gameState.bettings, this.gameState.tokens[0] > 0);
                this.endTurn();
            }, delay);
        } else {
            this.gameState.isAnimating = false;
        }
    }

    aiExchangeBetting(playerIdx) {
        this.gameState.isAnimating = true;
        
        setTimeout(() => {
            const opponents = Array.from({ length: this.gameState.playerCount }, (_, i) => i)
                .filter(i => i !== playerIdx);
            const targetPlayer = opponents[Math.floor(Math.random() * opponents.length)];
            const playerCardIdx = Math.floor(Math.random() * 2);
            const targetCardIdx = Math.floor(Math.random() * 2);
            
            this.performExchangeBetting(playerIdx, targetPlayer, playerCardIdx, targetCardIdx);
        }, 1000);
    }
}
