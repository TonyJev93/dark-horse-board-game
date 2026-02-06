import {
    ARROW_COLOR_BLACK,
    ARROW_COLOR_RED,
    SCENE_BACKGROUND_COLOR,
    SCENE_AMBIENT_LIGHT_COLOR,
    SCENE_SUN_LIGHT_COLOR,
    MEADOW_COLOR,
    TRACK_COLOR,
    LINE_COLOR,
} from '../core/GameConfig.js';

/**
 * Manages Three.js 3D scene, camera, and rendering
 * Handles horse animations and scene updates
 *
 * @class SceneManager
 */
export class SceneManager {
    /**
     * Initialize scene manager
     * @param {HTMLElement} container - DOM container for WebGL renderer
     */
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.horses = {};
    }

    /**
     * Setup Three.js scene, camera, and renderer
     */
    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(SCENE_BACKGROUND_COLOR);
        this.scene.fog = new THREE.Fog(SCENE_BACKGROUND_COLOR, 30, 150);

        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(35, 25, 40);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        this.setupLights();
        this.createTrack();
        this.setupInteraction();
    }

    setupLights() {
        this.scene.add(new THREE.AmbientLight(SCENE_AMBIENT_LIGHT_COLOR, 0.8));
        const sunLight = new THREE.DirectionalLight(SCENE_SUN_LIGHT_COLOR, 1.2);
        sunLight.position.set(20, 50, 20);
        sunLight.castShadow = true;
        sunLight.shadow.camera.left = -60;
        sunLight.shadow.camera.right = 60;
        sunLight.shadow.camera.top = 60;
        sunLight.shadow.camera.bottom = -60;
        this.scene.add(sunLight);
    }

    createTrack() {
        const meadowGeo = new THREE.PlaneGeometry(1000, 1000);
        const meadowMat = new THREE.MeshStandardMaterial({ color: MEADOW_COLOR });
        const meadow = new THREE.Mesh(meadowGeo, meadowMat);
        meadow.rotation.x = -Math.PI / 2;
        meadow.receiveShadow = true;
        this.scene.add(meadow);

        const trackWidth = 40;
        const trackLength = 200;
        const trackGeo = new THREE.PlaneGeometry(trackWidth, trackLength);
        const trackMat = new THREE.MeshStandardMaterial({ color: TRACK_COLOR, roughness: 0.9 });
        const track = new THREE.Mesh(trackGeo, trackMat);
        track.rotation.x = -Math.PI / 2;
        track.position.y = 0.02;
        track.receiveShadow = true;
        this.scene.add(track);

        const laneCount = 7;
        const laneWidth = trackWidth / laneCount;
        for (let i = 0; i <= laneCount; i++) {
            const lineGeo = new THREE.PlaneGeometry(0.2, trackLength);
            const lineMat = new THREE.MeshBasicMaterial({ color: LINE_COLOR });
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(-trackWidth / 2 + i * laneWidth, 0.03, 0);
            this.scene.add(line);

            if (i < laneCount) {
                const canvas = document.createElement('canvas');
                canvas.width = 128;
                canvas.height = 128;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.font = 'bold 80px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(i + 1, 64, 64);

                const tex = new THREE.CanvasTexture(canvas);
                const numMat = new THREE.MeshBasicMaterial({
                    map: tex,
                    transparent: true,
                    opacity: 0.8,
                });
                const numGeo = new THREE.PlaneGeometry(2.5, 2.5);
                const numMesh = new THREE.Mesh(numGeo, numMat);
                numMesh.rotation.x = -Math.PI / 2;
                numMesh.position.set(-trackWidth / 2 + i * laneWidth + laneWidth / 2, 0.04, 30);
                this.scene.add(numMesh);
            }
        }
    }

    setupInteraction() {
        let isMouseDown = false;
        let prevMouseX = 0;

        document.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'CANVAS') {
                isMouseDown = true;
                prevMouseX = e.clientX;
            }
        });

        document.addEventListener('mouseup', () => (isMouseDown = false));

        document.addEventListener('mousemove', (e) => {
            if (isMouseDown) {
                const deltaX = e.clientX - prevMouseX;
                this.camera.position.x += deltaX * 0.08;
                this.camera.lookAt(0, 0, 0);
                prevMouseX = e.clientX;
            }
        });
    }

    addHorse(id, horseModel) {
        this.horses[id] = horseModel;
        this.scene.add(horseModel);
    }

    updateHorsePositions(horseOrder, immediate = false) {
        horseOrder.forEach((id, rank) => {
            const horse = this.horses[id];
            if (!horse) return;

            const targetZ = 25 - rank * 8;
            const targetX = -20 + (id - 0.5) * (40 / 7);
            if (immediate) {
                horse.position.set(targetX, 0, targetZ);
            } else {
                horse.userData.targetPos = new THREE.Vector3(targetX, 0, targetZ);
            }
        });
    }

    animateHorses(time) {
        Object.values(this.horses).forEach((horse) => {
            const { legs, targetPos } = horse.userData;

            horse.children.forEach((child) => {
                if (child.userData.isArrowIndicator) {
                    child.rotation.y = Math.sin(time * 2) * 0.3;
                }
            });

            if (targetPos) {
                horse.position.lerp(targetPos, 0.05);
                const distZ = Math.abs(horse.position.z - targetPos.z);

                if (distZ > 0.1) {
                    horse.position.y = Math.abs(Math.sin(time * 2.5)) * 0.8;
                    horse.rotation.x = Math.sin(time * 2.5) * 0.1;
                    legs[0].rotation.x = Math.sin(time * 3.5) * 0.6;
                    legs[1].rotation.x = Math.sin(time * 3.5) * 0.6;
                    legs[2].rotation.x = Math.cos(time * 3.5) * 0.6;
                    legs[3].rotation.x = Math.cos(time * 3.5) * 0.6;
                } else {
                    horse.position.y = THREE.MathUtils.lerp(horse.position.y, 0, 0.1);
                    horse.rotation.x = THREE.MathUtils.lerp(horse.rotation.x, 0, 0.1);
                    legs.forEach(
                        (l) => (l.rotation.x = THREE.MathUtils.lerp(l.rotation.x, 0, 0.1))
                    );
                }
            }
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animateCamera(targetHorseId, onComplete) {
        const winnerHorse = this.horses[targetHorseId];
        const targetCamPos = new THREE.Vector3(
            winnerHorse.position.x + 5,
            8,
            winnerHorse.position.z + 12
        );

        let frame = 0;
        const animate = () => {
            if (frame < 120) {
                this.camera.position.lerp(targetCamPos, 0.05);
                this.camera.lookAt(winnerHorse.position);
                frame++;
                requestAnimationFrame(animate);
            } else if (onComplete) {
                onComplete();
            }
        };
        animate();
    }

    updateArrowColorToBlack(horseId) {
        const horse = this.horses[horseId];
        if (!horse) return;

        horse.children.forEach((child) => {
            if (child.userData.isArrowIndicator && child.userData.arrowMesh) {
                const arrowMesh = child.userData.arrowMesh;
                if (arrowMesh.material) {
                    arrowMesh.material.color.setHex(ARROW_COLOR_BLACK);
                    arrowMesh.material.transparent = false;
                    arrowMesh.material.opacity = 1.0;
                }
            }
        });
    }

    updateBettingArrows(bettings, hasToken, darkHorseId) {
        const myBettings = bettings[0];

        Object.values(this.horses).forEach((horse) => {
            const horseId = horse.userData.id;
            const isMyHorse = myBettings.includes(horseId);
            const isDarkHorse = horseId === darkHorseId;

            horse.children.forEach((child) => {
                if (child.userData.isArrowIndicator && child.userData.arrowMesh) {
                    const arrowMesh = child.userData.arrowMesh;
                    if (arrowMesh.material) {
                        if (hasToken && isMyHorse) {
                            arrowMesh.material.color.setHex(ARROW_COLOR_BLACK);
                            arrowMesh.material.transparent = false;
                            arrowMesh.material.opacity = 1.0;
                        } else if (isMyHorse) {
                            arrowMesh.material.color.setHex(ARROW_COLOR_RED);
                            arrowMesh.material.transparent = false;
                            arrowMesh.material.opacity = 1.0;
                        } else if (isDarkHorse) {
                            arrowMesh.material.color.setHex(ARROW_COLOR_BLACK);
                            arrowMesh.material.transparent = true;
                            arrowMesh.material.opacity = 0.3;
                        }
                    }
                }
            });
        });
    }
}
