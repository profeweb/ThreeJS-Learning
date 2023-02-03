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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

///////////////////////////////////////////////////////////////////////////
// (1) Particles (Geometria + Material)

//const particlesGeometry = new THREE.SphereBufferGeometry(1, 32, 32)
//const particlesGeometry = new THREE.BoxBufferGeometry(2, 2, 2, 3, 3, 3)

const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.size = 0.1
particlesMaterial.sizeAttenuation = true

// (2) Custom Geometry
const particlesGeometry = new THREE.BufferGeometry()
const count = 50000
const positions = new Float32Array(count*3)
for(let i=0; i<count*3; i++){
    positions[i] = (Math.random() - 0.5)*10
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
console.log(particlesGeometry.attributes.position.array)

// (3) Color
//particlesMaterial.color = new THREE.Color('red')

// (4) Textura
const particleTexture = textureLoader.load('/textures/particles/1.png')
//particlesMaterial.map = particleTexture
particlesMaterial.transparent = true
particlesMaterial.alphaMap = particleTexture


// (5) AlphaTest
//particlesMaterial.alphaTest = 0.01

// (6) DepthTest
//particlesMaterial.depthTest = false

// (7) DepthWrite
particlesMaterial.depthWrite = false

// (8) Blending
particlesMaterial.blending = THREE.AdditiveBlending

// (9) Colors diferents
const colors = new Float32Array(count*3)
for(let i=0; i<count*3; i++){
    colors[i] = Math.random()
}
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
particlesMaterial.vertexColors = true

console.log(particlesGeometry.attributes.color.array)

// Objectes
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Test cube
 */
/*
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
)
scene.add(cube)
*/
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

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // (10) Update particles ///////////////////////////////////

    // (10a) Rotació Y
    //particles.rotation.y = elapsedTime*0.2

    // (10b) Descens (Posició Y)
    //particles.positio.y = -elapsedTime * 0.02

    // (10c) Array de l'atribut posicions
    for(let i=0; i<count; i++){
        const i3 = i*3
        const x = particlesGeometry.attributes.position.array[i3]
        particlesGeometry.attributes.position.array[i3+1] = Math.sin(elapsedTime + x)
    }
    particlesGeometry.attributes.position.needsUpdate = true

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()