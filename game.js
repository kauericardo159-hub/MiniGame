import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// --- CONFIGURAÇÃO DE INTERFACE (HUD) ---
const hud = document.createElement('div');
hud.style.cssText = 'position:fixed; top:10px; left:10px; color:#0f0; font-family:monospace; background:rgba(0,0,0,0.5); padding:10px; pointer-events:none; z-index:100;';
hud.innerHTML = 'FPS: <span id="fps">0</span><br>POS: <span id="pos">0, 0, 0</span>';
document.body.appendChild(hud);

// --- JOYSTICK (CONSOLE STYLE) ---
const joyContainer = document.createElement('div');
joyContainer.style.cssText = 'position:fixed; bottom:50px; left:50px; width:120px; height:120px; background:rgba(255,255,255,0.2); border-radius:50%; z-index:100; touch-action:none; border:2px solid rgba(255,255,255,0.4);';
const joyKnob = document.createElement('div');
joyKnob.style.cssText = 'position:absolute; top:35px; left:35px; width:50px; height:50px; background:#fff; border-radius:50%; box-shadow:0 0 10px rgba(0,0,0,0.5);';
joyContainer.appendChild(joyKnob);
document.body.appendChild(joyContainer);

// --- VARIÁVEIS DE CONTROLE ---
let moveDir = { x: 0, z: 0 };
let camRotation = { lon: 0, lat: 0.5 };
let camDistance = 10;
let lastFpsUpdate = 0;
let frames = 0;

// --- CENA, CÂMERA E RENDERER ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luzes
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));

// --- O PLAYER (BLOCO) ---
const playerGeo = new THREE.BoxGeometry(1, 2, 1);
const playerMat = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.y = 1;
scene.add(player);

// Mundo (Baseplate para referência)
scene.add(new THREE.GridHelper(100, 50));

// --- LÓGICA DO JOYSTICK ---
joyContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = joyContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const dist = Math.min(Math.sqrt(dx*dx + dy*dy), 50);
    const angle = Math.atan2(dy, dx);
    
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;
    
    joyKnob.style.transform = `translate(${x}px, ${y}px)`;
    moveDir.x = x / 50;
    moveDir.z = y / 50;
}, { passive: false });

joyContainer.addEventListener('touchend', () => {
    joyKnob.style.transform = `translate(0,0)`;
    moveDir = { x: 0, z: 0 };
});

// --- CONTROLE DE CÂMERA (TOUCH LADO DIREITO) ---
let startTouchDist = 0;
window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && e.touches[0].clientX > window.innerWidth / 2) {
        // Rotação 360
        camRotation.lon -= e.movementX * 0.005 || 0;
        camRotation.lat = Math.max(0.1, Math.min(Math.PI / 2, camRotation.lat + (e.movementY * 0.005 || 0)));
    } else if (e.touches.length === 2) {
        // Zoom (Pinch)
        const dist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
        if (startTouchDist > 0) {
            camDistance += (startTouchDist - dist) * 0.05;
            camDistance = Math.max(2, Math.min(30, camDistance));
        }
        startTouchDist = dist;
    }
});
window.addEventListener('touchend', () => { startTouchDist = 0; });

// --- LOOP PRINCIPAL ---
function update(time) {
    requestAnimationFrame(update);
    
    // Movimento do Player relativo à câmera
    if (Math.abs(moveDir.x) > 0.1 || Math.abs(moveDir.z) > 0.1) {
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        forward.y = 0; forward.normalize();
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        right.y = 0; right.normalize();
        
        const moveVec = forward.multiplyScalar(-moveDir.z).add(right.multiplyScalar(moveDir.x));
        player.position.add(moveVec.multiplyScalar(0.15));
        
        // Rotacionar bloco para a direção do movimento
        player.rotation.y = Math.atan2(moveVec.x, moveVec.z);
    }

    // Posicionamento da Câmera (3ª Pessoa Orbital)
    camera.position.x = player.position.x + camDistance * Math.sin(camRotation.lon) * Math.cos(camRotation.lat);
    camera.position.z = player.position.z + camDistance * Math.cos(camRotation.lon) * Math.cos(camRotation.lat);
    camera.position.y = player.position.y + camDistance * Math.sin(camRotation.lat);
    camera.lookAt(player.position);

    // Atualizar HUD
    frames++;
    if (time > lastFpsUpdate + 1000) {
        document.getElementById('fps').innerText = frames;
        frames = 0;
        lastFpsUpdate = time;
    }
    document.getElementById('pos').innerText = `${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}, ${player.position.z.toFixed(1)}`;

    renderer.render(scene, camera);
}

update(0);

// Ajuste de Tela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
