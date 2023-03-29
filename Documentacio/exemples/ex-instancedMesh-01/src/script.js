import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {
    distanceX : 1,
    distanceY : 1,
    distanceZ : 1
}
gui.add(debugObject, 'distanceX').min(1).max(5).step(0.01).name('distance X')
gui.add(debugObject, 'distanceY').min(1).max(5).step(0.01).name('distance Y')
gui.add(debugObject, 'distanceZ').min(1).max(5).step(0.01).name('distance Z')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objectes
 */

let mesh;
const amount = 10;
const count = Math.pow( amount, 3 );


// Carrega model
const loader = new THREE.BufferGeometryLoader();
loader.load( './suzanne_buffergeometry.json', ( geometry )=> {

    geometry.computeVertexNormals();
    geometry.scale( 0.5, 0.5, 0.5 );

    const material = new THREE.MeshNormalMaterial();

    mesh = new THREE.InstancedMesh( geometry, material, count );
    mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
    scene.add( mesh );

    gui.add( mesh, 'count', 0, count );

} );


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(10, 10, 10)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Anima
 */
const clock = new THREE.Clock()
const dummy = new THREE.Object3D();



const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // (2.1) Anima instancies
    if(mesh) {

        let i = 0;
        const offset = ((amount - 1) / 2);

        for (let x = 0; x < amount; x++) {
            for (let y = 0; y < amount; y++) {
                for (let z = 0; z < amount; z++) {

                    dummy.position.set((offset - x)*debugObject.distanceX, (offset - y)*debugObject.distanceY, (offset - z)*debugObject.distanceZ);
                    dummy.rotation.y = (Math.sin(x / 4 + elapsedTime) + Math.sin(y / 4 + elapsedTime) + Math.sin(z / 4 + elapsedTime));
                    dummy.rotation.z = dummy.rotation.y * 2;
                    dummy.updateMatrix();

                    mesh.setMatrixAt(i++, dummy.matrix);
                }

            }

        }

        mesh.instanceMatrix.needsUpdate = true;
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()