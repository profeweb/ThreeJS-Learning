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

// (1) Sense Llums (Comentar Ambient i Point) --> Escena a les fosques (MeshStandardMaterial)!!!
/*
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)
 */

// (2) AmbientLight (Llum omnidireccional)
//const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
const ambientLight = new THREE.AmbientLight()
ambientLight.color = new THREE.Color(0xffffff)
ambientLight.intensity = 0.5
//scene.add(ambientLight)

// (3) Ús de debugger UI
const fal = gui.addFolder('AMBIENT LIGHT')
fal.addColor(ambientLight, 'color')
fal.add(ambientLight, 'intensity').min(0).max(1).step(0.001)

// (4) DirectionalLight
const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.3)
directionalLight.position.set(1, 0.25, 0)
// Per defecte no importa la distància del llum
directionalLight.position.set(1000, 0.25, 0)
// Per defecte apunta al centre de l'escena
//scene.add(directionalLight)

const fdl = gui.addFolder('DIRECTIONAL LIGHT')
fdl.addColor(ambientLight, 'color')
fdl.add(ambientLight, 'intensity').min(0).max(1).step(0.001)

// (5) HemisphereLight
const paramsHL = {
    color: 0xff0000,
    groundColor: 0x0000ff,
    intensity: 0.5
}
const hemisphereLight = new THREE.HemisphereLight(paramsHL.color, paramsHL.groundColor, paramsHL.intensity)
//scene.add(hemisphereLight)

const fhl = gui.addFolder('HEMISPHERE LIGHT')

fhl.addColor(paramsHL, 'color').onChange((value)=>{
    hemisphereLight.color = new THREE.Color(value)
})
fhl.add(paramsHL, 'intensity').onChange((value)=>{
    hemisphereLight.intensity = value
})
fhl.addColor(paramsHL, 'groundColor').onChange((value)=>{
    hemisphereLight.groundColor = new THREE.Color(value)
})

// (6) PointLight
const pointLight = new THREE.PointLight(0xff9000, 0.5)
pointLight.position.set(1, -0.5, 1)
pointLight.distance = 10
pointLight.decay = 0.3
//scene.add(pointLight)

const fpl = gui.addFolder('POINT LIGHT')
fpl.add(pointLight, 'distance').min(0).max(20).step(0.001)
fpl.add(pointLight, 'decay').min(0).max(1).step(0.001)

// (7) RectAreaLight
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1)
rectAreaLight.position.set(-1.5, 0, 1.5)
rectAreaLight.lookAt(new THREE.Vector3())
//scene.add(rectAreaLight)

const fral = gui.addFolder('RECT AREA LIGHT')
fral.add(rectAreaLight, 'width').min(0).max(5).step(0.001)
fral.add(rectAreaLight, 'height').min(0).max(5).step(0.001)

// (8) SpotLight
const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 10, Math.PI*0.1, 0.25, 1)
spotLight.position.set(0, 2, 3)
scene.add(spotLight)

console.log(spotLight.target)
spotLight.target.position.x = -0.75
scene.add(spotLight.target)

const fsl = gui.addFolder('SPOT LIGHT')
fsl.addColor(spotLight, 'color')
fsl.add(spotLight, 'intensity').min(0).max(1).step(0.001)
fsl.add(spotLight, 'distance').min(0).max(100).step(0.01)
fsl.add(spotLight, 'angle').min(0).max(Math.PI).step(0.001)
fsl.add(spotLight, 'penumbra').min(0).max(1).step(0.001)
fsl.add(spotLight, 'decay').min(0).max(1).step(0.001)
fsl.add(spotLight.target.position, 'x').min(-1).max(1).step(0.001).name('X target')
fsl.add(spotLight.target.position, 'y').min(-1).max(1).step(0.001).name('Y target')
fsl.add(spotLight.target.position, 'z').min(-1).max(1).step(0.001).name('Z target')



/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65

scene.add(sphere, cube, torus, plane)

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

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()