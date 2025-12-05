import * as THREE from 'three';

// --- 1. Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky Blue

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0); // Increased slightly for better visibility
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 8);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
console.log("Renderer added to DOM");

// --- 2. The Ground ---
const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 }); // Green
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// --- 3. The Player (Tripti) ---
const tripti = new THREE.Group();
scene.add(tripti);

// Body: Cylinder (Pink top)
// Using a simple pink cylinder as requested.
const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff69b4 }); // Hot Pink / Pink top
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.position.y = 0.75; // Half height
body.castShadow = true;
tripti.add(body);

// Head: Sphere (Skin tone)
const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
const headMat = new THREE.MeshStandardMaterial({ color: 0xffe0bd }); // Skin tone
const head = new THREE.Mesh(headGeo, headMat);
head.position.y = 1.7; // Body height (1.5) + radius approx (0.2) -> 1.7 sits nicely on top
head.castShadow = true;
tripti.add(head);

// Hair: Black sphere geometry
const hairGroup = new THREE.Group();
head.add(hairGroup);
const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

// Main hair volume
const hairMain = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), hairMat);
hairMain.position.set(0, 0.05, -0.05);
hairGroup.add(hairMain);

// Side buns/puffs for style
const hairLeft = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), hairMat);
hairLeft.position.set(-0.35, -0.1, 0.1);
hairGroup.add(hairLeft);

const hairRight = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), hairMat);
hairRight.position.set(0.35, -0.1, 0.1);
hairGroup.add(hairRight);


// Accessories

// Glasses: Black small box
const glassesGroup = new THREE.Group();
head.add(glassesGroup);
const glassesMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

const glassL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.05), glassesMat);
glassL.position.set(-0.15, 0.05, 0.35);
glassesGroup.add(glassL);

const glassR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.05), glassesMat);
glassR.position.set(0.15, 0.05, 0.35);
glassesGroup.add(glassR);

const glassBridge = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.05), glassesMat);
glassBridge.position.set(0, 0.05, 0.35);
glassesGroup.add(glassBridge);


// Tote Bag: White box
const bagGeo = new THREE.BoxGeometry(0.4, 0.5, 0.15);
const bagMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const bag = new THREE.Mesh(bagGeo, bagMat);
bag.position.set(0.55, 0.8, 0); // Side of body
bag.castShadow = true;
tripti.add(bag);

// Sunflower Keychain: Yellow cube
const flowerGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
const flowerMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b }); // Yellow
const flower = new THREE.Mesh(flowerGeo, flowerMat);
flower.position.set(0, -0.1, 0.1); // Attached to bag
bag.add(flower);


// --- 4. Movement Controls ---
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

const speed = 0.15;
const clock = new THREE.Clock();

// --- 5. Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    let isMoving = false;

    // Movement Logic
    if (keys.ArrowUp) { tripti.position.z -= speed; isMoving = true; }
    if (keys.ArrowDown) { tripti.position.z += speed; isMoving = true; }
    if (keys.ArrowLeft) { tripti.position.x -= speed; isMoving = true; }
    if (keys.ArrowRight) { tripti.position.x += speed; isMoving = true; }

    // Bobbing Animation
    if (isMoving) {
        tripti.position.y = Math.abs(Math.sin(time * 10)) * 0.1;
    } else {
        tripti.position.y = 0;
    }

    // Camera Follow Logic
    // Target position: Tripti's position + offset (0, 5, 8)
    const targetCameraPos = new THREE.Vector3(
        tripti.position.x,
        tripti.position.y + 5,
        tripti.position.z + 8
    );

    // Smoothly interpolate current camera position to target
    camera.position.lerp(targetCameraPos, 0.1);

    // Always look at Tripti
    camera.lookAt(tripti.position.x, tripti.position.y + 1, tripti.position.z);

    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
