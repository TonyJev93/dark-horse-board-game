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
            gamePhase: 'betting',
            playerBettingSelection: [],
            placementTurn: 0,
            availableHorses: Array.from({ length: HORSE_COUNT }, (_, i) => i + 1),
            placedHorses: [],
            selectedHorseForPlacement: null,
            bettingDeck: []
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

    get gamePhase() {
        return this._state.gamePhase;
    }
    set gamePhase(value) {
        this._setState({ gamePhase: value });
    }

    get playerBettingSelection() {
        return this._state.playerBettingSelection;
    }
    set playerBettingSelection(value) {
        this._setState({ playerBettingSelection: value });
    }

    get placementTurn() {
        return this._state.placementTurn;
    }
    set placementTurn(value) {
        this._setState({ placementTurn: value });
    }

    get availableHorses() {
        return this._state.availableHorses;
    }
    set availableHorses(value) {
        this._setState({ availableHorses: value });
    }

    get placedHorses() {
        return this._state.placedHorses;
    }
    set placedHorses(value) {
        this._setState({ placedHorses: value });
    }

    get selectedHorseForPlacement() {
        return this._state.selectedHorseForPlacement;
    }
    set selectedHorseForPlacement(value) {
        this._setState({ selectedHorseForPlacement: value });
    }

    get bettingDeck() {
        return this._state.bettingDeck;
    }
    set bettingDeck(value) {
        this._setState({ bettingDeck: value });
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
            playerBettingSelection: [...this._state.playerBettingSelection],
        };
    }

    toggleBettingSelection(horseId) {
        const current = [...this._state.playerBettingSelection];
        const index = current.indexOf(horseId);
        
        if (index !== -1) {
            current.splice(index, 1);
        } else {
            if (current.length >= 2) {
                current.shift();
            }
            current.push(horseId);
        }
        
        this._setState({ playerBettingSelection: current });
        return current;
    }

    clearBettingSelection() {
        this._setState({ playerBettingSelection: [] });
    }

    confirmBettingSelection() {
        if (this.playerBettingSelection.length === 2) {
            this.gamePhase = 'placement';
        }
    }

    selectHorseForPlacement(horseId) {
        if (this.availableHorses.includes(horseId)) {
            this.selectedHorseForPlacement = horseId;
        }
    }

    placeHorseAt(position) {
        if (!this.selectedHorseForPlacement) return false;

        const newAvailableHorses = this.availableHorses.filter(
            id => id !== this.selectedHorseForPlacement
        );
        const newPlacedHorses = [...this.placedHorses];

        if (position === 'left') {
            newPlacedHorses.unshift(this.selectedHorseForPlacement);
        } else {
            newPlacedHorses.push(this.selectedHorseForPlacement);
        }

        this.availableHorses = newAvailableHorses;
        this.placedHorses = newPlacedHorses;
        this.selectedHorseForPlacement = null;

        if (newAvailableHorses.length === 1) {
            this.darkHorseId = newAvailableHorses[0];
            // horseOrder: [7th, 6th, 5th, 4th, 3rd, 2nd, 1st]
            // placedHorses: [leftmost(7th), ..., rightmost(1st)]
            this.horseOrder = [this.darkHorseId, ...newPlacedHorses];
            return true;
        }

        this.placementTurn = (this.placementTurn + 1) % this.playerCount;
        return false;
    }

    exchangeBettingCard(playerIdx, targetPlayerIdx, playerCardIdx, targetCardIdx) {
        const newBettings = [...this._state.bettings];
        
        const playerCard = newBettings[playerIdx][playerCardIdx];
        const targetCard = newBettings[targetPlayerIdx][targetCardIdx];
        
        newBettings[playerIdx][playerCardIdx] = targetCard;
        newBettings[targetPlayerIdx][targetCardIdx] = playerCard;
        
        this._setState({ bettings: newBettings });
        
        return { playerCard, targetCard };
    }
}
