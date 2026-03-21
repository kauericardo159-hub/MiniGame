class Player {
    constructor(scene) {
        this.group = new THREE.Group();
        this.carregado = false;
        this.velocity = new THREE.Vector3();
        this.spawnPos = new THREE.Vector3(0, 5, 0);
        
        this.config = { 
            vel: 0.22, 
            pulo: 0.45, 
            grav: 0.02, 
            suavidadeGiro: 0.15,
            alturaSubida: 1.2,
            limiteVoid: -20 
        };

        window.criarModeloR6((dados) => {
            this.partes = dados.partes;
            this.mesh = dados.grupo;
            if (window.aplicarCoresNoob) window.aplicarCoresNoob(this.partes);
            this.group.add(this.mesh);
            this.carregado = true;
        });

        scene.add(this.group);
    }

    update(keys, camera, controle) {
        if (!this.carregado || !controle) return;

        if (this.group.position.y < this.config.limiteVoid) {
            this.group.position.copy(this.spawnPos);
            this.velocity.set(0, 0, 0);
            return;
        }

        let inputX = 0;
        let inputZ = 0;
        if (keys.w) inputZ -= 1;
        if (keys.s) inputZ += 1;
        if (keys.a) inputX -= 1;
        if (keys.d) inputX += 1;

        let estaNoMapa = Math.abs(this.group.position.x) < 150 && Math.abs(this.group.position.z) < 150;
        let nivelDoChaoBase = estaNoMapa ? 0 : -999; 
        let nivelDoChaoAtual = nivelDoChaoBase;

        if (window.objetosMundo) {
            for (let obj of window.objetosMundo) {
                let dx = this.group.position.x - obj.x;
                let dz = this.group.position.z - obj.z;
                let dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < obj.raio + 0.8) {
                    nivelDoChaoAtual = Math.max(nivelDoChaoAtual, obj.altura);
                }
            }
        }

        if (inputX !== 0 || inputZ !== 0) {
            const anguloCamera = controle.cameraRotation.theta;
            const movX = inputX * Math.cos(anguloCamera) + inputZ * Math.sin(anguloCamera);
            const movZ = inputZ * Math.cos(anguloCamera) - inputX * Math.sin(anguloCamera);

            let proxX = this.group.position.x + movX * this.config.vel;
            let proxZ = this.group.position.z + movZ * this.config.vel;

            let podeMover = true;
            let alturaObjetoNaMinhaFrente = estaNoMapa ? 0 : -999;

            if (window.objetosMundo) {
                for (let obj of window.objetosMundo) {
                    let dx = proxX - obj.x;
                    let dz = proxZ - obj.z;
                    let dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist < obj.raio + 0.8) {
                        if (obj.altura <= this.group.position.y + this.config.alturaSubida) {
                            alturaObjetoNaMinhaFrente = Math.max(alturaObjetoNaMinhaFrente, obj.altura);
                        } else {
                            podeMover = false;
                            break;
                        }
                    }
                }
            }

            if (podeMover) {
                this.group.position.x = proxX;
                this.group.position.z = proxZ;
                if (alturaObjetoNaMinhaFrente > this.group.position.y) {
                    this.group.position.y = THREE.MathUtils.lerp(this.group.position.y, alturaObjetoNaMinhaFrente, 0.2);
                }
            }

            // --- CORREÇÃO DA DIREÇÃO AQUI ---
            // Adicionamos Math.PI para girar o modelo 180 graus e ele olhar para frente
            const anguloPersonagem = Math.atan2(movX, movZ) + Math.PI;
            
            const novaRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), anguloPersonagem);
            this.group.quaternion.slerp(novaRot, this.config.suavidadeGiro);
        }

        if (keys[' '] && this.group.position.y <= nivelDoChaoAtual + 0.1) {
            this.velocity.y = this.config.pulo;
        }

        this.velocity.y -= this.config.grav;
        this.group.position.y += this.velocity.y;

        if (this.group.position.y < nivelDoChaoAtual) {
            this.group.position.y = nivelDoChaoAtual;
            this.velocity.y = 0;
        }

        this.atualizarCamera(camera, controle);
    }

    atualizarCamera(cam, controle) {
        if (!cam || !controle) return;
        const rot = controle.cameraRotation;
        const posX = rot.distancia * Math.sin(rot.phi) * Math.sin(rot.theta);
        const posY = rot.distancia * Math.cos(rot.phi);
        const posZ = rot.distancia * Math.sin(rot.phi) * Math.cos(rot.theta);

        const novaPos = new THREE.Vector3(
            this.group.position.x + posX,
            this.group.position.y + posY,
            this.group.position.z + posZ
        );

        cam.position.lerp(novaPos, 0.1);
        cam.lookAt(this.group.position.x, this.group.position.y + 2, this.group.position.z);
    }
}
