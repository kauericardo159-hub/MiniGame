window.onload = () => {
    const ui = document.getElementById('ui');

    if (typeof THREE === 'undefined') {
        if(ui) ui.innerText = "Erro: Three.js não carregou!";
        return;
    }

    const scene = new THREE.Scene();
    // O fundo começa preto, o shader do céu cuidará do resto
    scene.background = new THREE.Color(0x000000); 

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        powerPreference: "high-performance",
        logarithmicDepthBuffer: true // Ajuda a evitar o "flicker" em grandes distâncias
    });

    // --- CONFIGURAÇÕES DE IMAGEM (ESTILO BLENDER) ---
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Essencial para o Shader Ultra:
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cores cinemáticas
    renderer.toneMappingExposure = 1.2;                 // Brilho da exposição
    renderer.outputColorSpace = THREE.SRGBColorSpace;   // Cores corretas (Gamma)
    
    // Sombras
    renderer.shadowMap.enabled = true; 
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    
    document.body.appendChild(renderer.domElement);

    let player, controle;

    carregarMundo(scene, (spawnPos) => {
        if(ui) ui.innerText = "Renderizando Atmosfera...";

        player = new Player(scene);
        controle = new Controle();
        
        // Define a posição inicial segura
        const pontoSpawn = spawnPos || new THREE.Vector3(0, 5, 0);
        if (player) {
            player.group.position.copy(pontoSpawn);
            player.spawnPos = pontoSpawn.clone(); // Para o sistema de Void
        }

        // --- INICIALIZAÇÃO DO SHADER ULTRA ---
        if (window.initShaders) {
            window.initShaders(scene, renderer, camera, player);
        }

        if(ui) ui.style.display = 'none';

        function animate() {
            requestAnimationFrame(animate);
            
            // O tempo em segundos (time) é usado pelas nuvens no shader
            const time = performance.now() * 0.001;

            if (player && player.carregado && controle) {
                player.update(controle.keys, camera, controle);
            }
            
            // Atualiza nuvens e sol no shader
            if (window.updateShaders) {
                window.updateShaders(time);
            }

            renderer.render(scene, camera);
        }

        animate();
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};
