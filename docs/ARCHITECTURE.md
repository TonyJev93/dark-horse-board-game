# Dark Horse 3D - Architecture

## Overview

Dark Horse 3D uses an **event-driven, modular architecture** with clear separation of concerns. The system is built on three main layers:

1. **State Layer** (GameState, EventBus)
2. **Logic Layer** (GameEngine, CardProcessor, ScoreCalculator)
3. **Presentation Layer** (SceneManager, UIManager)

## Module Dependencies

```
main.js (entry point)
│
├── GameState (core state management)
│   └── EventBus (pub/sub event system)
│
├── SceneManager (3D rendering)
│   ├── THREE.js
│   └── HorseModel
│
├── GameEngine (game orchestration)
│   ├── CardProcessor
│   ├── GameSetup
│   ├── ScoreCalculator
│   └── GameState
│
└── UIManager (user interface)
    ├── GameState
    ├── GameEngine
    └── DOM (HTML elements)
```

## Core Components

### 1. State Layer

#### GameState (117 lines)
**Responsibility**: Centralized, immutable state management

```javascript
// Usage
const gameState = new GameState();
gameState.turn = 1;  // Automatically emits 'state:changed'
gameState.on('state:turn', (change) => console.log(change));
```

**Key Methods**:
- `_setState(updates)` - Immutable state updates with event emission
- Getter/Setter pairs for all state properties
- `getSnapshot()` - Freeze state for debugging
- `subscribe(key, callback)` - Subscribe to specific property changes

**Events Emitted**:
- `state:changed` - Any state property changed
- `state:{key}` - Specific property changed (e.g., `state:turn`)

---

#### EventBus (60 lines)
**Responsibility**: Pub/sub event system for component decoupling

```javascript
// Usage
const bus = new EventBus();
const unsubscribe = bus.on('game:cardPlayed', (data) => {
    console.log('Card played:', data);
});
bus.emit('game:cardPlayed', { playerIdx: 0, cardId: 5 });
unsubscribe();  // Clean removal
```

**Key Methods**:
- `on(event, callback)` - Subscribe to event (returns unsubscribe fn)
- `off(event, callback)` - Unsubscribe from event
- `emit(event, data)` - Publish event to all subscribers
- `once(event, callback)` - One-time subscription
- `clear(event)` - Remove all subscribers from event
- `listenerCount(event)` - Get subscriber count

---

### 2. Logic Layer

#### GameEngine (178 lines)
**Responsibility**: Game flow orchestration and turn management

```javascript
// Usage
const engine = new GameEngine(gameState, sceneManager, uiManager);
engine.init();  // Setup game
await engine.playCard(0, 3);  // Player 0 plays card 3
```

**Key Methods**:
- `init()` - Initialize game (setup horses, dark horse)
- `async playCard(playerIdx, cardId)` - Handle card play
- `async aiTurn()` - Execute AI player turn
- `async finish()` - End game and calculate scores
- `async nextTurn()` - Advance to next player

**Events Emitted**:
- `game:initialized` - Game setup complete
- `game:cardPlayed` - Card played by player
- `game:turnChanged` - Turn advanced to next player
- `game:finishing` - Game ending started
- `game:finished` - Game complete with final scores

---

#### CardProcessor (43 lines)
**Responsibility**: Pure functions for card effect processing

```javascript
// Usage - pure function, no side effects
const newOrder = CardProcessor.processCard(card, horseOrder, playerName);
```

**Key Methods** (all static, pure functions):
- `processCard(card, horseOrder, playerName)` - Apply card effect
- `processForwardCard(horseOrder, horseId, value)` - Move forward
- `processRiderFallOff(horseOrder)` - Rider falls, 3rd→7th
- `processObstacle(horseOrder, horseId)` - Obstacle effect
- Etc. (one per card type)

**Characteristics**:
- No side effects (no state mutation)
- Immutable input/output (spreads arrays)
- Fully testable
- Easy to verify correctness

---

#### ScoreCalculator (47 lines)
**Responsibility**: Pure functions for score calculation

```javascript
// Usage - pure function
const score = ScoreCalculator.calculateScore(
    horseOrder,
    bettingCards,
    tokens
);
```

**Key Methods** (all static, pure functions):
- `calculateScore(horseOrder, bettingCards, tokens, darkHorseId, darkHorseRank)` - Total score
- `calculateBaseScore(horseOrder, bettingCards)` - Base betting score
- `calculateDarkHorseBonus(darkHorseRank, tokenCount)` - DH bonus

**Characteristics**:
- Pure functions (deterministic)
- No external dependencies
- Implements GAME_RULES.md scoring exactly

---

### 3. Presentation Layer

#### SceneManager (189 lines)
**Responsibility**: 3D scene management, camera, rendering, animations

```javascript
// Usage
const scene = new SceneManager(document.body);
scene.init();
scene.updateHorsePositions([7, 6, 5, 4, 3, 2, 1]);
```

**Key Methods**:
- `init()` - Setup Three.js scene, camera, renderer
- `render()` - Render current frame
- `resize()` - Handle window resize
- `updateHorsePositions(horseOrder)` - Animate horses to new positions
- `addGround()` - Create track ground
- `startAnimation()` - Begin render loop
- `stopAnimation()` - Stop render loop

**Three.js Elements**:
- PerspectiveCamera - 3D viewpoint
- WebGLRenderer - GPU rendering
- Scene - 3D world
- Lights - Ambient + directional lighting
- HorseModels - 7 horse meshes (red cubes with position indices)

---

#### UIManager (218 lines)
**Responsibility**: UI rendering and user interaction

```javascript
// Usage
const ui = new UIManager(gameState, gameEngine);
ui.initialize();
// Listens to events and re-renders automatically
```

**Key Methods**:
- `initialize()` - Setup DOM event listeners
- `render()` - Update all UI displays
- `renderPlayerStatus()` - Show current player
- `renderCardArea()` - Show playable cards
- `renderRankings()` - Show live horse rankings
- `showResultScreen(scores)` - Display final scores
- `handleCardClick(cardId)` - Player card selection

**Event Listeners**:
- Listens to: `state:changed`, `game:*` events
- Updates UI in response to game events
- Emits: `game:cardPlayed` (from player clicks)

---

### 4. Configuration

#### GameConfig (13 lines)
**Responsibility**: Game constants and configuration

```javascript
export const PLAYER_COUNT = 4;
export const HORSE_COUNT = 7;
export const DARK_HORSE_TOKENS = 2;
export const RANK_POINTS = [10, 7, 5, 3, 2, 1, 0];
```

Used by GameState, GameEngine, and rule calculations.

---

## Data Flow

### 1. Game Initialization

```
main.js
  │
  ├─ new GameState()
  ├─ new SceneManager(container)
  │   └─ THREE.js setup (scene, camera, renderer)
  ├─ new GameEngine(gameState, sceneManager, uiManager)
  │   └─ setupEventListeners()
  ├─ new UIManager(gameState, gameEngine)
  │   └─ initialize() → DOM event listeners
  │
  └─ gameEngine.init()
      ├─ GameSetup.initializeGame(gameState)
      │   ├─ Random dark horse selection
      │   ├─ Initial horse order
      │   ├─ Deal cards to players
      │   └─ gameState._setState() → emit 'state:changed'
      │
      ├─ EventBus emits 'game:initialized'
      │   ├─ SceneManager updates horse positions
      │   └─ UIManager renders initial UI
      │
      └─ gameEngine.startPlayerTurn()
          └─ EventBus emits 'game:playerTurnStarted'
              └─ UIManager enables card click listeners
```

### 2. Player Card Play

```
Player clicks card
  │
  ├─ UIManager.handleCardClick(cardId)
  │   └─ emit 'game:cardPlayed'
  │
  ├─ GameEngine.playCard(playerIdx, cardId)
  │   ├─ Validate turn & phase
  │   ├─ CardProcessor.processCard(card, order)
  │   │   └─ Pure function → new horse order
  │   │
  │   ├─ gameState.horseOrder = newOrder
  │   │   └─ emit 'state:horseOrder' → new value
  │   │
  │   ├─ gameState.isAnimating = true
  │   │   └─ Disable UI during animation
  │   │
  │   └─ SceneManager animates horses (500ms)
  │       └─ gameState.isAnimating = false
  │           ├─ emit 'state:isAnimating' → false
  │           └─ emit 'animation:completed'
  │
  ├─ GameEngine hears 'animation:completed'
  │   ├─ Check if player phase complete
  │   └─ AI turn begins (if not game over)
  │
  └─ Next turn...
```

### 3. AI Turn

```
GameEngine.aiTurn()
  │
  ├─ Select best card (simple heuristic)
  ├─ Delay 1000ms (feel natural)
  │
  └─ GameEngine.playCard(aiIndex, selectedCardId)
      └─ Same as player card play (events, animation, etc.)
          │
          └─ Next AI or game over check
```

### 4. Game End

```
Round 5 complete (no cards left)
  │
  ├─ GameEngine.finish()
  │   ├─ ScoreCalculator.calculateScores()
  │   │   └─ For each player: base + DH bonus
  │   │
  │   ├─ Sort players by score
  │   ├─ gameState._setState({ isGameOver: true })
  │   │   └─ emit 'state:changed'
  │   │
  │   └─ EventBus emits 'game:finished'
  │       └─ scores array
  │
  └─ UIManager hears 'game:finished'
      └─ showResultScreen(scores)
          ├─ Display player rankings
          ├─ Show score breakdown
          └─ Show "Play Again" button
```

## Event System

### Core Events

| Event | Emitted By | Data | Listeners |
|-------|-----------|------|-----------|
| `state:changed` | GameState | `{updates, oldState, newState}` | All |
| `state:{key}` | GameState | `{oldValue, newValue}` | Specific |
| `game:initialized` | GameEngine.init() | `{darkHorseId, horseOrder}` | SceneManager, UIManager |
| `game:cardPlayed` | UIManager | `{playerIdx, cardId}` | Log |
| `game:tokenTaken` | GameEngine | `{playerIdx}` | UIManager |
| `game:turnChanged` | GameEngine | `{turn, playerIdx}` | UIManager |
| `game:finishing` | GameEngine | `{}` | UIManager (disable UI) |
| `game:finished` | GameEngine | `{scores, rankings}` | UIManager |
| `animation:completed` | SceneManager | `{}` | GameEngine |

### Benefits

✅ **Decoupling**: Components don't reference each other directly  
✅ **Testability**: Easy to mock events in tests  
✅ **Debugging**: Single source of truth for state changes  
✅ **Extensibility**: Add new listeners without changing existing code

---

## State Management

### Immutability Pattern

```javascript
// ✓ CORRECT - Immutable update
setState({ tokens: [...this.tokens, 1] });

// ✗ WRONG - Direct mutation
this.tokens.push(1);
```

All state updates:
1. Create new objects (spread operator)
2. Call `_setState()` to emit events
3. Never mutate directly

### Why Immutability?

- **Predictability**: Can't have hidden state changes
- **Debugging**: Can track all state transitions
- **Testing**: Easier to verify expected changes

---

## Performance Considerations

### Rendering

- **60 FPS target**: requestAnimationFrame loop
- **Horse animation**: 500ms tween per card play
- **UI updates**: Batched by event listeners (no re-render spam)

### Optimization Opportunities

- [ ] GPU acceleration for scene rendering
- [ ] LOD (level-of-detail) for horse models
- [ ] Lazy UI rendering (only update visible elements)
- [ ] Event batching for rapid updates

---

## Testing Strategy

### Unit Tests (Pure Functions)

```javascript
// CardProcessor - easy to test
const result = CardProcessor.processForwardCard([1,2,3,4,5,6,7], 3, 2);
expect(result).toEqual([1,2,5,4,3,6,7]);

// ScoreCalculator - easy to test
const score = ScoreCalculator.calculateBaseScore([1,2,3,4,5,6,7], [1,2]);
expect(score).toBe(17);
```

### Integration Tests

- GameEngine + GameState interactions
- Event emission and subscription
- Full game flow (setup → play → finish)

---

## File Size Summary

| File | Lines | Purpose |
|------|-------|---------|
| GameState | 117 | State management |
| EventBus | 60 | Event system |
| GameConfig | 13 | Constants |
| GameEngine | 178 | Game orchestration |
| CardProcessor | 43 | Card logic |
| GameSetup | 32 | Game initialization |
| ScoreCalculator | 47 | Scoring |
| SceneManager | 189 | 3D rendering |
| HorseModel | 73 | Horse 3D model |
| UIManager | 218 | UI rendering |
| main.js | 87 | App entry |
| CSS | 100 | Styling |
| **Total** | **1,157** | **Lines of code** |

---

## Future Improvements

### Architecture

- [ ] State persistence (localStorage)
- [ ] Replay system (save game state)
- [ ] Network multiplayer (WebSocket)

### Features

- [ ] Advanced AI (minimax algorithm)
- [ ] Player profiles & statistics
- [ ] Custom horse models
- [ ] Sound effects & music

### Quality

- [ ] TypeScript migration
- [ ] Full test coverage
- [ ] Visual regression testing
- [ ] Performance monitoring

---

**Last Updated**: 2026-02-04  
**Architect**: AI Code Assistant
