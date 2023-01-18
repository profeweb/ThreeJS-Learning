import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import * as dat from 'lil-gui'

///////////////////////////////////////////////////////////////////////////////////////

// Test LIL.gui
console.log(dat)

// Instancia dat.gui
const gui = new dat.GUI()

// Objecte parametres de tweaking
const parameters = {
    color: 0xff00ff,
    spin: ()=>{
        console.log('SPIN')
        gsap.to(mesh.rotation,{duration: 1, y: mesh.rotation.y +  Math.PI/2})
    }
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Escena
const scene = new THREE.Scene()

// Objecte
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: parameters.color })
const mesh = new THREE.Mesh(geometry, material)
mesh.visible = true
material.wireframe = false
console.log(material.color)
scene.add(mesh)

// Afegir controls a dat.gui
// Rang
gui.add(mesh.position,'x', -3, 3, 0.01)
gui.add(mesh.position,'y').min(-3).max(3).step(0.01).name('ALTURA')
gui.add(mesh.position,'z', -3, 3, 0.01)

// Booleans
gui.add(mesh, 'visible')
gui.add(material, 'wireframe')

// Color
gui.addColor(parameters, 'color')
    .onChange( ()=>{
        material.color.set(parameters.color)
    })

// Botó d'acció
gui.add(parameters, 'spin')

///////////////////////////////////////////////////////////////////////////////////////

// Mides
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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()