function init() {
    setupGameData();
    setupThreeJS();
    createHorses();
    
    const btnGetToken = document.getElementById('btn-get-token');
    const btnSkipToken = document.getElementById('btn-skip-token');
    const modalGetToken = document.getElementById('modal-get-token');
    const modalSkipToken = document.getElementById('modal-skip-token');
    
    if (btnGetToken) btnGetToken.onclick = takeDarkHorseToken;
    if (btnSkipToken) btnSkipToken.onclick = skipToken;
    if (modalGetToken) modalGetToken.onclick = takeDarkHorseToken;
    if (modalSkipToken) modalSkipToken.onclick = skipToken;
    
    startPlayerTurn();
    animate();

    let isMouseDown = false;
    let prevMouseX = 0;
    document.addEventListener('mousedown', (e) => { if(e.target.tagName === 'CANVAS') isMouseDown = true; prevMouseX = e.clientX; });
    document.addEventListener('mouseup', () => isMouseDown = false);
    document.addEventListener('mousemove', (e) => {
        if(isMouseDown) {
            const deltaX = e.clientX - prevMouseX;
            camera.position.x += deltaX * 0.08;
            camera.lookAt(0, 0, 0);
            prevMouseX = e.clientX;
        }
    });
}

window.onload = init;
window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
