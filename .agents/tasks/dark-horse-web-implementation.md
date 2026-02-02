# Dark Horse - Web Game Implementation Task

## Project Overview

**Project:** Dark Horse Browser-based Board Game  
**Platform:** Web (Browser)  
**Tech Stack:** Next.js + TypeScript  
**Play Mode:** Local multiplayer (2-6 players on same screen)  
**Goal:** Implement complete game logic and playable UI

**Note:** No test code required during development

---

## Phase 1: Project Setup & Foundation

### 1.1 Initialize Next.js Project

**Tasks:**
- [x] Initialize Next.js 14+ with TypeScript
- [x] Configure project structure
- [x] Setup Tailwind CSS (or preferred styling solution)
- [x] Create folder structure:
  ```
  src/
  ├── types/          # Type definitions
  ├── game/           # Game logic (pure functions)
  │   ├── setup.ts
  │   ├── actions.ts
  │   ├── movement.ts
  │   ├── scoring.ts
  │   └── rules.ts
  ├── components/     # React components
  ├── hooks/          # Custom React hooks
  ├── utils/          # Utility functions
  └── app/            # Next.js app directory
  ```

### 1.2 Define Core Types

**File:** `src/types/game.ts`

**Type Definitions Needed:**
- [x] `Horse` - Horse card data (number 1-7, position)
- [x] `BettingCard` - Betting card (horse number, scoring table)
- [x] `ActionCard` - Action card types and effects
  - Standard movement cards
  - Rider Fall Off card
  - Exchange Betting card
- [x] `DarkHorseToken` - Token state (+5/-3 points)
- [x] `Player` - Player data (id, betting cards, action cards, token)
- [x] `GameState` - Complete game state
  - Players array
  - Horse positions (ordered array)
  - Current player index
  - Dark horse number
  - Phase (setup, playing, scoring)
  - Turn state

**Implementation Notes:**
- ✅ Use discriminated unions for ActionCard types
- ✅ Keep types immutable (readonly where possible)
- ✅ Document scoring table structure

---

## Phase 2: Core Game Logic Implementation

### 2.1 Game Setup Logic

**File:** `src/game/setup.ts`

**Functions to Implement:**
- [x] `createActionCardDeck()` - Generate all 33 action cards
- [x] `createBettingCardDeck()` - Generate all 14 betting cards
- [x] `shuffleArray()` - Shuffle cards
- [x] `distributeBettingCards()` - Deal betting cards by player count
  - 2 players: 3 cards each
  - 3-6 players: 2 cards each
- [x] `distributeActionCards()` - Deal action cards by player count
  - 2p: 8 cards, 3p: 7 cards, 4p: 6 cards, 5p: 6 cards, 6p: 5 cards
- [x] `determineDarkHorse()` - Select 7th (last) horse as dark horse
- [x] `getDarkHorseTokenCount()` - Get token count by player count
  - 2p: 1 token, 3-4p: 2 tokens, 5-6p: 3 tokens
- [x] `initializeGame()` - Master setup function

**Edge Cases:**
- ✅ Validate player count (2-6)
- ✅ Ensure proper card distribution
- ✅ Handle remaining cards

### 2.2 Horse Placement (Starting Order)

**File:** `src/game/setup.ts`

**Functions to Implement:**
- [x] `placeHorseCard()` - Add horse to left or right end
- [x] `getAvailableHorses()` - Return unplaced horses
- [x] `isHorsePlacementComplete()` - Check if all 7 horses placed
- [x] `startGame()` - Transition from horse placement to playing phase

**Rules to Enforce:**
- Can only place at leftmost or rightmost position
- Cannot insert between existing horses
- Players take turns clockwise
- First player places first, then clockwise rotation

### 2.3 Horse Movement Logic

**File:** `src/game/movement.ts`

**Core Movement Function:**
- [x] `moveHorse(horses, horseNumber, spaces, direction)` - Main movement logic
  - Forward movement: Pass N horses, switch with Nth horse
  - Backward movement: Same logic in reverse
  - Return new horse positions array

**Helper Functions:**
- [x] `getHorsePosition()` - Find current position by horse number
- [x] `getHorseRank()` - Get rank (1st = rightmost, 7th = leftmost)
- [x] `canMoveForward()` - Check if forward movement possible
- [x] `canMoveBackward()` - Check if backward movement possible
- [x] `moveMultipleHorses()` - Move multiple horses in same direction
- [x] `executeRiderFallOff()` - Move 3rd rank horse to 7th rank

**Movement Rules:**
- Moving forward N spaces = passing N horses
- Passed horses each drop 1 rank
- Position switching: moving horse swaps with the Nth horse ahead/behind
- Edge case: 1st rank moving forward → must move backward
- Edge case: 7th rank moving backward → must move forward

**Example Implementation Notes:**
```typescript
// Initial: [7th: #6][6th: #5][5th: #4][4th: #7][3rd: #1][2nd: #3][1st: #2]
// Move #4 forward 2 spaces
// Result: [7th: #6][6th: #5][5th: #7][4th: #1][3rd: #4][2nd: #3][1st: #2]
// #4 passed #7 and #1 (2 horses), switched with #1
```

### 2.4 Action Card Execution

**File:** `src/game/actions.ts`

**Action Card Types:**
1. **Standard Movement Cards**
   - [x] Single horse movement (forward/backward N spaces)
   - [x] Multiple horse movement (2 horses, same direction)

2. **Special Cards**
   - [x] `executeExchangeBetting()` - Exchange betting card (player or opponent)

**Main Function:**
- [x] `executeActionCard(gameState, card, choices)` - Execute any action card
  - Validate card execution
  - Apply movement
  - Update game state
  - Return new game state
- [x] `playActionCard()` - Player plays card from hand

**Validation:**
- Must execute card even if disadvantageous
- Both horses must move same direction (for multi-horse cards)
- Handle edge cases (boundaries)

### 2.5 Turn Management

**File:** `src/game/rules.ts`

**Functions:**
- [x] `canTakeDarkHorseToken()` - Check if player can take token
  - Must not have token already
  - Must have 2+ cards in hand
  - Tokens must be available
- [x] `takeDarkHorseToken()` - Award token to player
- [x] `advanceTurnPhase()` - Move to next turn phase
- [x] `nextTurn()` - Advance to next player
- [x] `isGameOver()` - Check if all cards played
- [x] `endGame()` - Transition to scoring phase
- [x] `advanceHorsePlacement()` - Transition from setup to horse placement

**Turn Sequence Validation:**
1. Optional: Take dark horse token
2. Mandatory: Play action card
3. Mandatory: Execute action card

### 2.6 Scoring System

**File:** `src/game/scoring.ts`

**Scoring Table (on betting cards):**
Define point values by rank (exact values from game rules):
```typescript
const SCORING_TABLE = {
  1: X, // 1st rank
  2: X, // 2nd rank
  3: X, // 3rd rank
  4: X, // 4th rank
  5: X, // 5th rank
  6: X, // 6th rank
  7: X, // 7th rank
}
```

**Functions to Implement:**
- [x] `calculateBettingScore()` - Calculate base score from betting cards
- [x] `checkDoubleBetting()` - Detect identical betting cards
- [x] `calculateDarkHorseBonus()` - Apply dark horse token points
  - Top 3 (1st/2nd/3rd): +5 points
  - Bottom 4 (4th/5th/6th/7th): -3 points
- [x] `calculatePlayerScore()` - Calculate individual player score with all bonuses
- [x] `calculateAllScores()` - Calculate scores for all players
- [x] `determineWinner()` - Find highest score player(s)

**Edge Cases:**
- Multiple players with same score = shared victory
- Dark horse token scoring based on final rank

---

## Phase 3: UI Implementation

### 3.1 Game Setup Screen

**Components to Create:**
- [x] `GameSetup` - Complete setup screen with player count and names

### 3.2 Horse Placement Phase

**Components:**
- [x] `HorsePlacement` - Complete horse placement screen

**Features:**
- ✅ Visual indication of placement direction
- ✅ Shows available horses to place
- ✅ Current player indicator
- ✅ Dark horse reveal and token information

### 3.3 Main Game Screen

**Layout Sections:**
1. **Horse Race Track**
   - [x] `MainGame` component with complete race track
   - [x] Display all 7 horses with ranks (1st-7th)
   - [x] Dark horse highlighting

2. **Player Hand**
   - [x] Show current player's action cards
   - [x] Visual card display with icons
   - [x] Card selection interface

3. **Game Info Panel**
   - [x] Current player and turn phase display
   - [x] Available dark horse tokens
   - [x] Player status indicators

4. **Action Controls**
   - [x] Take/Skip dark horse token buttons
   - [x] Play card button
   - [x] Next turn button
   - [x] End game button

### 3.4 Card Execution Interface

**For Cards Requiring Choices:**
- [x] `DirectionSelector` - Choose forward/backward for choice cards
- [x] `PlayerSelector` - Choose opponent for Exchange Betting card
- [x] Betting card selection interface

**Visual Feedback:**
- ✅ Real-time card execution
- ✅ Clear phase transitions
- [ ] Horse movement animations (optional enhancement)

### 3.5 Scoring Screen

**Components:**
- [x] `Scoring` - Complete scoring screen with all features
  - Final race results
  - Individual player scoring breakdown
  - Betting cards revealed with ranks
  - Base scores
  - Double betting bonuses
  - Dark horse token bonuses
  - Total scores
- [x] Winner announcement
- [x] New game button

**Features:**
- ✅ Clear breakdown of scoring components
- ✅ Sorted leaderboard
- ✅ Visual distinction for winners
- [ ] Score calculation animations (optional enhancement)

### 3.6 Responsive Design

**Considerations:**
- [x] Desktop layout (primary) - Fully responsive with Tailwind CSS
- [x] Tablet support - Grid layouts adapt to screen size
- ✅ Mobile landscape mode - Horizontal scrolling for race track

**UI/UX Guidelines:**
- ✅ Clear visual hierarchy with color-coded sections
- ✅ Large touch targets for all interactive elements
- ✅ Readable text at all sizes with responsive typography
- ✅ Color-coded game phases and players
- ✅ Semantic HTML structure

---

## Phase 4: Game Flow & State Management

### 4.1 State Management

**Approach:** React Context + useReducer (or Zustand/Redux if preferred)

**State Hooks to Create:**
- [x] `GameContext` with `GameProvider` - Main game state management
- [x] `useGame()` hook - Access state and dispatch
- ✅ Reducer-based state updates for all game actions

**Actions:**
- [x] `INITIALIZE_GAME`
- [x] `PLACE_HORSE`
- [x] `DETERMINE_DARK_HORSE`
- [x] `START_GAME`
- [x] `TAKE_DARK_HORSE_TOKEN`
- [x] `SKIP_DARK_HORSE_TOKEN`
- [x] `PLAY_ACTION_CARD`
- [x] `EXECUTE_ACTION_CARD`
- [x] `NEXT_TURN`
- [x] `END_GAME`
- [x] `ADVANCE_HORSE_PLACEMENT`

### 4.2 Game Flow Control

**Screen Transitions:**
1. ✅ Setup Screen → Player count, names
2. ✅ Horse Placement → Players place horses
3. ✅ Dark Horse Reveal → Show dark horse, tokens
4. ✅ Main Game Loop → Play cards, execute actions
5. ✅ Scoring Screen → Calculate and display results

**Navigation:**
- [x] Phase-based screen routing
- [x] State-driven UI transitions
- ✅ Invalid state transitions prevented by reducer logic

### 4.3 Local Storage (Optional)

**Persistent Data:**
- [ ] Save game state to localStorage
- [ ] Resume interrupted game
- [ ] Save player preferences

---

## Implementation Notes

### Key Rules to Remember

1. **Horse Movement:**
   - Forward N = pass N horses, switch with Nth horse
   - All passed horses drop 1 rank each
   - Cannot insert, only swap positions

2. **Mandatory Actions:**
   - Must play card every turn (even if disadvantageous)
   - Must execute card effect
   - Cannot skip turn

3. **Dark Horse Token:**
   - Max 1 per player
   - Cannot take with only 1 card left in hand
   - +5 if dark horse finishes top 3
   - -3 if dark horse finishes bottom 4

4. **Scoring:**
   - Use scoring table on betting cards
   - Double bonus applies when 2 identical betting cards
   - Dark horse = 7th position horse at START of game

### Development Best Practices

- **Pure Functions:** Keep game logic in pure functions (no side effects)
- **Immutability:** Never mutate state directly, always return new state
- **Type Safety:** Use TypeScript strictly, avoid `any`
- **Component Structure:** Keep components small and focused
- **State Updates:** Batch related state updates together
- **Performance:** Use React.memo for expensive components if needed

### Reference Documents

- Game Rules: `docs/GAME_RULES.md`
- Quick Reference: `docs/QUICK_REFERENCE.md`

---

## Progress Tracking

### Current Phase: 3 - ✅ Completed (Phase 3: UI Implementation)

**Phase 1 Completed:**
1. ✅ Initialized Next.js 15.1.6 with TypeScript
2. ✅ Setup project structure
3. ✅ Configured Tailwind CSS
4. ✅ Defined core types

**Phase 2 Completed:**
1. ✅ `src/game/setup.ts` - Game initialization
2. ✅ `src/game/movement.ts` - Horse movement logic
3. ✅ `src/game/actions.ts` - Action card execution
4. ✅ `src/game/rules.ts` - Turn management
5. ✅ `src/game/scoring.ts` - Scoring system

**Phase 3 Completed:**
1. ✅ `src/contexts/GameContext.tsx` - State management with Context + useReducer
2. ✅ `src/components/GameSetup.tsx` - Player setup screen
3. ✅ `src/components/HorsePlacement.tsx` - Horse placement interface
4. ✅ `src/components/MainGame.tsx` - Complete game screen
   - Race track with horse positions
   - Action card hand and selection
   - Dark horse token management
   - Turn phase controls
   - Direction and player choice modals
5. ✅ `src/components/Scoring.tsx` - Final scoring screen
6. ✅ `src/app/page.tsx` - Main app integration

**Build Status:** ✅ Passing (verified with `npm run build`)

**Game Features:**
- ✅ 2-6 player support
- ✅ Complete turn-based gameplay
- ✅ All 4 action card types working
- ✅ Dark horse token mechanics
- ✅ Full scoring with bonuses
- ✅ Responsive design for desktop/tablet
- ✅ Real-time game state updates

**Next Steps:**
1. Optional enhancements:
   - Add animations for horse movements
   - Add sound effects
   - Implement game state persistence (localStorage)
   - Add game statistics tracking

**Last Updated:** 2026-02-02 01:00 KST

---

## Questions & Decisions Log

**Q1:** Should we implement undo/redo functionality?  
**A1:** TBD - discuss after core implementation

**Q2:** Card design - use images or pure CSS?  
**A2:** TBD - start with CSS, can add images later

**Q3:** Animation library needed?  
**A3:** TBD - can use CSS animations initially, add Framer Motion if needed

---

## Future Enhancements (Post-MVP)

- [ ] Sound effects
- [ ] Card animations
- [ ] Game history/replay
- [ ] Multiple game themes/skins
- [ ] Statistics tracking
- [ ] AI opponent mode
- [ ] Online multiplayer
- [ ] Mobile app version
