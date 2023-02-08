import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

// (1) Importar la classe GLTFLoader
import { GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

// (5.1) Iportar la classe DRACOLoader
import { DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader.js";

// (2) Instanciar GLTFLoader
const gltfLoader = new GLTFLoader()

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// (3) Carregar el model GLTF (GLTF, Binary, Embedded)
gltfLoader.load(
    '/models/Duck/glTF/Duck.gltf',
    //'/models/Duck/glTF-Binary/Duck.glb',
    //'/models/Duck/glTF-Embedded/Duck.gltf',
    (gltf) => {
        console.log('success')
        // Revisar jerarquia i escala del model importat!!!
        console.log(gltf)
        // Afegir la malla
        //scene.add(gltf.scene.children[0])

    },
    () => {
        console.log('progress')
    },
    ()=> {
        console.log('error')
    }
)

// (4) Carregar un model GLTF amb varis fills
gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf)=>{
        console.log('success')
        console.log(gltf.scene)

        // Opció fàcil: carregar-ho tot. (No òptima!)
        //scene.add(gltf.scene)

        // Carregar 1r fill
        //scene.add(gltf.scene.children[0])

        // FOR: No carrega tots els fills
        /*
        for(const child of gltf.scene.children){
            scene.add(child)
        }
         */

        // WHILE: sí carrega tots els fills
        /*
        while(gltf.scene.children.length>0){
            scene.add(gltf.scene.children[0])
        }
         */

        // COPIA de l'array de fills, per emprar FOR
        const children = [...gltf.scene.children]
        for(const child of children){
            //scene.add(child)
        }


    }
)

// (5) Model GLTF amb Compressió DRACO
// (5.1) Importar la class DRACOLoader

// (5.2) Afegir i configurar el DracoLoader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

// (5.3) Carregar el model GLTF-Draco
gltfLoader.load(
    '/models/Duck/glTF-Draco/Duck.gltf',
    (gltf)=>{
        console.log('success')
        //scene.add(gltf.scene)
    }
)

// (6) Model GLTF Animat
// (6.1) Carregar el model GLTF
let mixer = null
gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf)=>{
        console.log('success')
        console.log(gltf)

        // Corregir l'escala del model importat
        gltf.scene.scale.set(0.025, 0.025, 0.025)

        // Afegir el model a l'escena
        scene.add(gltf.scene)

        // (6.2) Accedir a una animació i reproduir-la
        mixer = new THREE.AnimationMixer(gltf.scene)
        const action = mixer.clipAction(gltf.animations[0])
        action.play()
    }
)




/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    controls.update()

    // (6.3) Actualitzar les animacions
    if(mixer != null) {
        mixer.update(deltaTime)
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()