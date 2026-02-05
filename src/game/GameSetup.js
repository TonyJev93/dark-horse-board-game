import { CARD_TYPES, TOTAL_ACTION_CARDS, CARDS_PER_PLAYER } from '../core/GameConfig.js';

export class GameSetup {
    static initializeGame(gameState, playerBetting = null) {
        gameState.horseOrder = [...gameState.horseIds].sort(() => Math.random() - 0.5);
        gameState.darkHorseId = gameState.horseOrder[0];

        if (playerBetting && playerBetting.length === 2) {
            gameState.bettings[0] = [...playerBetting];
        } else {
            gameState.bettings[0] = this.selectRandomHorses(2, gameState.horseIds);
        }

        for (let i = 1; i < gameState.playerCount; i++) {
            gameState.bettings[i] = this.selectRandomHorses(2, gameState.horseIds);
        }

        const allActionCards = this.generateActionCards();
        for (let i = 0; i < gameState.playerCount; i++) {
            gameState.hands[i] = allActionCards.splice(0, CARDS_PER_PLAYER);
        }
    }

    static selectRandomHorses(count, horseIds) {
        return [...horseIds].sort(() => Math.random() - 0.5).slice(0, count);
    }

    static generateActionCards() {
        const allActionCards = [];
        for (let i = 0; i < TOTAL_ACTION_CARDS; i++) {
            const type = CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)];
            
            if (type === 'multi_move') {
                const value = Math.floor(Math.random() * 2) + 1;
                const targets = this.selectRandomHorses(2, [1, 2, 3, 4, 5, 6, 7]);
                const direction = Math.random() > 0.5 ? 'forward' : 'backward';
                allActionCards.push({ id: i, type, value, targets, direction });
            } else {
                const value =
                    type === 'forward' || type === 'backward' || type === 'plus_minus'
                        ? Math.floor(Math.random() * 2) + 1
                        : null;
                const target =
                    type === 'rider_fall_off'
                        ? null
                        : Math.floor(Math.random() * 7) + 1;
                allActionCards.push({ id: i, type, value, target });
            }
        }
        return allActionCards;
    }
}
