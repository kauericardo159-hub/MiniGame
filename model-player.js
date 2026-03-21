window.criarModeloR6 = function(callback) {
    const grupoModelo = new THREE.Group();
    const loader = new THREE.OBJLoader();
    const partes = {};
    const arquivos = ['torso', 'head', 'leftarm', 'rightarm', 'leftleg', 'rightleg'];
    let carregados = 0;

    arquivos.forEach(nome => {
        loader.load(`${nome}.obj`, (obj) => {
            const mesh = obj.children[0];
            if (mesh) {
                partes[nome] = mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                grupoModelo.add(mesh);
            }
            carregados++;
            if (carregados === arquivos.length) {
                // --- AJUSTE DE POSIÇÃO PARA NÃO ATRAVESSAR O CHÃO ---
                // Agora o "pé" fica no 0 e o corpo para cima.
                
                // Torso: Centro do peito sobe para 2.5
                if(partes.torso)    partes.torso.position.set(0, 2.5, 0);

                // Cabeça: Sobe acompanhando o torso
                if(partes.head)     partes.head.position.set(0, 4.5, 0);

                // Braços: Alinhados com o novo Y do torso
                if(partes.leftarm)  partes.leftarm.position.set(-1.5, 3.0, 0);
                if(partes.rightarm) partes.rightarm.position.set(1.5, 3.0, 0);

                // Pernas: Agora o Y é 1.0. 
                // Como a perna tem 2 de altura, o pé toca o chão (0).
                if(partes.leftleg)  partes.leftleg.position.set(-0.6, 1.0, 0);
                if(partes.rightleg) partes.rightleg.position.set(0.6, 1.0, 0);

                if (callback) callback({ grupo: grupoModelo, partes: partes });
            }
        });
    });
};
