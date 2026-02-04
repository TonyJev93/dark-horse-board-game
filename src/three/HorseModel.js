import { HORSE_COLORS } from '../core/GameConfig.js';

export class HorseModel {
    static createHorse(id, isMyHorse, isDarkHorse) {
        const group = new THREE.Group();
        const color = HORSE_COLORS[id];
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

        const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 2.5), mat);
        body.position.y = 1.5;
        body.castShadow = true;
        group.add(body);

        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.8), mat);
        neck.position.set(0, 2.4, -1.2);
        neck.rotation.x = -0.4;
        neck.castShadow = true;
        group.add(neck);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.8, 1.2), mat);
        head.position.set(0, 3.2, -1.8);
        head.castShadow = true;
        group.add(head);

        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.5, 0.3), blackMat);
        tail.position.set(0, 1.5, 1.4);
        tail.rotation.x = 0.5;
        group.add(tail);

        const legGeo = new THREE.BoxGeometry(0.4, 1.5, 0.4);
        const legs = [];
        const legPos = [{x: 0.4, z: 0.8}, {x: -0.4, z: 0.8}, {x: 0.4, z: -0.8}, {x: -0.4, z: -0.8}];
        legPos.forEach((pos) => {
            const leg = new THREE.Mesh(legGeo, mat);
            leg.position.set(pos.x, 0.75, pos.z);
            leg.castShadow = true;
            group.add(leg);
            legs.push(leg);
        });

        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        if (isMyHorse) {
            ctx.fillStyle = '#38bdf8';
        } else if (isDarkHorse) {
            ctx.fillStyle = '#dc2626';
        } else {
            ctx.fillStyle = '#ffffff';
        }
        
        ctx.beginPath(); 
        ctx.arc(64, 64, 60, 0, Math.PI*2); 
        ctx.fill();
        ctx.fillStyle = (isMyHorse || isDarkHorse) ? 'white' : 'black';
        ctx.font = 'bold 80px sans-serif'; 
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'middle';
        ctx.fillText(id, 64, 64);

        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
            map: new THREE.CanvasTexture(canvas) 
        }));
        sprite.position.y = 4.5;
        sprite.scale.set(1.5, 1.5, 1);
        group.add(sprite);

        group.userData = { legs, id };
        return group;
    }
}
