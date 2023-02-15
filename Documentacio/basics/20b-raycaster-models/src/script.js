import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

// (1) Importar el carregador GLTFLoader
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// (2) Instanciar el carregador GLTFLoader
const gltfLoader = new GLTFLoader()

// (3) Carregar el model amb el carregador GLTFLoader
let model = null
gltfLoader.load(
    './models/Duck/glTF-Binary/Duck.glb',
    (gltf) => {
        console.log('loaded', gltf.scene)
        model = gltf.scene
        model.position.y = - 1.2
        scene.add(model)
    }
)

// (4) Afegir Llums
// (4.1) Llum Ambient
const ambientLight = new THREE.AmbientLight('#ffffff', 0.3)
scene.add(ambientLight)

// (4.2) Llum Direccional
const directionalLight = new THREE.DirectionalLight('#ffffff', 0.7)
directionalLight.position.set(1, 2, 3)
scene.add(directionalLight)


// (5) RAYCASTER  ///////////////////////////////////////////
// (5.1) Crea el Raycaster
const raycaster = new THREE.Raycaster()


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

// (6) MOUSE ////////////////////////////////////////////////
// (6.1) Posició del Mouse
const mouse = new THREE.Vector2()

// (6.2) Mouse move Listener
window.addEventListener('mousemove', (event)=>{
    mouse.x  = +(event.clientX / sizes.width )  * 2 - 1
    mouse.y  = -(event.clientY / sizes.height ) * 2 + 1
    //console.log('mouse move', mouse.x, mouse.y)
})

// (6.3) Mouse-enter & Mouse-leave control
let currentIntersect = null;

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
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
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {

    const elapsedTime = clock.getElapsedTime()

    // (7.1) Configura raycaster amb MOUSE (Hovering)
    raycaster.setFromCamera(mouse, camera)

    // (7.2) Test de Raycasting sobre el model (ja carregat)
    if (model) {

        const modelIntersects = raycaster.intersectObject(model)
        //console.log(modelIntersects.length)

        if(modelIntersects.length){
            model.scale.set(1.2, 1.2, 1.2)
        }
        else {
            model.scale.set(1, 1, 1)
        }
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()