import { CardProcessor } from './CardProcessor.js';
import { GameSetup } from './GameSetup.js';
import { ScoreCalculator } from './ScoreCalculator.js';

export class GameEngine {
    constructor(gameState, sceneManager, uiManager) {
        this.gameState = gameState;
        this.sceneManager = sceneManager;
        this.uiManager = uiManager;
    }

    init() {
        GameSetup.initializeGame(this.gameState);
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
        
        const playerName = playerIdx === 0 ? "나" : `AI ${playerIdx}`;
        const result = CardProcessor.processCard(card, this.gameState.horseOrder, playerName);
        
        this.gameState.horseOrder = result.newOrder;
        this.uiManager.showMessage(result.message, playerIdx === 0);
        this.sceneManager.updateHorsePositions(this.gameState.horseOrder);
        this.uiManager.render();
        
        setTimeout(() => { 
            this.gameState.isAnimating = false; 
            this.endTurn(); 
        }, 1000);
    }

    takeDarkHorseToken(playerIdx) {
        if (this.gameState.turn !== playerIdx || 
            this.gameState.turnPhase !== 'token' || 
            !this.gameState.canTakeToken(playerIdx)) {
            
            if (this.gameState.hands[playerIdx].length <= 1) {
                this.uiManager.showMessage("카드가 1장 이하일 때는 토큰을 가져올 수 없습니다!", playerIdx === 0);
            }
            return;
        }

        this.gameState.takeToken(playerIdx);
        this.uiManager.showMessage("다크호스 토큰 획득! 카드를 제출하세요.", playerIdx === 0);
        this.gameState.turnPhase = 'card';
        this.uiManager.render();
    }

    skipToken(playerIdx) {
        if (this.gameState.turn !== playerIdx || this.gameState.turnPhase !== 'token') {
            return;
        }
        
        this.uiManager.showMessage("토큰 패스! 카드를 제출하세요.", playerIdx === 0);
        this.gameState.turnPhase = 'card';
        this.uiManager.render();
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
        
        while (this.gameState.hands[nextTurn].length === 0 && 
               (this.gameState.tokensAvailable <= 0 || nextTurn === 0)) {
            nextTurn = (nextTurn + 1) % this.gameState.playerCount;
            if(++safetyCounter > 4) { 
                this.finishGame(); 
                return; 
            }
        }
        
        this.gameState.turn = nextTurn;
        this.gameState.turnPhase = 'token';
        this.uiManager.render();
        
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
            this.uiManager.render();
        } else {
            this.gameState.turnPhase = 'card';
            this.uiManager.render();
        }
    }

    aiTurn() {
        if (this.gameState.isGameOver) return;
        
        const aiIdx = this.gameState.turn;
        const hand = this.gameState.hands[aiIdx];
        
        if (this.gameState.tokensAvailable > 0 && hand.length > 1 && Math.random() < 0.2) {
            this.gameState.takeToken(aiIdx);
            this.gameState.tokensAvailable--;
            this.uiManager.showMessage(`AI ${aiIdx}: 토큰 선점!`, false);
            this.uiManager.render();
            
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
        this.uiManager.render();
        
        const winnerId = this.gameState.horseOrder[6];
        this.sceneManager.animateCamera(winnerId, () => {
            this.showResultModal();
        });
    }

    showResultModal() {
        const results = ScoreCalculator.calculateScores(this.gameState);
        this.uiManager.showResults(results);
    }
}
