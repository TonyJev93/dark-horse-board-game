# Dark Horse 3D

A 3D horse racing board game built with Three.js, featuring real-time animations, AI players, and strategic card-based gameplay.

![Dark Horse 3D](https://img.shields.io/badge/Status-Stable-brightgreen)
![Three.js](https://img.shields.io/badge/Three.js-r128-blue)
![License](https://img.shields.io/badge/License-ISC-brightgreen)

## Features

- **3D Visualization**: Real-time 3D horse racing animations using Three.js
- **Strategic Gameplay**: Card-based mechanics with betting and dark horse tokens
- **AI Players**: Three AI opponents with intelligent decision-making
- **Event-Driven Architecture**: Pub/sub event system for decoupled components
- **Modern Development**: Vite, ESLint, Prettier for optimal DX

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens http://localhost:3000 with hot module replacement (HMR).

### Build

```bash
npm run build
```

Creates optimized production build in `dist/` directory.

### Code Quality

```bash
npm run lint           # Check for lint errors
npm run lint:fix       # Auto-fix lint errors
npm run format         # Format code with Prettier
npm run preview        # Preview production build
```

## Project Structure

```
dark-horse-sample/
├── index.html              # Main HTML template
├── src/
│   ├── main.js             # Application entry point
│   ├── core/
│   │   ├── GameState.js    # Central state management (117 lines)
│   │   ├── EventBus.js     # Pub/sub event system (60 lines)
│   │   └── GameConfig.js   # Game constants (13 lines)
│   ├── game/
│   │   ├── GameEngine.js   # Game flow orchestration (178 lines)
│   │   ├── CardProcessor.js # Card effect processing (43 lines)
│   │   ├── ScoreCalculator.js # Scoring logic (47 lines)
│   │   └── GameSetup.js    # Game initialization (32 lines)
│   ├── three/
│   │   ├── SceneManager.js # 3D scene & camera management (189 lines)
│   │   └── HorseModel.js   # Horse 3D model generation (73 lines)
│   ├── ui/
│   │   └── UIManager.js    # UI rendering & interaction (218 lines)
│   └── styles/
│       ├── global.css      # Global styles
│       ├── ui-layer.css    # UI components
│       ├── player-status.css # Player status panels
│       └── result-screen.css # Game result screen
├── docs/
│   ├── GAME_RULES.md       # Official game rules
│   ├── QUICK_REFERENCE.md  # Game rules quick reference
│   └── ARCHITECTURE.md     # System architecture
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── eslint.config.js        # ESLint rules
└── .prettierrc.json        # Prettier formatting rules
```

## Architecture

### Design Patterns

- **Event-Driven**: EventBus pub/sub for loose coupling
- **State Management**: Centralized GameState with immutable updates
- **Dependency Injection**: Constructor-based dependency injection
- **Separation of Concerns**: UI, Game Logic, and 3D Rendering separated

### Module Responsibilities

| Module | Responsibility | Lines |
|--------|---|---|
| **GameState** | Centralized game state, immutable updates | 117 |
| **EventBus** | Event publishing and subscription | 60 |
| **GameEngine** | Game flow, turn management, AI orchestration | 178 |
| **SceneManager** | 3D scene setup, camera, rendering, animations | 189 |
| **UIManager** | UI rendering and event handling | 218 |
| **CardProcessor** | Pure functions for card effects | 43 |
| **ScoreCalculator** | Pure functions for scoring | 47 |

### Data Flow

```
Player Input
    ↓
UIManager (Event Handler)
    ↓
GameEngine.playCard()
    ↓
CardProcessor (Pure Function)
    ↓
GameState.setState() → Emits 'state:changed'
    ↓
┌─────────────────────────────────┐
├─ EventBus Routes Event ─────────┤
├─ SceneManager → Updates 3D      ├
├─ UIManager → Re-renders UI      ├
└─────────────────────────────────┘
    ↓
Animation Complete → game:turnChanged Event
    ↓
GameEngine.nextTurn() / AI Turn
```

## Game Rules

See [GAME_RULES.md](./docs/GAME_RULES.md) for complete rules.

**Quick Summary**:
- 4 players bet on 7 horses with numbered cards (1-7)
- Dark Horse token adds multiplier to bet score
- Win by highest total score after all rounds

## Development

### Adding New Features

1. **Add Game Logic**: Update `src/game/` modules
2. **Update UI**: Modify `src/ui/UIManager.js`
3. **Update Visuals**: Adjust `src/three/` modules
4. **Emit Events**: Use `gameState.eventBus.emit()`
5. **Format & Lint**: Run `npm run format && npm run lint:fix`

### Code Quality Standards

- Lint: `npm run lint`
- Format: `npm run format`
- No ESLint errors or warnings
- No type warnings in JSDoc

## Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| **Three.js** | r128 | 3D rendering |
| **Vite** | ^7.3.1 | Build tool & dev server |
| **ESLint** | ^9.39.2 | Code linting |
| **Prettier** | ^3.8.1 | Code formatting |
| **Tailwind CSS** | CDN | Utility-first styling |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

WebGL support required.

## License

ISC

## Contributing

1. Follow existing code patterns
2. Add JSDoc for public APIs
3. Run linting and formatting before commit
4. Reference GAME_RULES.md for rule-related changes

---

**Last Updated**: 2026-02-04  
**Version**: 1.0.0
