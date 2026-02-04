/**
 * Pure functions for calculating final game scores
 * Implements scoring rules from GAME_RULES.md
 *
 * @class ScoreCalculator
 */
export class ScoreCalculator {
    /**
     * Calculate final scores for all players
     * @param {GameState} gameState - Current game state
     * @returns {Array<{playerIdx: number, score: number, details: string}>} Player scores
     */
    static calculateScores(gameState) {
        const results = [];
        const dhInTop3 = gameState.horseOrder.slice(4).includes(gameState.darkHorseId);

        for (let i = 0; i < gameState.playerCount; i++) {
            let score = 0;
            let bettingInfo = '';

            const bettingCounts = {};
            gameState.bettings[i].forEach((id) => {
                bettingCounts[id] = (bettingCounts[id] || 0) + 1;
            });

            gameState.bettings[i].forEach((id) => {
                const rankIdx = gameState.horseOrder.indexOf(id);
                const pts = gameState.rankPoints[rankIdx];

                if (bettingCounts[id] === 2) {
                    if (!bettingInfo.includes(`${id}번`)) {
                        const doublePoints = pts * 2;
                        score += doublePoints;
                        bettingInfo += ` ${id}번×2(${doublePoints}점)`;
                    }
                } else {
                    score += pts;
                    bettingInfo += ` ${id}번(${pts}점)`;
                }
            });

            const tokenCount = gameState.tokens[i];
            const tokenBonus = dhInTop3 ? tokenCount * 5 : tokenCount * -3;
            score += tokenBonus;

            results.push({
                name: i === 0 ? 'Player (나)' : `AI 플레이어 ${i}`,
                score,
                tokenBonus,
                bettingInfo,
                isPlayer: i === 0,
            });
        }

        results.sort((a, b) => b.score - a.score);
        return results;
    }
}
