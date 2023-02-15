import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

// (3.0) Importar el carregador GLTFLoader
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test sphere
 */
const testSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    //new THREE.MeshBasicMaterial()
    new THREE.MeshStandardMaterial()
)
//scene.add(testSphere)

// (1) Llums
// (1.1) Llum Direccional
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(0.25, 3, -2.25)
scene.add(directionalLight)

// (2) Controls GUI
// (2.1) Ajustos de la Llum Ambiental
gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001).name('lightZ')

// (3) Model Realistic ////////////////////////////////////////////////////
// (3.0) Importar el carregador GLTFLoader
// (3.1) Instanciar GLTFLoader
const gltfLoader = new GLTFLoader()

// (3.2) Carregar el model amb el mètode load
gltfLoader.load(
    './models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        console.log('loaded', gltf)
        gltf.scene.scale.set(10, 10, 10)
        gltf.scene.position.set(0, -4, 0)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        gui.add(gltf.scene.rotation, 'y')
            .min(-Math.PI).max(Math.PI).step(0.001)
            .name('rotation')

        updateAllMaterials()
    }
)

// (4) Textures de Mapa Ambiental //////////////////////////////////////////////////
// (4.1) Instanciar el carregador de textures de cub
const cubeTextureLoader = new THREE.CubeTextureLoader()

// (4.2) Carregar les textures de les cares del cub
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])

// (4.2) Aplicar les textures a l'escena
scene.background = environmentMap

// (4.3) Aplicar les textures al model
const updateAllMaterials = () => {
    scene.traverse((child) =>   {
        if (child instanceof THREE.Mesh &&
            // Materials
            child.material instanceof THREE.MeshStandardMaterial){
            //child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity

            // Ombres
            child.castShadow = true
            child.receiveShadow = true

        }

    })
}

// (4.4) Controlar la intensitat del mapa amb UI Debugger
debugObject.envMapIntensity = 1
gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001)
    //.onChange(updateAllMaterials)

// (4.5) Aplicar el mapa a tota l'escena
scene.environment = environmentMap






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
camera.position.set(4, 1, - 4)
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

// Corregir llums de l'escenea
renderer.physicallyCorrectLights = true

// (5) Output Encoding /////////////////////////////////////////
// (5.1) Definir l'Output Encoding del renderer
renderer.outputEncoding = THREE.sRGBEncoding
// (5.2) Aplicar al mapa d'entorn la codificació
environmentMap.encoding = THREE.sRGBEncoding

// (6) Tone Mapping ////////////////////////////////////////////
// (6.1)
renderer.toneMapping = THREE.ACESFilmicToneMapping

// (6.2) Emprar GUI per canviar-ho
gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping
})

// (6.3) Grau d'exposició del to del mapa
renderer.toneMappingExposure = 3

// (6.4) Emprar GUI per canviar-ho
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)

// (7) Antialiasing
renderer.antialiasing = true

// (8) Ombres //////////////////////////////////////////////////////////
// (8.1) Abilitar ombres al renderer
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// (8.2) Llums que produiran ombres
directionalLight.castShadow = true

// (8.3) CameraHelper per veure la camera d'ombres de la llum anterior
const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
scene.add(directionalLightCameraHelper)

// (8.4) Configuració de la càmera d'ombres
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)

// (8.5) Actualitzar els materials a la funció updateAllMaterials (castShadow, recieveShadow).





/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()