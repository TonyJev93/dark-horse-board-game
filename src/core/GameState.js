import { PLAYER_COUNT, HORSE_COUNT, DARK_HORSE_TOKENS, RANK_POINTS } from './GameConfig.js';
import { EventBus } from './EventBus.js';

/**
 * Central game state manager with event-driven architecture
 * Manages game state, emits events on state changes, and handles immutability
 *
 * @class GameState
 * @example
 * const gameState = new GameState();
 * gameState.on('state:changed', (data) => console.log('State changed:', data));
 * gameState.turn = 1; // Automatically emits 'state:changed' event
 */
export class GameState {
    /**
     * Initialize game state with default values
     */
    constructor() {
        this.eventBus = new EventBus();
        this._state = {
            turn: Math.floor(Math.random() * PLAYER_COUNT),
            playerCount: PLAYER_COUNT,
            horseIds: Array.from({ length: HORSE_COUNT }, (_, i) => i + 1),
            horseOrder: [],
            darkHorseId: null,
            hands: Array(PLAYER_COUNT)
                .fill(null)
                .map(() => []),
            bettings: Array(PLAYER_COUNT)
                .fill(null)
                .map(() => []),
            tokensAvailable: DARK_HORSE_TOKENS,
            tokens: Array(PLAYER_COUNT).fill(0),
            isAnimating: false,
            isGameOver: false,
            rankPoints: RANK_POINTS,
            turnPhase: 'token',
        };
    }

    get turn() {
        return this._state.turn;
    }
    set turn(value) {
        this._setState({ turn: value });
    }

    get playerCount() {
        return this._state.playerCount;
    }

    get horseIds() {
        return this._state.horseIds;
    }

    get horseOrder() {
        return this._state.horseOrder;
    }
    set horseOrder(value) {
        this._setState({ horseOrder: value });
    }

    get darkHorseId() {
        return this._state.darkHorseId;
    }
    set darkHorseId(value) {
        this._setState({ darkHorseId: value });
    }

    get hands() {
        return this._state.hands;
    }

    get bettings() {
        return this._state.bettings;
    }

    get tokensAvailable() {
        return this._state.tokensAvailable;
    }
    set tokensAvailable(value) {
        this._setState({ tokensAvailable: value });
    }

    get tokens() {
        return this._state.tokens;
    }

    get isAnimating() {
        return this._state.isAnimating;
    }
    set isAnimating(value) {
        this._setState({ isAnimating: value });
    }

    get isGameOver() {
        return this._state.isGameOver;
    }
    set isGameOver(value) {
        this._setState({ isGameOver: value });
    }

    get rankPoints() {
        return this._state.rankPoints;
    }

    get turnPhase() {
        return this._state.turnPhase;
    }
    set turnPhase(value) {
        this._setState({ turnPhase: value });
    }

    _setState(updates) {
        const oldState = { ...this._state };
        this._state = { ...this._state, ...updates };

        Object.keys(updates).forEach((key) => {
            this.eventBus.emit(`state:${key}`, {
                key,
                oldValue: oldState[key],
                newValue: this._state[key],
            });
        });

        this.eventBus.emit('state:changed', {
            updates,
            oldState,
            newState: this._state,
        });
    }

    nextTurn() {
        this.turn = (this.turn + 1) % this.playerCount;
    }

    isPlayerTurn() {
        return this.turn === 0;
    }

    canTakeToken(playerIdx) {
        return (
            this.tokensAvailable > 0 &&
            this.tokens[playerIdx] === 0 &&
            this.hands[playerIdx].length > 1
        );
    }

    takeToken(playerIdx) {
        if (this.canTakeToken(playerIdx)) {
            const newTokens = [...this._state.tokens];
            newTokens[playerIdx]++;
            this._setState({
                tokens: newTokens,
                tokensAvailable: this._state.tokensAvailable - 1,
            });
            return true;
        }
        return false;
    }

    removeCard(playerIdx, cardId) {
        const hand = this.hands[playerIdx];
        const cardIdx = hand.findIndex((c) => c.id === cardId);
        if (cardIdx !== -1) {
            const newHands = this._state.hands.map((h, idx) =>
                idx === playerIdx ? h.filter((c) => c.id !== cardId) : h
            );
            this._setState({ hands: newHands });
            return hand[cardIdx];
        }
        return null;
    }

    hasCardsRemaining() {
        return this.hands.some((hand) => hand.length > 0);
    }

    getTotalCardsRemaining() {
        return this.hands.reduce((sum, hand) => sum + hand.length, 0);
    }

    getSnapshot() {
        return {
            ...this._state,
            hands: this._state.hands.map((h) => [...h]),
            bettings: this._state.bettings.map((b) => [...b]),
            tokens: [...this._state.tokens],
            horseOrder: [...this._state.horseOrder],
            horseIds: [...this._state.horseIds],
            rankPoints: [...this._state.rankPoints],
        };
    }
}
