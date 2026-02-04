import { CARD_TYPES, TOTAL_ACTION_CARDS, CARDS_PER_PLAYER } from '../core/GameConfig.js';

export class GameSetup {
    static initializeGame(gameState) {
        gameState.horseOrder = [...gameState.horseIds].sort(() => Math.random() - 0.5);
        gameState.darkHorseId = gameState.horseOrder[0];

        for (let i = 0; i < gameState.playerCount; i++) {
            gameState.bettings[i] = [...gameState.horseIds]
                .sort(() => Math.random() - 0.5)
                .slice(0, 2);
        }

        const allActionCards = this.generateActionCards();
        for (let i = 0; i < gameState.playerCount; i++) {
            gameState.hands[i] = allActionCards.splice(0, CARDS_PER_PLAYER);
        }
    }

    static generateActionCards() {
        const allActionCards = [];
        for (let i = 0; i < TOTAL_ACTION_CARDS; i++) {
            const type = CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)];
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
        return allActionCards;
    }
}
