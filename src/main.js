import { GameState } from './core/GameState.js';
import { SceneManager } from './three/SceneManager.js';
import { HorseModel } from './three/HorseModel.js';
import { GameEngine } from './game/GameEngine.js';
import { UIManager } from './ui/UIManager.js';

class DarkHorseGame {
    constructor() {
        this.gameState = new GameState();
        this.sceneManager = new SceneManager(document.body);
        this.uiManager = null;
        this.gameEngine = null;
        this.animationId = null;
    }

    init() {
        this.sceneManager.init();

        this.uiManager = new UIManager(this.gameState, null);
        this.gameEngine = new GameEngine(this.gameState, this.sceneManager, this.uiManager);
        this.uiManager.gameEngine = this.gameEngine;

        this.setupEventListeners();
        this.startAnimationLoop();
        this.setupWindowResize();

        this.gameEngine.init();
    }

    createHorses() {
        const hasToken = this.gameState.tokens[0] > 0;
        this.gameState.horseIds.forEach((id) => {
            const isMyHorse = this.gameState.bettings[0].includes(id);
            const isDarkHorse = id === this.gameState.darkHorseId;
            const horse = HorseModel.createHorse(id, isMyHorse, isDarkHorse, hasToken);
            this.sceneManager.addHorse(id, horse);
        });

        this.sceneManager.updateHorsePositions(this.gameState.horseOrder, true);
    }

    setupEventListeners() {
        const btnGetToken = document.getElementById('btn-get-token');
        const btnSkipToken = document.getElementById('btn-skip-token');
        const modalGetToken = document.getElementById('modal-get-token');
        const modalSkipToken = document.getElementById('modal-skip-token');
        const restartBtn = document.getElementById('restart-game-btn');

        if (btnGetToken) {
            btnGetToken.onclick = () => this.gameEngine.takeDarkHorseToken(0);
        }
        if (btnSkipToken) {
            btnSkipToken.onclick = () => this.gameEngine.skipToken(0);
        }
        if (modalGetToken) {
            modalGetToken.onclick = () => this.gameEngine.takeDarkHorseToken(0);
        }
        if (modalSkipToken) {
            modalSkipToken.onclick = () => this.gameEngine.skipToken(0);
        }
        if (restartBtn) {
            restartBtn.onclick = () => location.reload();
        }

        this.gameState.eventBus.on('game:initialized', () => {
            this.createHorses();
            this.uiManager.render();
        });

        this.gameState.eventBus.on('game:tokenTaken', ({ isPlayer }) => {
            if (isPlayer) {
                const darkHorseId = this.gameState.darkHorseId;
                this.sceneManager.updateArrowColorToBlack(darkHorseId);
            }
        });
    }

    startAnimationLoop() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            const time = Date.now() * 0.005;
            this.sceneManager.animateHorses(time);
            this.sceneManager.render();
        };
        animate();
    }

    setupWindowResize() {
        window.addEventListener('resize', () => {
            this.sceneManager.resize();
        });
    }
}

window.addEventListener('load', () => {
    window.game = new DarkHorseGame();
    window.game.init();
});
