const GameState = {
    turn: 0,
    playerCount: 4,
    horseIds: [1, 2, 3, 4, 5, 6, 7],
    horseOrder: [],
    darkHorseId: null,
    hands: [[], [], [], []],
    bettings: [[], [], [], []],
    tokensAvailable: 2,
    tokens: [0, 0, 0, 0],
    isAnimating: false,
    isGameOver: false,
    rankPoints: [0, 1, 2, 3, 5, 7, 10],
    turnPhase: 'token'
};
