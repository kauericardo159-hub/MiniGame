function carregarMundo(scene, callback) {
    // 1. CHÃO PRINCIPAL
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x3a5a3a });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const objetosColisao = [];

    // --- FUNÇÕES DE CRIAÇÃO ---

    // ÁRVORE R6 (Tronco bloqueia, copa é alta)
    const criarArvore = (x, z) => {
        const grupo = new THREE.Group();
        const tronco = new THREE.Mesh(new THREE.BoxGeometry(1.5, 5, 1.5), new THREE.MeshLambertMaterial({ color: 0x4b3621 }));
        tronco.position.y = 2.5;
        const copa = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshLambertMaterial({ color: 0x2d5a27 }));
        copa.position.y = 7;
        grupo.add(tronco, copa);
        grupo.position.set(x, 0, z);
        scene.add(grupo);
        // Altura 10 para o player não conseguir "pular" e subir no tronco facilmente
        objetosColisao.push({ x, z, raio: 1.2, altura: 10 }); 
    };

    // PEDRA (Escalonável)
    const criarPedra = (x, z, s) => {
        const pedra = new THREE.Mesh(new THREE.DodecahedronGeometry(s), new THREE.MeshLambertMaterial({ color: 0x707070 }));
        pedra.position.set(x, s * 0.4, z);
        pedra.rotation.set(Math.random(), Math.random(), Math.random());
        scene.add(pedra);
        objetosColisao.push({ x, z, raio: s * 0.8, altura: s * 0.8 });
    };

    // MONTANHA ESCALONÁVEL (Feita de camadas para o player subir)
    const criarMontanha = (x, z, baseWidth, andares) => {
        for(let i = 0; i < andares; i++) {
            const size = baseWidth - (i * 3);
            if(size < 2) break;
            const h = 1.2; // Altura de cada "degrau"
            const andar = new THREE.Mesh(new THREE.BoxGeometry(size, h, size), new THREE.MeshLambertMaterial({ color: 0x4a6a4a }));
            andar.position.set(x, (i * h) + h/2, z);
            scene.add(andar);
            // Cada andar adiciona uma zona de colisão de altura
            objetosColisao.push({ x, z, raio: size/2, altura: (i * h) + h });
        }
    };

    // MURO DE PEDRA
    const criarMuro = (x, z, rotY) => {
        const muro = new THREE.Mesh(new THREE.BoxGeometry(8, 3, 2), new THREE.MeshLambertMaterial({ color: 0x555555 }));
        muro.position.set(x, 1.5, z);
        muro.rotation.y = rotY;
        scene.add(muro);
        // Colisão retangular simplificada para circular (raio médio)
        objetosColisao.push({ x, z, raio: 3, altura: 3 });
    };

    // COGUMELOS (Enfeite baixo)
    const criarCogumelo = (x, z) => {
        const caule = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5), new THREE.MeshLambertMaterial({color: 0xffffff}));
        const chapeu = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({color: 0xff0000}));
        chapeu.position.y = 0.25;
        const grupo = new THREE.Group();
        grupo.add(caule, chapeu);
        grupo.position.set(x, 0.25, z);
        scene.add(grupo);
    };

    // LAGO (Apenas visual/cor de fundo)
    const criarLago = (x, z, r) => {
        const lago = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.6 }));
        lago.rotation.x = -Math.PI / 2;
        lago.position.set(x, 0.1, z);
        scene.add(lago);
    };

    // 5. SPAWN PADRÃO
    const spawn = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    spawn.position.set(0, 0.05, 0);
    scene.add(spawn);

    // --- POPULAR O MUNDO ---
    
    // Floresta
    for(let i = 0; i < 25; i++) {
        let x = (Math.random() - 0.5) * 150;
        let z = (Math.random() - 0.5) * 150;
        if(Math.sqrt(x*x + z*z) > 12) criarArvore(x, z);
    }

    // Pedras e Cogumelos
    for(let i = 0; i < 20; i++) {
        let x = (Math.random() - 0.5) * 180;
        let z = (Math.random() - 0.5) * 180;
        if(Math.sqrt(x*x + z*z) > 15) {
            if(Math.random() > 0.5) criarPedra(x, z, 1 + Math.random() * 3);
            else criarCogumelo(x, z);
        }
    }

    // Montanhas Específicas
    criarMontanha(40, 40, 20, 8);  // Montanha Grande
    criarMontanha(-50, -30, 15, 5); // Montanha Média

    // Lagos
    criarLago(20, -25, 10);
    criarLago(-30, 40, 7);

    // Muros
    criarMuro(10, 15, 0.5);
    criarMuro(-15, 10, -0.8);

    window.objetosMundo = objetosColisao;

    if (callback) callback(new THREE.Vector3(0, 0, 0));
}
