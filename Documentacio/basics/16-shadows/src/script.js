import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(2, 2, - 1)
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)

// (3) Activar l'ombra del llum
//directionalLight.castShadow = true
directionalLight.castShadow = false

// (4) Redimensionar Shadow Map del llum
console.log(directionalLight.shadow);
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024

// (5) Quina càmera empra la llum???
console.log(directionalLight.shadow.camera)

// (6) Visualitzar la camera del llum
const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
//scene.add(directionalLightCameraHelper)

// (7) Optimitzar camera (near, far, top, left, bottom, right)
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 6
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.bottom = -2
directionalLight.shadow.camera.left = -2

// (8) Blur
directionalLight.shadow.radius = 10


//////////////////////////////////////////////////////////////////////////////////////
// (10) Afegir una SpotLight
const spotLight = new THREE.SpotLight(0xffffff, 0.4, 10, Math.PI*0.3)
spotLight.position.set(0, 2, 2)
scene.add(spotLight)
scene.add(spotLight.target)

//spotLight.castShadow = true
spotLight.castShadow = false

// (11) Afegir CameraHelper
const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
spotLightCameraHelper.visible = false
scene.add(spotLightCameraHelper)
console.log(spotLight.shadow.camera)

// (12) Millorar la Camera de la SpotLight
spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
spotLight.shadow.camera.fov = 30
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 6

//////////////////////////////////////////////////////////////////////////////////////////
// (13) Afegir una PointLight
const pointLight = new THREE.PointLight(0xffffff, 0.3)
pointLight.position.set(-1, 1, 0)
scene.add(pointLight)

//pointLight.castShadow = true
pointLight.castShadow = false

console.log(pointLight.shadow.camera)

// (14) Afegir Helper
const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
pointLightCameraHelper.visible = false
scene.add(pointLightCameraHelper)

// (15) Configurar camera d'ombres de la PointLight
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024
pointLight.shadow.mapSize.near = 0.1
pointLight.shadow.mapSize.far = 5


// (16) BAKED SHADOWS

const textureLoader = new THREE.TextureLoader()
const bakedShadow =  textureLoader.load('/textures/bakedShadow.jpg')

// (17) ALTERNATIVA A BAKED SHADOWS
const simpleShadow =  textureLoader.load('/textures/simpleShadow.jpg')


/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
     material
    // new THREE.MeshBasicMaterial({ map:bakedShadow })  // (16)
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5

scene.add(sphere, plane)

// (18) Pla d'Ombra
const sphereShadow = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
        color: 0xff0000,
        alphaMap: simpleShadow,
        transparent: true
    })
)
sphereShadow.rotation.x = -Math.PI * 0.5
sphereShadow.position.y = plane.position.y + 0.01
scene.add(sphereShadow)

// (2) Objectes Cast & Receive Shadow
sphere.castShadow = true
plane.receiveShadow = true

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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
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

// (1) Activar ombres
renderer.shadowMap.enabled = true

// (9) Algoritme ShadowMap
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.shadowMap.type = THREE.PCFSoftShadowMap

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // (19) Update Sphere & Shadow
    // Moviment circular
    sphere.position.x = Math.cos(elapsedTime) * 1.5
    sphere.position.z = Math.sin(elapsedTime) * 1.5
    // Moviment de salt
    sphere.position.y = Math.abs(Math.sin(elapsedTime*3))

    // Moure la ombra amb l'esfera
    sphereShadow.position.x = sphere.position.x
    sphereShadow.position.z = sphere.position.z
    const scale = (1 - sphere.position.y)*0.5
    sphereShadow.scale.set(scale, scale, 1)
    sphereShadow.material.opacity = (1 - sphere.position.y)*0.3

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()