import { PLAYER_COUNT, HORSE_COUNT, DARK_HORSE_TOKENS, RANK_POINTS } from './GameConfig.js';

export class GameState {
    constructor() {
        this.turn = 0;
        this.playerCount = PLAYER_COUNT;
        this.horseIds = Array.from({ length: HORSE_COUNT }, (_, i) => i + 1);
        this.horseOrder = [];
        this.darkHorseId = null;
        this.hands = Array(PLAYER_COUNT).fill(null).map(() => []);
        this.bettings = Array(PLAYER_COUNT).fill(null).map(() => []);
        this.tokensAvailable = DARK_HORSE_TOKENS;
        this.tokens = Array(PLAYER_COUNT).fill(0);
        this.isAnimating = false;
        this.isGameOver = false;
        this.rankPoints = RANK_POINTS;
        this.turnPhase = 'token';
    }

    nextTurn() {
        this.turn = (this.turn + 1) % this.playerCount;
    }

    isPlayerTurn() {
        return this.turn === 0;
    }

    canTakeToken(playerIdx) {
        return this.tokensAvailable > 0 && 
               this.tokens[playerIdx] === 0 && 
               this.hands[playerIdx].length > 1;
    }

    takeToken(playerIdx) {
        if (this.canTakeToken(playerIdx)) {
            this.tokens[playerIdx]++;
            this.tokensAvailable--;
            return true;
        }
        return false;
    }

    removeCard(playerIdx, cardId) {
        const hand = this.hands[playerIdx];
        const cardIdx = hand.findIndex(c => c.id === cardId);
        if (cardIdx !== -1) {
            return hand.splice(cardIdx, 1)[0];
        }
        return null;
    }

    hasCardsRemaining() {
        return this.hands.some(hand => hand.length > 0);
    }

    getTotalCardsRemaining() {
        return this.hands.reduce((sum, hand) => sum + hand.length, 0);
    }
}
