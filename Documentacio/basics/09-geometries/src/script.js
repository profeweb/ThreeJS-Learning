import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Escena
const scene = new THREE.Scene()

/////////////////////////////////////////////////////////////////////////////////////////////

// 3 Objecte(s):

// (1) BoxGeometry
const geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1)
//const geometry = new THREE.SphereGeometry(1, 32, 8)
const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe:true
})
const mesh = new THREE.Mesh(geometry, material)
mesh.position.x = -2
scene.add(mesh)

// (2)  Geometria a partir d'un Array (Triangle)
const geometry2 = new THREE.BufferGeometry()
/*
const positionsArray = new Float32Array(9)

positionsArray[0] = 0
positionsArray[1] = 0
positionsArray[2] = 0

positionsArray[3] = 0
positionsArray[4] = 1
positionsArray[5] = 0

positionsArray[6] = 1
positionsArray[7] = 0
positionsArray[8] = 0
 */
const positionsArray = new Float32Array([
    0, 0, 0,
    0, 1, 0,
    1, 0, 0,
])

const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3)
geometry2.setAttribute('position', positionsAttribute)
const mesh2 = new THREE.Mesh(geometry2, material)
scene.add(mesh2)

// (3) Geometria a partir de 50 triangles (3 vertexos , 3 coordenades)
const geometry3 = new THREE.BufferGeometry()
const count = 50 * 3 * 3;
const positionsArray3 = new Float32Array(count)
for(let i=0; i<count; i++){
    positionsArray3[i] = Math.random()
}
const positionsAttribute3 = new THREE.BufferAttribute(positionsArray3, 3)
geometry3.setAttribute('position', positionsAttribute3)
const mesh3 = new THREE.Mesh(geometry3, material)
mesh3.position.x = 2
scene.add(mesh3)

//////////////////////////////////////////////////////////////////////////////////////

// Mides
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Redimensionar finestra
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

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Animació
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objectes
    // ...

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Crida a tick en el proper frame
    window.requestAnimationFrame(tick)
}

tick()