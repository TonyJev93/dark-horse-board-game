/**
 * Pure functions for processing card effects on horse order
 * All methods are immutable and return new arrays
 *
 * @class CardProcessor
 */
export class CardProcessor {
    /**
     * Process a card and return new horse order
     * @param {Object} card - Card object with type and optional value/target
     * @param {number[]} horseOrder - Current horse ranking (7th to 1st)
     * @param {string} playerName - Player name for message generation
     * @returns {{newOrder: number[], message: string}} New order and event message
     */
    static processCard(card, horseOrder, playerName) {
        const newOrder = [...horseOrder];
        let message = '';
        const horseId = card.target || horseOrder[Math.floor(Math.random() * 7)];
        const currentRank = newOrder.indexOf(horseId);

        if (card.type === 'rider_fall_off') {
            const thirdRankHorse = newOrder[4];
            newOrder.splice(4, 1);
            newOrder.unshift(thirdRankHorse);
            message = `${playerName}: 3등 말 ${thirdRankHorse}번 낙마!`;
        } else if (card.type === 'forward') {
            let moveValue = card.value || 1;
            if (currentRank === 6) {
                moveValue = -moveValue;
                message = `${playerName}: ${horseId}번 말 1등이라 후진!`;
            } else {
                message = `${playerName}: ${horseId}번 말 가속!`;
            }
            const newRank = Math.max(0, Math.min(6, currentRank + moveValue));
            newOrder.splice(currentRank, 1);
            newOrder.splice(newRank, 0, horseId);
        } else if (card.type === 'backward') {
            let moveValue = card.value || 1;
            if (currentRank === 0) {
                moveValue = -moveValue;
                message = `${playerName}: ${horseId}번 말 꼴찌라 전진!`;
            } else {
                message = `${playerName}: ${horseId}번 말 주춤...`;
            }
            const newRank = Math.max(0, Math.min(6, currentRank - moveValue));
            newOrder.splice(currentRank, 1);
            newOrder.splice(newRank, 0, horseId);
        } else if (card.type === 'plus_minus') {
            const moveValue = card.value || 1;
            let direction = card.direction || 'forward'; // default to forward
            
            // Apply rank-based restrictions
            if (currentRank === 6) { // 1st place
                direction = 'backward';
                message = `${playerName}: ${horseId}번 말 1등이라 후진만 가능!`;
            } else if (currentRank === 0) { // 7th place (last)
                direction = 'forward';
                message = `${playerName}: ${horseId}번 말 꼴찌라 전진만 가능!`;
            } else {
                message = `${playerName}: ${horseId}번 말 ${direction === 'forward' ? '전진' : '후진'}!`;
            }
            
            const actualMoveValue = direction === 'forward' ? moveValue : -moveValue;
            let newRank = currentRank + actualMoveValue;
            
            // Apply boundary limits
            newRank = Math.max(0, Math.min(6, newRank));
            
            newOrder.splice(currentRank, 1);
            newOrder.splice(newRank, 0, horseId);
        }

        return { newOrder, message };
    }
}
