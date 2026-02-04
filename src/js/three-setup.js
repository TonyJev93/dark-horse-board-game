let scene, camera, renderer;

function setupThreeJS() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x507d2a);
    scene.fog = new THREE.Fog(0x507d2a, 30, 150);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(35, 25, 40);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sunLight.position.set(20, 50, 20);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    scene.add(sunLight);

    const meadowGeo = new THREE.PlaneGeometry(1000, 1000);
    const meadowMat = new THREE.MeshStandardMaterial({ color: 0x416e23 });
    const meadow = new THREE.Mesh(meadowGeo, meadowMat);
    meadow.rotation.x = -Math.PI / 2;
    meadow.receiveShadow = true;
    scene.add(meadow);

    const trackWidth = 40;
    const trackLength = 200;
    const trackGeo = new THREE.PlaneGeometry(trackWidth, trackLength);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0.02;
    track.receiveShadow = true;
    scene.add(track);

    const laneCount = 7;
    const laneWidth = trackWidth / laneCount;
    for(let i = 0; i <= laneCount; i++) {
        const lineGeo = new THREE.PlaneGeometry(0.2, trackLength);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(-trackWidth/2 + (i * laneWidth), 0.03, 0);
        scene.add(line);

        if (i < laneCount) {
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = 'bold 80px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(i + 1, 64, 64);

            const tex = new THREE.CanvasTexture(canvas);
            const numMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.8 });
            const numGeo = new THREE.PlaneGeometry(2.5, 2.5);
            const numMesh = new THREE.Mesh(numGeo, numMat);
            numMesh.rotation.x = -Math.PI / 2;
            numMesh.position.set(-trackWidth/2 + (i * laneWidth) + (laneWidth/2), 0.04, 30);
            scene.add(numMesh);
        }
    }
}
