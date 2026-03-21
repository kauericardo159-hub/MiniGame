class Controle {
    constructor() {
        this.keys = { w: false, a: false, s: false, d: false, ' ': false };
        
        // Configurações da Câmera estilo Roblox
        this.cameraRotation = {
            theta: 0, // Rotação horizontal (esquerda/direita)
            phi: Math.PI / 4, // Rotação vertical (cima/baixo)
            distancia: 15
        };

        // Variáveis de toque para rotação
        this.touchStart = { x: 0, y: 0 };
        this.isRotating = false;

        this.criarBotoesMobile();
        this.configurarToqueTela();

        // Teclado (PC)
        window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
    }

    configurarToqueTela() {
        // Detecta arrasto na tela para girar a câmera
        window.addEventListener('touchstart', (e) => {
            // Se o toque não for nos botões (container ou btnPulo), inicia rotação
            if (e.target.tagName !== 'DIV' || e.target.style.position !== 'absolute') {
                this.isRotating = true;
                this.touchStart.x = e.touches[0].pageX;
                this.touchStart.y = e.touches[0].pageY;
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (!this.isRotating) return;

            const deltaX = e.touches[0].pageX - this.touchStart.x;
            const deltaY = e.touches[0].pageY - this.touchStart.y;

            // Sensibilidade do giro
            this.cameraRotation.theta -= deltaX * 0.01;
            this.cameraRotation.phi += deltaY * 0.01;

            // Limita a rotação vertical para não dar volta completa (igual Roblox)
            this.cameraRotation.phi = Math.max(0.1, Math.min(Math.PI / 2.2, this.cameraRotation.phi));

            this.touchStart.x = e.touches[0].pageX;
            this.touchStart.y = e.touches[0].pageY;
        }, { passive: false });

        window.addEventListener('touchend', () => {
            this.isRotating = false;
        });
    }

    criarBotoesMobile() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.bottom = '20px';
        container.style.left = '20px';
        container.style.width = '150px';
        container.style.height = '150px';
        container.style.zIndex = '1000';
        document.body.appendChild(container);

        const criarBtn = (texto, top, left, tecla) => {
            const btn = document.createElement('div');
            btn.innerText = texto;
            btn.style.position = 'absolute';
            btn.style.width = '50px';
            btn.style.height = '50px';
            btn.style.background = 'rgba(255,255,255,0.2)';
            btn.style.border = '1px solid white';
            btn.style.borderRadius = '10px';
            btn.style.color = 'white';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.top = top;
            btn.style.left = left;
            btn.style.userSelect = 'none';
            btn.style.pointerEvents = 'auto'; // Garante que o botão pegue o toque

            const ativar = (e) => { e.stopPropagation(); this.keys[tecla] = true; btn.style.background = 'rgba(255,255,255,0.5)'; };
            const desativar = (e) => { e.stopPropagation(); this.keys[tecla] = false; btn.style.background = 'rgba(255,255,255,0.2)'; };

            btn.addEventListener('touchstart', ativar);
            btn.addEventListener('touchend', desativar);
            container.appendChild(btn);
        };

        criarBtn('W', '0px', '50px', 'w');
        criarBtn('A', '55px', '0px', 'a');
        criarBtn('S', '55px', '50px', 's');
        criarBtn('D', '55px', '100px', 'd');

        const btnPulo = document.createElement('div');
        btnPulo.innerText = 'PULO';
        btnPulo.style.position = 'absolute';
        btnPulo.style.bottom = '40px';
        btnPulo.style.right = '40px';
        btnPulo.style.width = '70px';
        btnPulo.style.height = '70px';
        btnPulo.style.background = 'rgba(255,255,255,0.3)';
        btnPulo.style.borderRadius = '50%';
        btnPulo.style.display = 'flex';
        btnPulo.style.alignItems = 'center';
        btnPulo.style.justifyContent = 'center';
        btnPulo.style.color = 'white';
        btnPulo.style.zIndex = '1000';
        
        btnPulo.addEventListener('touchstart', (e) => { e.stopPropagation(); this.keys[' '] = true; });
        btnPulo.addEventListener('touchend', (e) => { e.stopPropagation(); this.keys[' '] = false; });
        document.body.appendChild(btnPulo);
    }
}
