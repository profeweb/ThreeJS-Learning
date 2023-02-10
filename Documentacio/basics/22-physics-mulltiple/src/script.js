 import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

 // (1) Importar la llibreria Cannon.js
 import CANNON from 'cannon'

/**
 * Debug
 */
const gui = new dat.GUI()

 const debugObject = { }
 debugObject.createSphere = ()=>{
    console.log('Nova Esfera')
     createSphere(
         Math.random()* 0.5,
         {
             x: (Math.random() - 0.5) * 3,
             y: 3,
             z:(Math.random() - 0.5) * 3,
         },
         debugObject.initialForce
     )
 }
 gui.add(debugObject, 'createSphere')

 debugObject.createBox = ()=>{
     console.log('Nova Capsa')
     createBox(
         Math.random(),
         Math.random(),
         Math.random(),
         {
             x: (Math.random() - 0.5) * 3,
             y: 3,
             z:(Math.random() - 0.5) * 3,
         })
 }
 gui.add(debugObject, 'createBox')

 debugObject.reset = ()=>{
    console.log(`RESET`)
     for(const object of objectsToUpdate){

         // Remove body
         object.body.removeEventListener('collide', playHitSound)
         world.removeBody(object.body)

         // Remove mesh
         scene.remove(object.mesh)
     }

     objectsToUpdate.splice(0, objectsToUpdate.length)
 }
gui.add(debugObject, 'reset')

 const gf = gui.addFolder('Gravity')
 debugObject.gravity = { x: 0, y:-9.81, z:0}
 gf.add(debugObject.gravity, 'x').min(-10).max(10).step(0.1).name('X Gravity').onFinishChange(()=>{
     world.gravity.set(debugObject.gravity.x, debugObject.gravity.y, debugObject.gravity.z)
 })
 gf.add(debugObject.gravity, 'y').min(-10).max(10).step(0.1).name('Y Gravity').onFinishChange(()=>{
     world.gravity.set(debugObject.gravity.x, debugObject.gravity.y, debugObject.gravity.z)
 })
 gf.add(debugObject.gravity, 'z').min(-10).max(10).step(0.1).name('Z Gravity').onFinishChange(()=>{
     world.gravity.set(debugObject.gravity.x, debugObject.gravity.y, debugObject.gravity.z)
 })



 const iff = gui.addFolder('Initial Force')
 debugObject.initialForce = { x: 0, y:0, z:0}
 iff.add(debugObject.initialForce, 'x').min(-1000).max(1000).step(0.1).name('X Dir')
 iff.add(debugObject.initialForce, 'y').min(-1000).max(1000).step(0.1).name('Y Dir')
 iff.add(debugObject.initialForce, 'z').min(-1000).max(1000).step(0.1).name('Z Dir')



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
 world.gravity.set(debugObject.gravity.x, debugObject.gravity.y, debugObject.gravity.z)

 // (2.3) Materials del món físic

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
 world.defaultContactMaterial = defaultContactMaterial

 const cmf = gui.addFolder('Contact Material')
 cmf.add(defaultContactMaterial, 'friction').min(0).max(1).step(0.001).onFinishChange((value)=>{
     defaultContactMaterial.friction = value
 })
 cmf.add(defaultContactMaterial, 'restitution').min(0).max(1).step(0.001).onFinishChange((value)=>{
     defaultContactMaterial.restitution = value
 })


 // (2.4) Afegir el terra al món físic
 const floorShape = new CANNON.Plane()
 const floorBody = new CANNON.Body()
 floorBody.mass = 0
 floorBody.addShape(floorShape)
 floorBody.quaternion.setFromAxisAngle(
     new CANNON.Vec3(1,0,0),
     -Math.PI*0.5
 )
 world.addBody(floorBody)

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

 // (3) Creació d'Esferes dinàmiques

 // (3.3) Array d'objectes dek món físic
 const objectsToUpdate = []

// (3.5) Extreure constant del bucle
const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
     metalness: 0.3,
     roughness: 0.4,
     envMap: environmentMapTexture
 })

 // (3.1) Definició de la funció
 const createSphere = (radius, position, force)=>{

    // Mesh (Geometry + Material) de THREE.JS
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
     mesh.scale.set(radius, radius, radius)
     mesh.castShadow = true
     mesh.position.copy(position)
     scene.add(mesh)

     // Objecte (Body + Sphere) de CANNON.JS
     const shape = new CANNON.Sphere(radius)
     const body = new CANNON.Body({
         mass: 1,
         position: new CANNON.Vec3(0, 0, 0),
         shape,
         material: defaultMaterial
     })
     body.position.copy(position)
     body.applyLocalForce(new CANNON.Vec3(force.x, force.y, force.z), new CANNON.Vec3(0,0,0))
     // Listener de l'event collide
     body.addEventListener('collide', playHitSound)
     world.addBody(body)

     objectsToUpdate.push({
         mesh: mesh,
         body: body
     })
 }

 // (3.4) Test de l'array
 console.log(objectsToUpdate)

 // (4) Crear capses

 // (4.1) Geometria i material de les capses
 const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
 const boxMaterial = new THREE.MeshStandardMaterial({
     metalness: 0.3,
     roughness: 0.4,
     envMap: environmentMapTexture
 })

 // (4.2) Definició de la funció per crear capses
 const createBox = (width, height, depth, position)=>{

     // Mesh (Geometry + Material) de THREE.JS
     const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
     mesh.scale.set(width, height, depth)
     mesh.castShadow = true
     mesh.position.copy(position)
     scene.add(mesh)

     // Objecte (Body + Box) de CANNON.JS
     const shape = new CANNON.Box( new CANNON.Vec3(width/2, height/2, depth/2))
     const body = new CANNON.Body({
         mass: 1,
         position: new CANNON.Vec3(0, 3, 0),
         shape,
         material: defaultMaterial
     })
     body.position.copy(position)
     // Listener de l'event collide
     body.addEventListener('collide', playHitSound)
     world.addBody(body)

     objectsToUpdate.push({
         mesh: mesh,
         body: body
     })
 }

 // (5) Optimització ////////////////////////////////
 // (5.1) Broadphase
 world.broadphase = new CANNON.SAPBroadphase(world)

 // (5.2) Sleep
 world.allowSleep = true

 debugObject.allowSleep = true
 gf.add(debugObject, 'allowSleep').onChange( (value)=>{
     world.allowSleep = value
     for(const object of objectsToUpdate){
         object.body.wakeUp()
     }
 })

 // (6) EVENTS /////////////////////////////////////

 // (6.1) Audio a reproduir en cas de Col·lisions

 const hitSound = new Audio('sounds/hit.mp3')

 const playHitSound = (collision)=> {

     console.log(collision.contact.getImpactVelocityAlongNormal())

     const impactStrength = collision.contact.getImpactVelocityAlongNormal()

     if(impactStrength>1.5 && !hitSound.isPlaying) {
         hitSound.volume = Math.random()
         hitSound.currentTime = 0
         hitSound.play()
     }
 }


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
camera.position.set(0, 3, 3)
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

    // (2.2) Update Món Físic
    world.step(1/60, deltaTime, 3)

    // Update dels objectes
    for(const object of objectsToUpdate){
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Crida a tick a cada frame
    window.requestAnimationFrame(tick)
}

tick()