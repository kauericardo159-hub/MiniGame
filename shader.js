window.shader = {
    time: 0,
    sunDir: null,
    skyMaterial: null
};

window.initShaders = function(scene, renderer, camera, player) {
    window.shader.sunDir = new THREE.Vector3(0.5, 1.0, 0.3).normalize();

    // --- 1. CÉU AVANÇADO (Nuvens Camadas e Espalhamento Atmosférico) ---
    const skyGeo = new THREE.SphereGeometry(900, 32, 32);
    window.shader.skyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uSunDir: { value: window.shader.sunDir },
            topColor: { value: new THREE.Color(0x0055ff) },
            bottomColor: { value: new THREE.Color(0x88ccff) },
            horizonColor: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
            varying vec3 vWorldPos;
            varying vec3 vNormal;
            void main() {
                vNormal = normal;
                vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vWorldPos;
            uniform float uTime;
            uniform vec3 uSunDir;
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform vec3 horizonColor;

            float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
            float noise(vec2 p) {
                vec2 i = floor(p); vec2 f = fract(p);
                f = f*f*(3.0-2.0*f);
                return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), f.x),
                           mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), f.x), f.y);
            }

            void main() {
                vec3 dir = normalize(vWorldPos);
                float h = dir.y;

                // Gradiente Atmosférico
                vec3 sky = mix(horizonColor, bottomColor, smoothstep(-0.1, 0.2, h));
                sky = mix(sky, topColor, smoothstep(0.2, 0.8, h));

                // Sol e Brilho (Sun Disk)
                float sun = pow(max(dot(dir, uSunDir), 0.0), 800.0);
                float halo = pow(max(dot(dir, uSunDir), 0.0), 10.0) * 0.4;
                sky += vec3(1.0, 0.8, 0.5) * (sun * 5.0 + halo);

                // Nuvens Dinâmicas (Camada Dupla)
                vec2 uv = dir.xz / (dir.y + 0.05);
                float cloud1 = noise(uv * 0.3 + uTime * 0.02);
                float cloud2 = noise(uv * 0.6 - uTime * 0.01);
                float finalClouds = smoothstep(0.45, 0.65, cloud1 * cloud2);
                
                sky = mix(sky, vec3(1.0), finalClouds * smoothstep(0.0, 0.2, h));

                gl_FragColor = vec4(sky, 1.0);
            }
        `,
        side: THREE.BackSide
    });
    scene.add(new THREE.Mesh(skyGeo, window.shader.skyMaterial));

    // --- 2. ILUMINAÇÃO DE CENA (Estilo Renderizador) ---
    const sol = new THREE.DirectionalLight(0xffffff, 1.5);
    sol.position.copy(window.shader.sunDir).multiplyScalar(100);
    sol.castShadow = true;
    
    // Sombra de alta qualidade sem limites visíveis
    sol.shadow.mapSize.set(2048, 2048);
    sol.shadow.camera.left = sol.shadow.camera.bottom = -150;
    sol.shadow.camera.right = sol.shadow.camera.top = 150;
    sol.shadow.camera.far = 1000;
    sol.shadow.bias = -0.0002;
    scene.add(sol);

    // Luz de preenchimento (Ambiental + Sky Light)
    const hemiLight = new THREE.HemisphereLight(0x88ccff, 0x3a5a3a, 0.6);
    scene.add(hemiLight);

    // --- 3. MATERIAL DO PLAYER (Com Reflexo e Fresnel) ---
    if (player && player.partes) {
        for (let nome in player.partes) {
            const corHex = (window.CORES_NOOB && CORES_NOOB[nome.toLowerCase()]) ? CORES_NOOB[nome.toLowerCase()] : 0xffffff;
            
            // Usamos MeshStandardMaterial para reflexo PBR automático
            player.partes[nome].material = new THREE.MeshStandardMaterial({
                color: corHex,
                metalness: 0.2,     // Brilho de plástico/cerâmica
                roughness: 0.4,     // Reflexo levemente borrado (mais bonito)
                envMapIntensity: 1.2
            });

            // Injetar efeito de Fresnel (borda iluminada) via Shader
            player.partes[nome].material.onBeforeCompile = (shader) => {
                shader.uniforms.uTime = { value: 0 };
                shader.fragmentShader = shader.fragmentShader.replace(
                    `#include <common>`,
                    `#include <common>
                     varying vec3 vWorldNormal;
                     varying vec3 vViewDir;`
                );
                // Adiciona o brilho de borda (Fresnel)
                shader.fragmentShader = shader.fragmentShader.replace(
                    `#include <dithering_fragment>`,
                    `#include <dithering_fragment>
                     float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 3.0);
                     gl_FragColor.rgb += vec3(0.5, 0.7, 1.0) * fresnel * 0.3;`
                );
            };

            player.partes[nome].castShadow = true;
            player.partes[nome].receiveShadow = true;
        }
    }

    // --- 4. AJUSTE DO MUNDO (Reflexo Fraco) ---
    scene.traverse((child) => {
        if (child.isMesh && child !== player.group && child.geometry.type !== 'SphereGeometry') {
            child.castShadow = true;
            child.receiveShadow = true;
            if(child.material) {
                child.material.metalness = 0.05;
                child.material.roughness = 0.8;
            }
        }
    });
};

window.updateShaders = function(time) {
    if (window.shader.skyMaterial) {
        window.shader.skyMaterial.uniforms.uTime.value = time;
    }
};
