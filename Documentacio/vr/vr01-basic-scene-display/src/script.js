import './style.css'
import * as THREE from 'three'

// (1) Importar VRBUtton per abilitar el mode VR
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Escena
const scene = new THREE.Scene()


/////////////////////////////////////////////////////////////////////////////////////////////

// Objecte(s):

// Geometry
const geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1)
//const geometry = new THREE.SphereGeometry(1, 32, 8)
const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe:true
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)


//////////////////////////////////////////////////////////////////////////////////////

// Mides
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Redimensionar finestra
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

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
scene.add(camera)


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// (2) Abilitar el mode XR del renderer
renderer.xr.enabled = true;

// Animació
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objectes
    mesh.rotation.y = elapsedTime*0.1

    // Render
    renderer.render(scene, camera)

    // (3) Crida a tick en el proper frame (Diferent a VR)
    //window.requestAnimationFrame(tick)
    renderer.setAnimationLoop( tick);
}

tick()

// (4) Adjuntar el botó al body de la pàgina HTML
document.body.appendChild( VRButton.createButton( renderer ) );