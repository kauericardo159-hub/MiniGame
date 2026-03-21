const CORES_PLAYER = {
    pele: 0xffdbac,    // Tom de pele humano
    top: 0x111111,     // Preto (Top)
    short: 0x0033aa,   // Azul (Short)
    rosto: 0x000000    // Cor para os detalhes do rosto
};

window.aplicarCoresNoob = function(partes) {
    // Função auxiliar para criar material padrão consistente
    const criarMaterial = (cor) => new THREE.MeshStandardMaterial({
        color: cor,
        metalness: 0.1,  // Leve reflexo para parecer material de qualidade
        roughness: 0.8   // Acabamento fosco (matte)
    });

    // 1. CABEÇA (Pele)
    if (partes.head) {
        partes.head.material = criarMaterial(CORES_PLAYER.pele);
        
        // Criar o rosto simples via Canvas para não depender de arquivos externos
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "#ffdbac"; ctx.fillRect(0, 0, 128, 128);
        
        // Olhos femininos simples
        ctx.fillStyle = "#000"; 
        ctx.fillRect(35, 45, 12, 18); ctx.fillRect(81, 45, 12, 18);
        // Sorriso
        ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.beginPath();
        ctx.arc(64, 75, 20, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
        
        partes.head.material.map = new THREE.CanvasTexture(canvas);
    }

    // 2. TORSO (Top Preto)
    if (partes.torso) {
        partes.torso.material = criarMaterial(CORES_PLAYER.top);
    }

    // 3. BRAÇOS (Pele)
    if (partes.leftarm) partes.leftarm.material = criarMaterial(CORES_PLAYER.pele);
    if (partes.rightarm) partes.rightarm.material = criarMaterial(CORES_PLAYER.pele);

    // 4. PERNAS (Short Azul)
    if (partes.leftleg) partes.leftleg.material = criarMaterial(CORES_PLAYER.short);
    if (partes.rightleg) partes.rightleg.material = criarMaterial(CORES_PLAYER.short);

    console.log("Cores da personagem aplicadas com sucesso!");
};
