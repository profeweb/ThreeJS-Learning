 import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

 // (1) Importar la llibreria Cannon.js
 import CANNON from 'cannon'

 // (1.1) Testeam la importació
 console.log(CANNON)

/**
 * Debug
 */
const gui = new dat.GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

 // (2) Entorn Físic (CANNON.JS) //////////////////////////////////////////////

 // (2.1) Món físic amb gravetat (World)
 const world = new CANNON.World()
 world.gravity.set(0, -9.82, 0)

 // (4) Materials del món físic

 // (4.1) Materials Ciment i Pàstic
 const concreteMaterial = new CANNON.Material('concrete')
 const plasticMaterial  = new CANNON.Material('plastic')

 const concretePlasticContactMaterial = new CANNON.ContactMaterial(
     concreteMaterial,
     plasticMaterial,
     {
         friction: 0.1,
         restitution: 0.7
     }
 )

 world.addContactMaterial(concretePlasticContactMaterial)

 // (4.2) Material per Defecte
 const defaultMaterial = new CANNON.Material('default')
 const defaultContactMaterial = new CANNON.ContactMaterial(
     defaultMaterial,
     defaultMaterial,
     {
         friction: 0.1,
         restitution: 0.7
     }
 )
 world.addContactMaterial(defaultContactMaterial)

 // (4.3) Opció simple més simple, aplicar a tot el mateix material)
 world.defaultContactMaterial = defaultContactMaterial


 // (2.2) Afegir objectes (Body + Shape) dins el món físic (World)
 const sphereShape = new CANNON.Sphere(0.5)
 const sphereBody = new CANNON.Body({
     mass: 1,
     position: new CANNON.Vec3(0,3, 0),
     shape: sphereShape,
     //material: plasticMaterial
     //material: defaultMaterial
 })
 world.addBody(sphereBody)

 // (3) Afegir el terra al món físic
 const floorShape = new CANNON.Plane()
 const floorBody = new CANNON.Body()
 floorBody.mass = 0
 //floorBody.material = concreteMaterial
 //floorBody.material = defaultMaterial
 floorBody.addShape(floorShape)
 floorBody.quaternion.setFromAxisAngle(
     new CANNON.Vec3(1,0,0),
     -Math.PI*0.5
 )
 world.addBody(floorBody)

// (5) Aplicar forces ////////////////////////////////

 //(5.1) Aplicar puntualment una força a l'esfera
sphereBody.applyLocalForce(
    new CANNON.Vec3(150, 0, 0),
    new CANNON.Vec3(0,0,0)
)

/**
 * Test sphere
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
sphere.castShadow = true
sphere.position.y = 0.5
scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
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
camera.position.set(- 3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
 let oldElapsedTime = 0

const tick = () =>
{
    // Temps entre fotogrames consecutius
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime
    //console.log(deltaTime)

    // (5.2) Aplicar força per frenar l'esfera (vent)
    sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position)

    // (2.3) Update Món Físic
    world.step(1/60, deltaTime, 3)
    console.log(sphereBody.position.y)

    // (2.4) Update objectes ThreeJS d'acord amb CannonJS
    sphere.position.copy(sphereBody.position)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Crida a tick a cada frame
    window.requestAnimationFrame(tick)
}

tick()