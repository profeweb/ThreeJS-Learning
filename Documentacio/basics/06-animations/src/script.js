import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

// Canvas
const canvas = document.querySelector('canvas#webgl')

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
//

/**
 * Opcions d'Animació (Date, Clock, GSAP)
 */

// Opció DATE  (tick1)

let time = Date.now()

const tick1 = () =>
{
    console.log('tick')

    // Time
    const currentTime = Date.now()
    const deltaTime = currentTime - time
    time = currentTime

    // Update objectes
    mesh.rotation.y += 0.001 * deltaTime

    // Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick1)
}

//tick1()


// Opció THREE.Clock (tick2)

const clock = new THREE.Clock()

const tick2 = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objectes
    mesh.rotation.y = elapsedTime * Math.PI

    // Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick2)
}

//tick2()

// Opció 3 Llibreria GSAP (tick3)
// npm install --save gsap

gsap.to(mesh.position, { duration: 1, delay: 1, x: 2 })
gsap.to(mesh.position, { duration: 1, delay: 2, x: 0 })

const tick3 = () =>
{

    // Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick3)
}

tick3()