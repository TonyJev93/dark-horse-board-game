# Dark Horse 3D - 점진적 리팩토링 계획

## 현재 상태 분석

### 문제점
- **단일 파일 (790줄)**: HTML, CSS, JavaScript가 모두 `index.html`에 혼재
- **전역 상태**: `GameState` 전역 객체로 게임 상태 관리
- **긴밀한 결합**: UI 렌더링, 게임 로직, 3D 렌더링이 모두 섞여 있음
- **테스트 불가**: 모듈화되지 않아 단위 테스트 작성 불가
- **유지보수 어려움**: 특정 기능 수정 시 전체 파일 탐색 필요

### 현재 구조
```
dark-horse-sample/
├── index.html (790줄)
│   ├── HTML 구조 (UI 레이어)
│   ├── CSS 스타일
│   └── JavaScript
│       ├── GameState (전역 상태)
│       ├── Three.js 3D 렌더링
│       ├── 게임 로직
│       └── UI 렌더링
├── docs/
│   ├── GAME_RULES.md
│   └── QUICK_REFERENCE.md
└── AGENTS.md
```

---

## 리팩토링 목표

### 1차 목표: 모듈 분리 (AI 유지보수 용이성)
- 각 모듈의 **책임 명확화** (Single Responsibility)
- **의존성 최소화** (Loose Coupling)
- **테스트 가능성** (Testability)
- **문서화** (각 모듈의 역할과 API 명세)

### 2차 목표: 개발 경험 개선
- Hot Reload 지원
- TypeScript 도입 (타입 안정성)
- 빌드 시스템 (Vite)
- 린트/포맷터 설정

---

## Phase 1: 파일 분리 (최소 변경)

### 목표
기존 코드 동작을 유지하면서 물리적으로만 분리

### 작업 내용

#### 1.1. CSS 분리
```
src/
└── styles/
    ├── global.css        # body, canvas 등 전역 스타일
    ├── ui-layer.css      # UI 레이어, 카드, 메시지 박스
    ├── player-status.css # 플레이어 상태 패널
    └── result-screen.css # 게임 종료 화면
```

**작업 단계:**
1. `index.html`의 `<style>` 태그 내용 추출
2. 의미별로 4개 CSS 파일로 분리
3. `index.html`에서 `<link>` 태그로 로드
4. 브라우저에서 동작 확인

#### 1.2. JavaScript 분리 (모듈화 없이 파일만 분리)
```
src/
└── js/
    ├── game-state.js      # GameState 객체 정의
    ├── three-setup.js     # Three.js 씬, 카메라, 렌더러 초기화
    ├── horse-model.js     # 말 3D 모델 생성 함수
    ├── game-logic.js      # 게임 로직 (카드 처리, 턴 관리)
    ├── ui-renderer.js     # UI 렌더링 (renderUI 함수)
    ├── animation.js       # Three.js 애니메이션 루프
    └── main.js            # 초기화 및 이벤트 리스너
```

**작업 단계:**
1. 함수 단위로 코드 추출
2. 각 파일을 `<script>` 태그로 순서대로 로드
3. 전역 변수/함수 의존성 유지 (아직 모듈화 안 함)
4. 브라우저에서 동작 확인

#### 1.3. HTML 템플릿 정리
- `index.html`을 깔끔한 구조로 정리
- 주석으로 섹션 구분
- 외부 CSS/JS 링크 추가

**예상 결과:**
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dark Horse 3D</title>
    
    <!-- External Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Styles -->
    <link rel="stylesheet" href="src/styles/global.css">
    <link rel="stylesheet" href="src/styles/ui-layer.css">
    <link rel="stylesheet" href="src/styles/player-status.css">
    <link rel="stylesheet" href="src/styles/result-screen.css">
</head>
<body>
    <!-- UI Layer (기존 구조 유지) -->
    <div id="ui-layer">...</div>
    
    <!-- Scripts -->
    <script src="src/js/game-state.js"></script>
    <script src="src/js/three-setup.js"></script>
    <script src="src/js/horse-model.js"></script>
    <script src="src/js/game-logic.js"></script>
    <script src="src/js/ui-renderer.js"></script>
    <script src="src/js/animation.js"></script>
    <script src="src/js/main.js"></script>
</body>
</html>
```

**검증:**
- [ ] 게임 시작 정상 동작
- [ ] 카드 플레이 정상 동작
- [ ] 토큰 획득 정상 동작
- [ ] AI 턴 정상 동작
- [ ] 게임 종료 및 결과 화면 표시

---

## Phase 2: ES6 모듈화

### 목표
전역 네임스페이스 오염 제거, 의존성 명확화

### 작업 내용

#### 2.1. 모듈 구조 설계
```
src/
├── core/
│   ├── GameState.js         # 게임 상태 관리 클래스
│   └── GameConfig.js        # 게임 설정 상수
├── three/
│   ├── SceneManager.js      # Three.js 씬 관리
│   ├── HorseModel.js        # 말 3D 모델
│   ├── TrackBuilder.js      # 트랙 생성
│   └── AnimationController.js # 애니메이션 제어
├── game/
│   ├── GameEngine.js        # 게임 엔진 (턴 관리, 카드 처리)
│   ├── CardProcessor.js     # 카드 효과 처리
│   ├── AIPlayer.js          # AI 로직
│   └── ScoreCalculator.js   # 점수 계산
├── ui/
│   ├── UIManager.js         # UI 전체 관리
│   ├── PlayerPanel.js       # 플레이어 패널
│   ├── RankingPanel.js      # 순위 패널
│   ├── CardArea.js          # 카드 영역
│   └── ResultScreen.js      # 결과 화면
└── main.js                  # 애플리케이션 진입점
```

#### 2.2. 클래스 기반 리팩토링

**GameState → GameState 클래스**
```javascript
// Before (전역 객체)
const GameState = {
    turn: 0,
    playerCount: 4,
    // ...
};

// After (클래스)
export class GameState {
    constructor(playerCount = 4) {
        this.turn = 0;
        this.playerCount = playerCount;
        // ...
    }
    
    nextTurn() { /* ... */ }
    isPlayerTurn() { return this.turn === 0; }
    // ...
}
```

**SceneManager 클래스**
```javascript
export class SceneManager {
    constructor(container) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(...);
        this.renderer = new THREE.WebGLRenderer(...);
        // ...
    }
    
    init() { /* 초기화 */ }
    render() { /* 렌더링 */ }
    resize() { /* 리사이즈 */ }
}
```

#### 2.3. 의존성 주입
- 각 모듈이 필요한 의존성을 생성자로 받음
- 전역 변수 대신 명시적 참조

**예시:**
```javascript
// main.js
import { GameState } from './core/GameState.js';
import { SceneManager } from './three/SceneManager.js';
import { GameEngine } from './game/GameEngine.js';
import { UIManager } from './ui/UIManager.js';

const gameState = new GameState(4);
const sceneManager = new SceneManager(document.body);
const gameEngine = new GameEngine(gameState, sceneManager);
const uiManager = new UIManager(gameState, gameEngine);

gameEngine.start();
```

**검증:**
- [ ] 모듈 import/export 정상 동작
- [ ] 전역 변수 없음 확인
- [ ] 기존 기능 모두 정상 동작

---

## Phase 3: 아키텍처 개선

### 목표
책임 분리, 테스트 가능성 향상

### 3.1. 이벤트 시스템 도입

**문제:**
- 현재: 게임 로직이 직접 UI 업데이트 (`renderUI()` 호출)
- UI와 게임 로직이 강하게 결합

**해결:**
```javascript
// EventBus.js
export class EventBus {
    constructor() {
        this.listeners = {};
    }
    
    on(event, callback) { /* ... */ }
    emit(event, data) { /* ... */ }
    off(event, callback) { /* ... */ }
}

// 사용 예시
// GameEngine.js
this.eventBus.emit('turnChanged', { turn: this.gameState.turn });

// UIManager.js
this.eventBus.on('turnChanged', (data) => {
    this.updateTurnIndicator(data.turn);
});
```

### 3.2. 상태 관리 개선

**현재 문제:**
- `GameState` 객체를 여러 곳에서 직접 수정
- 상태 변경 추적 어려움

**개선 방안:**
```javascript
export class GameState {
    constructor() {
        this._state = { /* ... */ };
        this.listeners = [];
    }
    
    getState() {
        return { ...this._state }; // 불변성
    }
    
    setState(updates) {
        this._state = { ...this._state, ...updates };
        this.notifyListeners();
    }
    
    subscribe(listener) {
        this.listeners.push(listener);
    }
}
```

### 3.3. 게임 로직 순수 함수화

**카드 처리 로직 분리:**
```javascript
// CardProcessor.js
export class CardProcessor {
    // 순수 함수: 입력 -> 출력, 부작용 없음
    static processForwardCard(horseOrder, horseId, value) {
        const newOrder = [...horseOrder];
        // 로직 처리
        return newOrder;
    }
    
    static processRiderFallOff(horseOrder) {
        const newOrder = [...horseOrder];
        const thirdRankHorse = newOrder[4];
        newOrder.splice(4, 1);
        newOrder.unshift(thirdRankHorse);
        return newOrder;
    }
}
```

**테스트 용이성:**
```javascript
// CardProcessor.test.js
test('Rider fall off moves 3rd rank to 7th', () => {
    const order = [6, 5, 4, 7, 1, 3, 2]; // 7th -> 1st
    const result = CardProcessor.processRiderFallOff(order);
    expect(result).toEqual([1, 6, 5, 4, 7, 3, 2]);
});
```

---

## Phase 4: 개발 환경 구축

### 목표
현대적인 프론트엔드 개발 환경

### 4.1. Vite 설정

**설치:**
```bash
npm init -y
npm install --save-dev vite
```

**vite.config.js:**
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: './index.html'
            }
        }
    },
    server: {
        port: 3000,
        open: true
    }
});
```

**package.json scripts:**
```json
{
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
    }
}
```

### 4.2. TypeScript 도입 (선택)

**장점:**
- 타입 안정성
- IDE 자동완성 향상
- 리팩토링 안전성

**tsconfig.json:**
```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "ESNext",
        "lib": ["ES2020", "DOM"],
        "moduleResolution": "node",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "types": ["three"]
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules"]
}
```

### 4.3. 린트/포맷터 설정

**ESLint + Prettier:**
```bash
npm install --save-dev eslint prettier
npx eslint --init
```

**.eslintrc.json:**
```json
{
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "no-unused-vars": "warn",
        "no-console": "off"
    }
}
```

---

## Phase 5: 테스트 구축

### 5.1. 유닛 테스트 (Vitest)

**설치:**
```bash
npm install --save-dev vitest
```

**테스트 구조:**
```
tests/
├── unit/
│   ├── GameState.test.js
│   ├── CardProcessor.test.js
│   └── ScoreCalculator.test.js
└── integration/
    └── GameEngine.test.js
```

**예시 테스트:**
```javascript
// tests/unit/ScoreCalculator.test.js
import { describe, it, expect } from 'vitest';
import { ScoreCalculator } from '../../src/game/ScoreCalculator';

describe('ScoreCalculator', () => {
    it('calculates base score correctly', () => {
        const horseOrder = [7, 6, 5, 4, 3, 2, 1];
        const bettingCards = [1, 2]; // 1st and 2nd place
        const score = ScoreCalculator.calculateBaseScore(horseOrder, bettingCards);
        expect(score).toBe(17); // 10 + 7
    });
    
    it('applies double bonus for identical cards', () => {
        const horseOrder = [7, 6, 5, 4, 3, 2, 1];
        const bettingCards = [1, 1]; // Two same cards
        const score = ScoreCalculator.calculateBaseScore(horseOrder, bettingCards);
        expect(score).toBe(20); // 10 * 2
    });
    
    it('calculates dark horse bonus correctly', () => {
        const darkHorseRank = 1; // 1st place
        const tokenCount = 1;
        const bonus = ScoreCalculator.calculateDarkHorseBonus(darkHorseRank, tokenCount);
        expect(bonus).toBe(5);
    });
});
```

### 5.2. E2E 테스트 (Playwright - 선택)

**전체 게임 플로우 테스트:**
```javascript
// tests/e2e/game-flow.test.js
test('complete game flow', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 게임 시작 확인
    await expect(page.locator('#player-status')).toBeVisible();
    
    // 카드 플레이
    await page.locator('.card').first().click();
    
    // AI 턴 대기
    await page.waitForTimeout(2000);
    
    // 게임 종료까지 진행
    // ...
});
```

---

## Phase 6: 문서화 및 주석

### 6.1. JSDoc 주석 추가

**각 모듈에 API 문서 작성:**
```javascript
/**
 * Processes a forward movement card
 * @param {number[]} horseOrder - Current horse ranking (7th to 1st)
 * @param {number} horseId - Horse ID to move (1-7)
 * @param {number} value - Number of spaces to move (1 or 2)
 * @returns {number[]} New horse ranking after movement
 * @throws {Error} If horseId is invalid
 */
export function processForwardCard(horseOrder, horseId, value) {
    // ...
}
```

### 6.2. README 업데이트

**프로젝트 구조 문서화:**
```markdown
# Dark Horse 3D

## Project Structure
- `src/core/` - Game state and configuration
- `src/three/` - 3D rendering (Three.js)
- `src/game/` - Game logic and AI
- `src/ui/` - UI components and rendering

## Development
\`\`\`bash
npm install
npm run dev
\`\`\`

## Testing
\`\`\`bash
npm test
\`\`\`
```

### 6.3. 아키텍처 다이어그램

**ARCHITECTURE.md 생성:**
```markdown
# Architecture

## Module Dependencies

```
main.js
├── GameState
├── SceneManager
│   ├── HorseModel
│   └── TrackBuilder
├── GameEngine
│   ├── CardProcessor
│   ├── AIPlayer
│   └── ScoreCalculator
└── UIManager
    ├── PlayerPanel
    ├── RankingPanel
    ├── CardArea
    └── ResultScreen
```

## Data Flow
1. User clicks card → GameEngine.playCard()
2. GameEngine updates GameState
3. GameEngine emits 'stateChanged' event
4. UIManager listens and re-renders
5. SceneManager updates 3D positions
```

---

## 작업 우선순위

### 필수 (Phase 1-3)
1. **Phase 1**: 파일 분리 (CSS, JS)
2. **Phase 2**: ES6 모듈화
3. **Phase 3**: 아키텍처 개선 (이벤트 시스템, 순수 함수)

### 권장 (Phase 4-5)
4. **Phase 4**: Vite 설정 (개발 서버, HMR)
5. **Phase 5**: 테스트 구축 (최소한 핵심 로직 테스트)

### 선택 (Phase 6)
6. **Phase 6**: TypeScript, E2E 테스트, 문서화

---

## 각 Phase 완료 기준

### Phase 1
- [ ] CSS 4개 파일로 분리, 브라우저에서 정상 로드
- [ ] JS 7개 파일로 분리, 브라우저에서 정상 동작
- [ ] 기존 모든 기능 정상 작동 (수동 테스트)

### Phase 2
- [ ] 모든 JS 파일이 ES6 모듈로 변환
- [ ] `type="module"` 사용, import/export 정상 동작
- [ ] 전역 변수 제거 (console에서 확인)
- [ ] 기존 모든 기능 정상 작동

### Phase 3
- [ ] EventBus 구현 및 적용
- [ ] 게임 로직 순수 함수화
- [ ] UI와 게임 로직 분리 완료
- [ ] 코드 리뷰 통과

### Phase 4
- [ ] `npm run dev` 실행 시 개발 서버 구동
- [ ] Hot Reload 동작 확인
- [ ] `npm run build` 성공
- [ ] 빌드된 결과물 정상 동작

### Phase 5
- [ ] 핵심 로직 유닛 테스트 작성 (최소 80% 커버리지)
- [ ] `npm test` 모든 테스트 통과
- [ ] CI/CD 파이프라인 설정 (선택)

### Phase 6
- [ ] 모든 public API에 JSDoc 주석
- [ ] README.md 업데이트
- [ ] ARCHITECTURE.md 작성

---

## 예상 소요 시간

- **Phase 1**: 2-3시간
- **Phase 2**: 3-4시간
- **Phase 3**: 4-6시간
- **Phase 4**: 1-2시간
- **Phase 5**: 4-6시간
- **Phase 6**: 2-3시간

**총 예상 시간**: 16-24시간

---

## 리스크 및 주의사항

### 1. 동작 검증
- 각 Phase 완료 후 **반드시** 수동 테스트
- 게임 전체 플로우 (시작 → 카드 플레이 → AI 턴 → 종료) 확인
- 엣지 케이스 테스트 (토큰 획득, Rider Fall Off 등)

### 2. Git 커밋 전략
- 각 Phase별로 브랜치 생성
- Phase 완료 및 검증 후 메인 브랜치에 머지
- 롤백 가능하도록 커밋 단위 최소화

### 3. 호환성
- Three.js r128 버전 고정 (CDN 버전과 일치)
- Tailwind CSS CDN 유지 또는 npm 설치 선택

### 4. AI 유지보수 시 주의사항
- 각 모듈의 책임 명확히 문서화
- 함수명/클래스명은 명확하고 설명적으로
- 복잡한 로직에는 주석 필수
- GAME_RULES.md 참조 주석 유지

---

## 다음 단계

1. **Phase 1 시작 전 확인**
   - [ ] 현재 `index.html` 백업
   - [ ] Git 커밋 (리팩토링 시작 전 상태 저장)
   - [ ] 브라우저 개발자 도구에서 현재 동작 확인

2. **Phase 1 작업 시작**
   - CSS 분리부터 시작 (가장 안전)
   - 각 파일 분리 후 즉시 동작 확인
   - 문제 발생 시 즉시 롤백 및 재시도

---

## 참고 자료

- [Three.js Documentation](https://threejs.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Documentation](https://vitest.dev/)
- [ESLint Rules](https://eslint.org/docs/rules/)

---

**문서 버전**: 1.0  
**작성일**: 2026-02-04  
**최종 수정일**: 2026-02-04
