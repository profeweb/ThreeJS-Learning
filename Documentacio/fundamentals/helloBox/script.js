
// Test ThreeJS Loaded
console.log(THREE);


// Canvas
const canvas = document.querySelector( '#c' );

// Renderer
const renderer = new THREE.WebGLRenderer( { canvas } );

// Scene
const scene = new THREE.Scene();

// Camera
const fov = 75;
const aspect = 2;
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;


// Geometria
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

// Material
const material = new THREE.MeshBasicMaterial({color: 0x44aa88});

// Mesh
const cube = new THREE.Mesh(geometry, material);

// Afegir objecte a l'escena
scene.add(cube);

// Renderitzar l'escena amb la camera
renderer.render(scene, camera);

