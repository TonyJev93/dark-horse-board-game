function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.005;

    GameState.horseIds.forEach(id => {
        const horse = horses[id];
        const { legs, targetPos } = horse.userData;

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
                legs.forEach(l => l.rotation.x = THREE.MathUtils.lerp(l.rotation.x, 0, 0.1));
            }
        }
    });
    renderer.render(scene, camera);
}
